using NATS.Client.Core;
using rental.Nats.Base;
using rental.Nats.Events;
using rental.Model.Entities;
using Microsoft.EntityFrameworkCore;

namespace rental.Nats.Consumers
{
    /// <summary>
    /// Consumer to handle payment confirmation events for rentals
    /// Listens to journey.events.rental-paid subject (from payment service)
    /// Updates rental status when deposit payment is confirmed
    /// </summary>
    public class PaymentRentalConsumer : NatsConsumerBase<RentalCreatedEvent>
    {
        protected override string ConsumerName => "rental-payment-confirmed";
        protected override string FilterSubject => "journey.events.rental-paid";

        public PaymentRentalConsumer(
            NatsConnection natsConnection,
            IServiceProvider serviceProvider,
            ILogger<PaymentRentalConsumer> logger)
            : base(natsConnection, serviceProvider, logger)
        {
        }

        protected override async Task HandleEventAsync(RentalCreatedEvent paymentEvent, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(paymentEvent.RentalId))
            {
                Logger.LogWarning("[Rental] Received rental-paid event without RentalId");
                return;
            }

            Logger.LogInformation(
                "[Rental] Received rental-paid event for RentalId: {RentalId}, Amount: {Amount}",
                paymentEvent.RentalId, paymentEvent.Deposit);

            using var scope = ServiceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<rental.Data.RentalDbContext>();

            if (!Guid.TryParse(paymentEvent.RentalId, out var rentalId))
            {
                Logger.LogWarning("[Rental] Invalid RentalId: {RentalId}", paymentEvent.RentalId);
                return;
            }

            try
            {
                var rental = await context.Set<rental.Model.Entities.Rental>()
                    .FirstOrDefaultAsync(r => r.Id == rentalId, cancellationToken);

                if (rental == null)
                {
                    Logger.LogWarning("[Rental] Rental not found: {RentalId}", rentalId);
                    return;
                }

                if (rental.Status == RentalStatus.PENDING)
                {
                    rental.Status = RentalStatus.DEPOSIT_PAID;
                    await context.SaveChangesAsync(cancellationToken);
                    Logger.LogInformation("[Rental] Updated status to DEPOSIT_PAID for Rental {RentalId}", rentalId);
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "[Rental] Failed to handle payment for Rental {RentalId}", rentalId);
                throw;
            }
        }
    }
}
