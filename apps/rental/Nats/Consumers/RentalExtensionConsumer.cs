using NATS.Client.Core;
using rental.Nats.Base;
using Microsoft.EntityFrameworkCore;
using RentalEntity = rental.Model.Entities.Rental;
using Payment;

namespace rental.Nats.Consumers
{
    /// <summary>
    /// Consumer to handle rental-extension payment events from Payment service
    /// Updates extension and rental when extension payment is confirmed
    /// Only processes APPROVED extensions that have been paid
    /// Receives payment.id from Payment service, queries to get rentalId
    /// </summary>
    public class RentalExtensionConsumer : NatsConsumerBase<RentalExtensionEvent>
    {
        protected override string ConsumerName => "rental-extension-consumer";
        protected override string FilterSubject => "journey.events.rental-extension";

        private readonly Payment.PaymentService.PaymentServiceClient _paymentClient;

        public RentalExtensionConsumer(
            NatsConnection natsConnection,
            IServiceProvider serviceProvider,
            ILogger<RentalExtensionConsumer> logger,
            Payment.PaymentService.PaymentServiceClient paymentClient)
            : base(natsConnection, serviceProvider, logger)
        {
            _paymentClient = paymentClient;
        }

        protected override async Task HandleEventAsync(RentalExtensionEvent extensionEvent, CancellationToken cancellationToken)
        {
            Logger.LogInformation("[Rental] Received rental-extension payment event for PaymentId: {PaymentId}", extensionEvent.Id);

            using var scope = ServiceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<rental.Data.RentalDbContext>();

            try
            {
                // Parse payment ID from event
                if (!Guid.TryParse(extensionEvent.Id, out var paymentId))
                {
                    Logger.LogError("[Rental] Invalid payment ID format: {PaymentId}", extensionEvent.Id);
                    return;
                }

                // Query Payment service to get rentalId
                var paymentRequest = new GetPaymentAdminRequest { Id = extensionEvent.Id };
                var paymentResponse = await _paymentClient.GetPaymentAdminAsync(paymentRequest, cancellationToken: cancellationToken);

                if (string.IsNullOrEmpty(paymentResponse.RentalId))
                {
                    Logger.LogWarning("[Rental] Payment {PaymentId} is not for a rental extension (no rentalId)", paymentId);
                    return;
                }

                if (!Guid.TryParse(paymentResponse.RentalId, out var rentalId))
                {
                    Logger.LogError("[Rental] Invalid rental ID format from payment: {RentalId}", paymentResponse.RentalId);
                    return;
                }

                // Find the most recent APPROVED extension for this rental (waiting for payment)
                var extension = await context.Set<rental.Model.Entities.RentalExtension>()
                    .Where(e => e.RentalId == rentalId && e.Status == rental.Model.Entities.ExtensionStatus.APPROVED)
                    .OrderByDescending(e => e.CreatedAt)
                    .FirstOrDefaultAsync(cancellationToken);

                if (extension == null)
                {
                    Logger.LogWarning("[Rental] No approved extension waiting for payment found for rental {RentalId}", rentalId);
                    return;
                }

                // Find the rental to update EndDate
                var rentalEntity = await context.Set<RentalEntity>()
                    .FirstOrDefaultAsync(r => r.Id == rentalId, cancellationToken);

                if (rentalEntity == null)
                {
                    Logger.LogWarning("[Rental] Rental not found: {RentalId}", rentalId);
                    return;
                }

                // Update rental EndDate with the new extended date
                if (extension.NewEndDate.HasValue)
                {
                    rentalEntity.EndDate = extension.NewEndDate.Value;
                    Logger.LogInformation("[Rental] Extended rental {RentalId} EndDate to {NewEndDate}",
                        rentalId, extension.NewEndDate.Value);
                }

                await context.SaveChangesAsync(cancellationToken);

                Logger.LogInformation("[Rental] Successfully processed extension payment for rental {RentalId}, ExtensionId: {ExtensionId}",
                    rentalId, extension.Id);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "[Rental] Failed to handle rental-extension payment event for rental {RentalId}", extensionEvent.Id);
                throw;
            }
        }
    }

    public class RentalExtensionEvent
    {
        public string Id { get; set; } = string.Empty;
    }
}
