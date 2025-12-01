using NATS.Client.Core;
using device.Nats.Events;
using device.Interface;
using device.Nats.Base;

namespace device.Nats.Consumers
{
    /// <summary>
    /// Consumer to handle review.deleted events from Review service
    /// Updates device/combo AverageReview and removes ReviewId when a review is deleted
    /// </summary>
    public class ReviewDeletedEventConsumer : NatsConsumerBase<ReviewDeletedEvent>
    {
        protected override string ConsumerName => "device-review-deleted";
        protected override string FilterSubject => "journey.events.review.deleted";

        public ReviewDeletedEventConsumer(
            NatsConnection natsConnection,
            IServiceProvider serviceProvider,
            ILogger<ReviewDeletedEventConsumer> logger)
            : base(natsConnection, serviceProvider, logger)
        {
        }

        protected override async Task HandleEventAsync(ReviewDeletedEvent reviewEvent, CancellationToken cancellationToken)
        {
            // Skip if neither DeviceId nor ComboId is present
            if (string.IsNullOrEmpty(reviewEvent.DeviceId) && string.IsNullOrEmpty(reviewEvent.ComboId))
            {
                Logger.LogInformation("[Device] Skipping review.deleted event - no DeviceId or ComboId");
                return;
            }

            if (!Guid.TryParse(reviewEvent.ReviewId, out var reviewId))
            {
                Logger.LogWarning("[Device] Invalid ReviewId: {ReviewId}", reviewEvent.ReviewId);
                return;
            }

            using var scope = ServiceProvider.CreateScope();

            // Handle Device review deletion
            if (!string.IsNullOrEmpty(reviewEvent.DeviceId))
            {
                if (!Guid.TryParse(reviewEvent.DeviceId, out var deviceId))
                {
                    Logger.LogWarning("[Device] Invalid DeviceId: {DeviceId}", reviewEvent.DeviceId);
                }
                else
                {
                    try
                    {
                        var deviceRepository = scope.ServiceProvider.GetRequiredService<IDeviceRepository>();

                        // Remove reviewId from device's review list
                        await deviceRepository.RemoveReviewIdAsync(deviceId, reviewId);
                        Logger.LogInformation("[Device] Removed ReviewId {ReviewId} from Device {DeviceId}", reviewId, deviceId);

                        // Update average review if provided
                        if (reviewEvent.AverageRating.HasValue)
                        {
                            await deviceRepository.UpdateAverageReviewAsync(deviceId, reviewEvent.AverageRating.Value);
                            Logger.LogInformation("[Device] Updated AverageReview to {AverageRating} for Device {DeviceId}",
                                reviewEvent.AverageRating.Value, deviceId);
                        }
                    }
                    catch (Exception ex)
                    {
                        Logger.LogError(ex, "[Device] Failed to handle review deletion for Device {DeviceId}", deviceId);
                        throw;
                    }
                }
            }

            // Handle Combo review deletion
            if (!string.IsNullOrEmpty(reviewEvent.ComboId))
            {
                if (!Guid.TryParse(reviewEvent.ComboId, out var comboId))
                {
                    Logger.LogWarning("[Device] Invalid ComboId: {ComboId}", reviewEvent.ComboId);
                }
                else
                {
                    try
                    {
                        var comboRepository = scope.ServiceProvider.GetRequiredService<IComboRepository>();

                        // Remove reviewId from combo's review list
                        await comboRepository.RemoveReviewIdAsync(comboId, reviewId);
                        Logger.LogInformation("[Device] Removed ReviewId {ReviewId} from Combo {ComboId}", reviewId, comboId);

                        // Update average review if provided
                        if (reviewEvent.AverageRating.HasValue)
                        {
                            await comboRepository.UpdateAverageReviewAsync(comboId, reviewEvent.AverageRating.Value);
                            Logger.LogInformation("[Device] Updated AverageReview to {AverageRating} for Combo {ComboId}",
                                reviewEvent.AverageRating.Value, comboId);
                        }
                    }
                    catch (Exception ex)
                    {
                        Logger.LogError(ex, "[Device] Failed to handle review deletion for Combo {ComboId}", comboId);
                        throw;
                    }
                }
            }
        }
    }
}
