using NATS.Client.Core;
using rental.Nats.Base;
using rental.Repository;
using Microsoft.EntityFrameworkCore;
using RentalEntity = rental.Model.Entities.Rental;

namespace rental.Nats.Consumers
{
    /// <summary>
    /// Consumer to handle rental-expired events from Payment service
    /// Cancels rental when payment expires after 15 minutes
    /// </summary>
    public class RentalExpiredConsumer : NatsConsumerBase<RentalExpiredEvent>
    {
        protected override string ConsumerName => "rental-expired-consumer";
        protected override string FilterSubject => "journey.events.rental-expired";

        public RentalExpiredConsumer(
            NatsConnection natsConnection,
            IServiceProvider serviceProvider,
            ILogger<RentalExpiredConsumer> logger)
            : base(natsConnection, serviceProvider, logger)
        {
        }

        protected override async Task HandleEventAsync(RentalExpiredEvent expiredEvent, CancellationToken cancellationToken)
        {
            Logger.LogInformation("[Rental] Received rental-expired event for RentalId: {RentalId}", expiredEvent.Id);

            using var scope = ServiceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<rental.Data.RentalDbContext>();

            try
            {
                // Parse rental ID from event (comes as string from TypeScript)
                if (!Guid.TryParse(expiredEvent.Id, out var rentalId))
                {
                    Logger.LogError("[Rental] Invalid rental ID format: {RentalId}", expiredEvent.Id);
                    return;
                }

                // Find rental by ID
                var rentalEntity = await context.Set<RentalEntity>()
                    .FirstOrDefaultAsync(r => r.Id == rentalId, cancellationToken);

                if (rentalEntity == null)
                {
                    Logger.LogWarning("[Rental] Rental not found for ID {RentalId}", rentalId);
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

                Logger.LogInformation("[Rental] Successfully expired rental {RentalId}", rentalId);

                // Note: Quantity was never decreased for pending rentals, so no need to restore
                // Devices/combos remain available for other users
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "[Rental] Failed to handle rental-expired event for rental {RentalId}", expiredEvent.Id);
                throw;
            }
        }
    }

    public class RentalExpiredEvent
    {
        public string Id { get; set; } = string.Empty;
    }
}
