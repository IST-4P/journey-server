using NATS.Client.Core;
using device.Nats.Base;
using device.Interface;
using Microsoft.EntityFrameworkCore;

namespace device.Nats.Consumers
{
    /// <summary>
    /// Consumer to handle rental-quantity-change events from Rental service
    /// Updates device quantities based on rental status changes
    /// Note: Combo quantity management not yet implemented in Device service
    /// </summary>
    public class RentalQuantityChangeConsumer : NatsConsumerBase<RentalQuantityChangeEvent>
    {
        protected override string ConsumerName => "device-rental-quantity-change";
        protected override string FilterSubject => "journey.events.rental-quantity-change";

        public RentalQuantityChangeConsumer(
            NatsConnection natsConnection,
            IServiceProvider serviceProvider,
            ILogger<RentalQuantityChangeConsumer> logger)
            : base(natsConnection, serviceProvider, logger)
        {
        }

        protected override async Task HandleEventAsync(RentalQuantityChangeEvent changeEvent, CancellationToken cancellationToken)
        {
            Logger.LogInformation("[Device] Received rental-quantity-change event for Rental {RentalId}, Action: {Action}",
                changeEvent.RentalId, changeEvent.Action);

            using var scope = ServiceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<device.Data.DeviceDbContext>();

            try
            {
                foreach (var item in changeEvent.Items)
                {
                    if (!Guid.TryParse(item.TargetId, out var targetId))
                    {
                        Logger.LogError("[Device] Invalid target ID format: {TargetId}", item.TargetId);
                        continue;
                    }

                    if (item.IsCombo)
                    {
                        Logger.LogWarning("[Device] Combo quantity management not yet implemented, skipping combo {ComboId}", targetId);
                        continue;
                    }

                    await UpdateDeviceQuantity(context, targetId, item.Quantity, changeEvent.Action, cancellationToken);
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "[Device] Failed to handle rental-quantity-change event for rental {RentalId}", changeEvent.RentalId);
                throw;
            }
        }

        private async Task UpdateDeviceQuantity(device.Data.DeviceDbContext context, Guid deviceId, int quantity, string action, CancellationToken cancellationToken)
        {
            var deviceEntity = await context.Set<device.Model.Entities.Device>()
                .FirstOrDefaultAsync(d => d.Id == deviceId, cancellationToken);

            if (deviceEntity == null)
            {
                Logger.LogWarning("[Device] Device not found: {DeviceId}", deviceId);
                return;
            }

            if (action == "DECREASE")
            {
                if (deviceEntity.Quantity < quantity)
                {
                    Logger.LogWarning("[Device] Insufficient quantity for device {DeviceId}. Available: {Available}, Requested: {Requested}",
                        deviceId, deviceEntity.Quantity, quantity);
                    return;
                }

                deviceEntity.Quantity -= quantity;
                Logger.LogInformation("[Device] Decreased device {DeviceId} quantity by {Quantity}. New quantity: {NewQuantity}",
                    deviceId, quantity, deviceEntity.Quantity);
            }
            else if (action == "INCREASE")
            {
                deviceEntity.Quantity += quantity;
                Logger.LogInformation("[Device] Increased device {DeviceId} quantity by {Quantity}. New quantity: {NewQuantity}",
                    deviceId, quantity, deviceEntity.Quantity);
            }

            await context.SaveChangesAsync(cancellationToken);
        }
    }

    public class RentalQuantityChangeEvent
    {
        public string RentalId { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty; // "DECREASE" or "INCREASE"
        public List<QuantityChangeItem> Items { get; set; } = new();
        public DateTime ChangedAt { get; set; }
    }

    public class QuantityChangeItem
    {
        public string TargetId { get; set; } = string.Empty;
        public bool IsCombo { get; set; }
        public int Quantity { get; set; }
    }
}
