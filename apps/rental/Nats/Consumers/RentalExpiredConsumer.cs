using NATS.Client.Core;
using rental.Nats.Base;
using rental.Repository;
using Microsoft.EntityFrameworkCore;
using RentalEntity = rental.Model.Entities.Rental;

namespace rental.Nats.Consumers
{
    /// <summary>
    /// Consumer to handle payment-expired events from Payment service
    /// When payment expires after 15 minutes without being paid:
    /// - Payment service sends booking-expired event with id = rentalId (for rental payments)
    /// - This consumer receives the event and updates rental status to EXPIRED
    /// </summary>
    public class RentalExpiredConsumer : NatsConsumerBase<RentalExpiredEvent>
    {
        protected override string ConsumerName => "rental-service-payment-expired";
        protected override string FilterSubject => "journey.events.booking-expired";

        public RentalExpiredConsumer(
            NatsConnection natsConnection,
            IServiceProvider serviceProvider,
            ILogger<RentalExpiredConsumer> logger)
            : base(natsConnection, serviceProvider, logger)
        {
        }

        protected override async Task HandleEventAsync(RentalExpiredEvent expiredEvent, CancellationToken cancellationToken)
        {
            Logger.LogInformation("[Rental] Received payment-expired event with Id: {Id}", expiredEvent.Id);

            using var scope = ServiceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<rental.Data.RentalDbContext>();

            try
            {
                // The Id in the event is the rentalId (payment sends bookingId or rentalId as id)
                if (!Guid.TryParse(expiredEvent.Id, out var rentalId))
                {
                    // Not a valid GUID, this is probably a booking (integer ID), skip
                    Logger.LogDebug("[Rental] Event Id '{Id}' is not a valid Guid, likely a booking, skipping", expiredEvent.Id);
                    return;
                }

                Logger.LogInformation("[Rental] Processing rental expiration for RentalId: {RentalId}", rentalId);

                // Find rental by ID
                var rentalEntity = await context.Set<RentalEntity>()
                    .FirstOrDefaultAsync(r => r.Id == rentalId, cancellationToken);

                if (rentalEntity == null)
                {
                    Logger.LogDebug("[Rental] Rental not found for ID {RentalId}, likely a booking, skipping", rentalId);
                    return;
                }

                // Only expire if still pending payment
                if (rentalEntity.Status != rental.Model.Entities.RentalStatus.PENDING)
                {
                    Logger.LogWarning("[Rental] Rental {RentalId} is not pending (current status: {Status}), skipping expiration", rentalId, rentalEntity.Status);
                    return;
                }

                // Update rental status to EXPIRED
                rentalEntity.Status = rental.Model.Entities.RentalStatus.EXPIRED;
                await context.SaveChangesAsync(cancellationToken);

                Logger.LogInformation("[Rental] Successfully expired rental {RentalId} due to payment timeout", rentalId);

                // Note: Quantity was never decreased for pending rentals, so no need to restore
                // Devices/combos remain available for other users
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "[Rental] Failed to handle payment-expired event for Id {Id}", expiredEvent.Id);
                throw;
            }
        }
    }

    public class RentalExpiredEvent
    {
        public string Id { get; set; } = string.Empty;
    }
}
