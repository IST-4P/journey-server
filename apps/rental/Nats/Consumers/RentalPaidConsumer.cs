using NATS.Client.Core;
using rental.Nats.Base;
using rental.Nats.Events;
using Microsoft.EntityFrameworkCore;
using RentalEntity = rental.Model.Entities.Rental;

namespace rental.Nats.Consumers
{
    /// <summary>
    /// Consumer to handle rental-paid events from Payment service
    /// Updates rental status and publishes quantity change event for Device service
    /// </summary>
    public class RentalPaidConsumer : NatsConsumerBase<RentalPaidEvent>
    {
        protected override string ConsumerName => "rental-paid-consumer";
        protected override string FilterSubject => "journey.events.rental-paid";

        public RentalPaidConsumer(
            NatsConnection natsConnection,
            IServiceProvider serviceProvider,
            ILogger<RentalPaidConsumer> logger)
            : base(natsConnection, serviceProvider, logger)
        {
        }

        protected override async Task HandleEventAsync(RentalPaidEvent paidEvent, CancellationToken cancellationToken)
        {
            Logger.LogInformation("[Rental] Received rental-paid event for RentalId: {RentalId}", paidEvent.Id);

            using var scope = ServiceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<rental.Data.RentalDbContext>();

            try
            {
                // Parse rental ID from event (comes as string from TypeScript)
                if (!Guid.TryParse(paidEvent.Id, out var rentalId))
                {
                    Logger.LogError("[Rental] Invalid rental ID format: {RentalId}", paidEvent.Id);
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

                // Only process if still pending payment
                if (rentalEntity.Status != rental.Model.Entities.RentalStatus.PENDING)
                {
                    Logger.LogWarning("[Rental] Rental {RentalId} is not pending (current status: {Status}), skipping payment processing", rentalId, rentalEntity.Status);
                    return;
                }

                // Update rental status to DEPOSIT_PAID
                rentalEntity.Status = rental.Model.Entities.RentalStatus.DEPOSIT_PAID;
                await context.SaveChangesAsync(cancellationToken);

                Logger.LogInformation("[Rental] Updated rental {RentalId} status to DEPOSIT_PAID", rentalEntity.Id);

                // Publish event to Device service to decrease quantity
                var items = System.Text.Json.JsonSerializer.Deserialize<List<RentalItemData>>(rentalEntity.Items);
                if (items != null && items.Count > 0)
                {
                    var publisher = scope.ServiceProvider.GetRequiredService<rental.Nats.NatsPublisher>();

                    var quantityChangeEvent = new RentalQuantityChangeEvent
                    {
                        RentalId = rentalEntity.Id.ToString(),
                        Action = "DECREASE",
                        Items = items.Select(item => new QuantityChangeItem
                        {
                            TargetId = item.TargetId,
                            IsCombo = item.IsCombo,
                            Quantity = item.Quantity
                        }).ToList(),
                        ChangedAt = DateTime.UtcNow
                    };

                    await publisher.PublishAsync("journey.events.rental-quantity-change", quantityChangeEvent);
                    Logger.LogInformation("[Rental] Published quantity decrease event for rental {RentalId}", rentalEntity.Id);
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "[Rental] Failed to handle rental-paid event for rental {RentalId}", paidEvent.Id);
                throw;
            }
        }
    }

    public class RentalPaidEvent
    {
        public string Id { get; set; } = string.Empty;
    }

    public class RentalItemData
    {
        public string TargetId { get; set; } = string.Empty;
        public bool IsCombo { get; set; }
        public int Quantity { get; set; }
    }
}
