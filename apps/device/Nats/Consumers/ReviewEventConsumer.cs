using NATS.Client.Core;
using device.Nats.Events;
using device.Interface;
using device.Nats.Base;

namespace device.Nats.Consumers
{
    /// <summary>
    /// Consumer to handle review.created events from Review service
    /// Updates device with ReviewId when a review is created
    /// </summary>
    public class ReviewEventConsumer : NatsConsumerBase<ReviewCreatedEvent>
    {
        protected override string ConsumerName => "device-review-created";
        protected override string FilterSubject => "journey.events.review.created";

        public ReviewEventConsumer(
            NatsConnection natsConnection,
            IServiceProvider serviceProvider,
            ILogger<ReviewEventConsumer> logger)
            : base(natsConnection, serviceProvider, logger)
        {
        }

        protected override async Task HandleEventAsync(ReviewCreatedEvent reviewEvent, CancellationToken cancellationToken)
        {
            // Skip if neither DeviceId nor ComboId is present
            if (string.IsNullOrEmpty(reviewEvent.DeviceId) && string.IsNullOrEmpty(reviewEvent.ComboId))
            {
                Logger.LogInformation("[Device] Skipping review event - no DeviceId or ComboId");
                return;
            }

            if (!Guid.TryParse(reviewEvent.ReviewId, out var reviewId))
            {
                Logger.LogWarning("[Device] Invalid ReviewId: {ReviewId}", reviewEvent.ReviewId);
                return;
            }

            using var scope = ServiceProvider.CreateScope();

            // Handle Device review
            if (!string.IsNullOrEmpty(reviewEvent.DeviceId))
            {
                Logger.LogInformation(
                    "[Device] Received review.created for DeviceId: {DeviceId}, ReviewId: {ReviewId}",
                    reviewEvent.DeviceId, reviewEvent.ReviewId);

                if (!Guid.TryParse(reviewEvent.DeviceId, out var deviceId))
                {
                    Logger.LogWarning("[Device] Invalid DeviceId: {DeviceId}", reviewEvent.DeviceId);
                }
                else
                {
                    try
                    {
                        var deviceRepository = scope.ServiceProvider.GetRequiredService<IDeviceRepository>();
                        await deviceRepository.AddReviewIdAsync(deviceId, reviewId);
                        Logger.LogInformation("[Device] Added ReviewId {ReviewId} to Device {DeviceId}", reviewId, deviceId);
                    }
                    catch (Exception ex)
                    {
                        Logger.LogError(ex, "[Device] Failed to add ReviewId to Device {DeviceId}", deviceId);
                        throw;
                    }
                }
            }

            // Handle Combo review
            if (!string.IsNullOrEmpty(reviewEvent.ComboId))
            {
                Logger.LogInformation(
                    "[Device] Received review.created for ComboId: {ComboId}, ReviewId: {ReviewId}",
                    reviewEvent.ComboId, reviewEvent.ReviewId);

                if (!Guid.TryParse(reviewEvent.ComboId, out var comboId))
                {
                    Logger.LogWarning("[Device] Invalid ComboId: {ComboId}", reviewEvent.ComboId);
                }
                else
                {
                    try
                    {
                        var comboRepository = scope.ServiceProvider.GetRequiredService<IComboRepository>();
                        await comboRepository.AddReviewIdAsync(comboId, reviewId);
                        Logger.LogInformation("[Device] Added ReviewId {ReviewId} to Combo {ComboId}", reviewId, comboId);
                    }
                    catch (Exception ex)
                    {
                        Logger.LogError(ex, "[Device] Failed to add ReviewId to Combo {ComboId}", comboId);
                        throw;
                    }
                }
            }
        }
    }
}
