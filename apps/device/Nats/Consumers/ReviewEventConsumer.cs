using NATS.Client.Core;
using NATS.Client.JetStream;
using NATS.Client.JetStream.Models;
using device.Nats.Events;
using device.Repository;
using System.Text.Json;
using device.Interface;

namespace device.Nats.Consumers
{
    public class ReviewEventConsumer : BackgroundService
    {
        private readonly NatsConnection _natsConnection;
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ReviewEventConsumer> _logger;

        public ReviewEventConsumer(
            NatsConnection natsConnection,
            IServiceProvider serviceProvider,
            ILogger<ReviewEventConsumer> logger)
        {
            _natsConnection = natsConnection;
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("[Device] Starting ReviewEventConsumer...");

            try
            {
                var js = new NatsJSContext(_natsConnection);

                // Create consumer if not exists - updated to use JOURNEY_EVENTS stream
                var consumerConfig = new ConsumerConfig("device-service-review-created")
                {
                    DurableName = "device-service-review-created",
                    AckPolicy = ConsumerConfigAckPolicy.Explicit,
                    DeliverPolicy = ConsumerConfigDeliverPolicy.All,
                    FilterSubject = "journey.events.review.created",
                    MaxDeliver = 3,
                    AckWait = TimeSpan.FromSeconds(30)
                };

                try
                {
                    await js.CreateOrUpdateConsumerAsync("JOURNEY_EVENTS", consumerConfig, stoppingToken);
                    _logger.LogInformation("[Device] Consumer 'device-service-review-created' created/updated successfully");
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "[Device] Consumer might already exist or stream not ready");
                }

                // Get consumer and subscribe to messages
                var consumer = await js.GetConsumerAsync("JOURNEY_EVENTS", "device-service-review-created", stoppingToken);

                await foreach (var msg in consumer.ConsumeAsync<string>(cancellationToken: stoppingToken))
                {
                    try
                    {
                        var json = msg.Data;
                        if (string.IsNullOrEmpty(json))
                        {
                            await msg.AckAsync(cancellationToken: stoppingToken);
                            continue;
                        }

                        var reviewEvent = JsonSerializer.Deserialize<ReviewCreatedEvent>(json);

                        if (reviewEvent != null && !string.IsNullOrEmpty(reviewEvent.DeviceId))
                        {
                            _logger.LogInformation($"[Device] Received review.created for DeviceId: {reviewEvent.DeviceId}, ReviewId: {reviewEvent.ReviewId}");

                            await HandleReviewCreatedAsync(reviewEvent);
                        }

                        await msg.AckAsync(cancellationToken: stoppingToken);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "[Device] Error processing review.created event");
                        await msg.NakAsync(delay: TimeSpan.FromSeconds(5), cancellationToken: stoppingToken);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[Device] ReviewEventConsumer failed");
            }
        }

        private async Task HandleReviewCreatedAsync(ReviewCreatedEvent reviewEvent)
        {
            using var scope = _serviceProvider.CreateScope();
            var deviceRepository = scope.ServiceProvider.GetRequiredService<IDeviceRepository>();

            if (!Guid.TryParse(reviewEvent.DeviceId, out var deviceId))
            {
                _logger.LogWarning($"[Device] Invalid DeviceId: {reviewEvent.DeviceId}");
                return;
            }

            if (!Guid.TryParse(reviewEvent.ReviewId, out var reviewId))
            {
                _logger.LogWarning($"[Device] Invalid ReviewId: {reviewEvent.ReviewId}");
                return;
            }

            try
            {
                await deviceRepository.AddReviewIdAsync(deviceId, reviewId);
                _logger.LogInformation($"[Device] Added ReviewId {reviewId} to Device {deviceId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"[Device] Failed to add ReviewId to Device {deviceId}");
                throw;
            }
        }
    }
}
