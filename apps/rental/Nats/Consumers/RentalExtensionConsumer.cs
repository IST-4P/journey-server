using NATS.Client.Core;
using rental.Nats.Base;
using Microsoft.EntityFrameworkCore;

namespace rental.Nats.Consumers
{
    /// <summary>
    /// Consumer to handle rental-extension events from Payment service
    /// Updates rental extension status when payment is confirmed
    /// </summary>
    public class RentalExtensionConsumer : NatsConsumerBase<RentalExtensionEvent>
    {
        protected override string ConsumerName => "rental-extension-consumer";
        protected override string FilterSubject => "journey.events.rental-extension";

        public RentalExtensionConsumer(
            NatsConnection natsConnection,
            IServiceProvider serviceProvider,
            ILogger<RentalExtensionConsumer> logger)
            : base(natsConnection, serviceProvider, logger)
        {
        }

        protected override async Task HandleEventAsync(RentalExtensionEvent extensionEvent, CancellationToken cancellationToken)
        {
            Logger.LogInformation("[Rental] Received rental-extension event for RentalId: {RentalId}", extensionEvent.Id);

            using var scope = ServiceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<rental.Data.RentalDbContext>();

            try
            {
                // Parse rental ID from event (comes as string from TypeScript)
                if (!Guid.TryParse(extensionEvent.Id, out var rentalId))
                {
                    Logger.LogError("[Rental] Invalid rental ID format: {RentalId}", extensionEvent.Id);
                    return;
                }

                // Find most recent pending extension for this rental
                var extension = await context.Set<rental.Model.Entities.RentalExtension>()
                    .Where(e => e.RentalId == rentalId && e.Status == rental.Model.Entities.ExtensionStatus.PENDING)
                    .OrderByDescending(e => e.CreatedAt)
                    .FirstOrDefaultAsync(cancellationToken);

                if (extension == null)
                {
                    Logger.LogWarning("[Rental] No pending extension found for rental {RentalId}", rentalId);
                    return;
                }

                // Update extension status to APPROVED
                extension.Status = rental.Model.Entities.ExtensionStatus.APPROVED;
                await context.SaveChangesAsync(cancellationToken);

                Logger.LogInformation("[Rental] Approved extension {ExtensionId} for rental {RentalId}",
                    extension.Id, rentalId);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "[Rental] Failed to handle rental-extension event for rental {RentalId}", extensionEvent.Id);
                throw;
            }
        }
    }

    public class RentalExtensionEvent
    {
        public string Id { get; set; } = string.Empty;
    }
}
