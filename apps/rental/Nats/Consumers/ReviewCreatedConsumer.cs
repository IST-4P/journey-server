using NATS.Client.Core;
using Microsoft.EntityFrameworkCore;
using rental.Nats.Base;
using RentalEntity = rental.Model.Entities.Rental;

namespace rental.Nats.Consumers
{
    /// <summary>
    /// Consumer to handle review.created events from Review service
    /// Updates Rental.ReviewId when a review is created for a completed rental
    /// </summary>
    public class ReviewCreatedConsumer : NatsConsumerBase<ReviewCreatedEvent>
    {
        protected override string ConsumerName => "rental-service-review-created";
        protected override string FilterSubject => "journey.events.review.created";

        public ReviewCreatedConsumer(
            NatsConnection natsConnection,
            IServiceProvider serviceProvider,
            ILogger<ReviewCreatedConsumer> logger)
            : base(natsConnection, serviceProvider, logger)
        {
        }

        protected override async Task HandleEventAsync(ReviewCreatedEvent reviewEvent, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(reviewEvent.RentalId))
            {
                Logger.LogInformation("[Rental] Skipping review event - no RentalId");
                return;
            }

            Logger.LogInformation(
                "[Rental] Received review.created event for RentalId: {RentalId}, ReviewId: {ReviewId}",
                reviewEvent.RentalId, reviewEvent.ReviewId);

            using var scope = ServiceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<rental.Data.RentalDbContext>();

            if (!Guid.TryParse(reviewEvent.RentalId, out var rentalId))
            {
                Logger.LogWarning("[Rental] Invalid RentalId: {RentalId}", reviewEvent.RentalId);
                return;
            }

            if (!Guid.TryParse(reviewEvent.ReviewId, out var reviewId))
            {
                Logger.LogWarning("[Rental] Invalid ReviewId: {ReviewId}", reviewEvent.ReviewId);
                return;
            }

            try
            {
                var rental = await context.Set<RentalEntity>()
                    .FirstOrDefaultAsync(r => r.Id == rentalId, cancellationToken);

                if (rental == null)
                {
                    Logger.LogWarning("[Rental] Rental not found: {RentalId}", rentalId);
                    return;
                }

                // Validate rental is COMPLETED
                if (rental.Status != Model.Entities.RentalStatus.COMPLETED)
                {
                    Logger.LogWarning("[Rental] Rental {RentalId} is not COMPLETED (status: {Status}), cannot attach review",
                        rentalId, rental.Status);
                    return;
                }

                // Check if rental already has a review
                if (rental.ReviewId.HasValue)
                {
                    Logger.LogWarning("[Rental] Rental {RentalId} already has review {ExistingReviewId}",
                        rentalId, rental.ReviewId.Value);
                    return;
                }

                rental.ReviewId = reviewId;
                await context.SaveChangesAsync(cancellationToken);
                Logger.LogInformation("[Rental] Updated Rental {RentalId} with ReviewId {ReviewId}", rentalId, reviewId);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "[Rental] Failed to update Rental {RentalId} with ReviewId", rentalId);
                throw;
            }
        }
    }

    public class ReviewCreatedEvent
    {
        public string ReviewId { get; set; } = string.Empty;
        public string? RentalId { get; set; }
        public string? BookingId { get; set; }
        public string? DeviceId { get; set; }
        public string? ComboId { get; set; }
        public string? VehicleId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Type { get; set; } = string.Empty;
        public string CreatedAt { get; set; } = string.Empty;
    }
}
