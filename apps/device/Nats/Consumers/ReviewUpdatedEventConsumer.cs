using NATS.Client.Core;
using device.Nats.Events;
using device.Interface;
using device.Nats.Base;

namespace device.Nats.Consumers
{
    /// <summary>
    /// Consumer to handle review.updated events from Review service
    /// Updates device/combo AverageReview when a review is updated
    /// </summary>
    public class ReviewUpdatedEventConsumer : NatsConsumerBase<ReviewUpdatedEvent>
    {
        protected override string ConsumerName => "device-review-updated";
        protected override string FilterSubject => "journey.events.review.updated";

        public ReviewUpdatedEventConsumer(
            NatsConnection natsConnection,
            IServiceProvider serviceProvider,
            ILogger<ReviewUpdatedEventConsumer> logger)
            : base(natsConnection, serviceProvider, logger)
        {
        }

        protected override async Task HandleEventAsync(ReviewUpdatedEvent reviewEvent, CancellationToken cancellationToken)
        {
            // Skip if neither DeviceId nor ComboId is present
            if (string.IsNullOrEmpty(reviewEvent.DeviceId) && string.IsNullOrEmpty(reviewEvent.ComboId))
            {
                Logger.LogInformation("[Device] Skipping review.updated event - no DeviceId or ComboId");
                return;
            }

            // Skip if AverageRating is not provided
            if (!reviewEvent.AverageRating.HasValue)
            {
                Logger.LogWarning("[Device] Skipping review.updated event - AverageRating not provided");
                return;
            }

            using var scope = ServiceProvider.CreateScope();

            // Handle Device review update
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
                        await deviceRepository.UpdateAverageReviewAsync(deviceId, reviewEvent.AverageRating.Value);
                        Logger.LogInformation("[Device] Updated AverageReview to {AverageRating} for Device {DeviceId}",
                            reviewEvent.AverageRating.Value, deviceId);
                    }
                    catch (Exception ex)
                    {
                        Logger.LogError(ex, "[Device] Failed to update AverageReview for Device {DeviceId}", deviceId);
                        throw;
                    }
                }
            }

            // Handle Combo review update
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
                        await comboRepository.UpdateAverageReviewAsync(comboId, reviewEvent.AverageRating.Value);
                        Logger.LogInformation("[Device] Updated AverageReview to {AverageRating} for Combo {ComboId}",
                            reviewEvent.AverageRating.Value, comboId);
                    }
                    catch (Exception ex)
                    {
                        Logger.LogError(ex, "[Device] Failed to update AverageReview for Combo {ComboId}", comboId);
                        throw;
                    }
                }
            }
        }
    }
}
