using NATS.Client.Core;
using NATS.Client.JetStream;
using NATS.Client.JetStream.Models;
using rental.Repository;
using System.Text.Json;

namespace rental.Nats.Consumers
{
    /// <summary>
    /// Consumer to handle review events from Review service
    /// Listens to journey.events.review.created subject
    /// Updates rental with ReviewId when user creates a review after completing rental
    /// </summary>
    public class ReviewCreatedConsumer : BackgroundService
    {
        private readonly NatsConnection _natsConnection;
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ReviewCreatedConsumer> _logger;

        public ReviewCreatedConsumer(
            NatsConnection natsConnection,
            IServiceProvider serviceProvider,
            ILogger<ReviewCreatedConsumer> logger)
        {
            _natsConnection = natsConnection;
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("[Rental] Starting ReviewCreatedConsumer...");

            try
            {
                var js = new NatsJSContext(_natsConnection);

                // Create consumer configuration
                var consumerConfig = new ConsumerConfig("rental-service-review-created")
                {
                    DurableName = "rental-service-review-created",
                    AckPolicy = ConsumerConfigAckPolicy.Explicit,
                    DeliverPolicy = ConsumerConfigDeliverPolicy.All,
                    FilterSubject = "journey.events.review.created",
                    MaxDeliver = 3,
                    AckWait = TimeSpan.FromSeconds(30)
                };

                try
                {
                    await js.CreateOrUpdateConsumerAsync("JOURNEY_EVENTS", consumerConfig, stoppingToken);
                    _logger.LogInformation("[Rental] Consumer 'rental-service-review-created' created/updated successfully");
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "[Rental] Consumer might already exist or stream not ready");
                }

                // Get consumer and subscribe to messages
                var consumer = await js.GetConsumerAsync("JOURNEY_EVENTS", "rental-service-review-created", stoppingToken);

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

                        if (reviewEvent != null && !string.IsNullOrEmpty(reviewEvent.RentalId))
                        {
                            _logger.LogInformation(
                                "[Rental] Received review.created event for RentalId: {RentalId}, ReviewId: {ReviewId}",
                                reviewEvent.RentalId, reviewEvent.ReviewId);

                            await HandleReviewCreatedAsync(reviewEvent, stoppingToken);
                        }

                        await msg.AckAsync(cancellationToken: stoppingToken);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "[Rental] Error processing review.created event");
                        await msg.NakAsync(delay: TimeSpan.FromSeconds(5), cancellationToken: stoppingToken);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[Rental] ReviewCreatedConsumer failed");
            }
        }

        private async Task HandleReviewCreatedAsync(ReviewCreatedEvent reviewEvent, CancellationToken cancellationToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var rentalRepository = scope.ServiceProvider.GetRequiredService<RentalRepository>();

            if (!Guid.TryParse(reviewEvent.RentalId, out var rentalId))
            {
                _logger.LogWarning("[Rental] Invalid RentalId: {RentalId}", reviewEvent.RentalId);
                return;
            }

            if (!Guid.TryParse(reviewEvent.ReviewId, out var reviewId))
            {
                _logger.LogWarning("[Rental] Invalid ReviewId: {ReviewId}", reviewEvent.ReviewId);
                return;
            }

            var rental = await rentalRepository.GetByIdAsync(rentalId);
            if (rental == null)
            {
                _logger.LogWarning("[Rental] Rental not found: {RentalId}", rentalId);
                return;
            }

            // Only allow review for COMPLETED rentals
            if (rental.Status != Model.Entities.RentalStatus.COMPLETED)
            {
                _logger.LogWarning(
                    "[Rental] Rental {RentalId} is not COMPLETED (status: {Status}), cannot attach review",
                    rentalId, rental.Status);
                return;
            }

            // Update rental with ReviewId
            rental.ReviewId = reviewId;
            await rentalRepository.SaveChangesAsync();

            _logger.LogInformation(
                "[Rental] Updated rental {RentalId} with ReviewId {ReviewId}",
                rentalId, reviewId);
        }

        private class ReviewCreatedEvent
        {
            public string ReviewId { get; set; } = string.Empty;
            public string? BookingId { get; set; }
            public string? RentalId { get; set; }
            public string? VehicleId { get; set; }
            public string? DeviceId { get; set; }
            public string? ComboId { get; set; }
            public string UserId { get; set; } = string.Empty;
            public int Rating { get; set; }
            public string Type { get; set; } = string.Empty;
            public string Title { get; set; } = string.Empty;
            public string Content { get; set; } = string.Empty;
            public string CreatedAt { get; set; } = string.Empty;
        }
    }
}
