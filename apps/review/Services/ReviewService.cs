using Grpc.Core;
using review.Interface;
using review.Model.Dto;
using review.Nats;
using review.Nats.Events;
using ReviewModel = review.Model.Review;
using ReviewType = review.Model.ReviewType;

namespace review.Services
{
    public class ReviewService : IReviewService
    {
        private readonly IReviewRepository _repository;
        private readonly ILogger<ReviewService> _logger;
        private readonly NatsPublisher _natsPublisher;
        private readonly Rental.RentalService.RentalServiceClient _rentalClient;
        private readonly Booking.BookingService.BookingServiceClient _bookingClient;
        private const int MaxUpdateCount = 2;

        public ReviewService(IReviewRepository repository, ILogger<ReviewService> logger,
        NatsPublisher natsPublisher,
        Rental.RentalService.RentalServiceClient rentalClient,
        Booking.BookingService.BookingServiceClient bookingClient)

        {
            _repository = repository;
            _logger = logger;
            _natsPublisher = natsPublisher;
            _rentalClient = rentalClient;
            _bookingClient = bookingClient;
        }

        public async Task<ReviewModel> CreateReviewAsync(CreateReviewDto dto)
        {
            // Validate that at least one target is specified
            if (!dto.BookingId.HasValue && !dto.RentalId.HasValue)
            {
                throw new RpcException(new Status(StatusCode.InvalidArgument,
                    "At least one of bookingId or rentalId must be specified"));
            }

            // Validate rating
            if (dto.Rating < 1 || dto.Rating > 5)
            {
                throw new RpcException(new Status(StatusCode.InvalidArgument,
                    "Rating must be between 1 and 5"));
            }

            var review = new ReviewModel
            {
                Id = Guid.NewGuid(),
                BookingId = dto.BookingId,
                UserId = dto.UserId,
                RentalId = dto.RentalId,
                Rating = dto.Rating,
                Title = dto.Title,
                Type = dto.Type,
                Content = dto.Content,
                Images = dto.Images,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                UpdateCount = 0
            };

            var createdReview = await _repository.CreateReviewAsync(review);

            // Publish event to NATS
            await PublishReviewCreatedEvent(createdReview);

            return createdReview;
        }

        private async Task PublishReviewCreatedEvent(ReviewModel review)
        {
            try
            {
                var reviewEvent = new ReviewCreatedEvent
                {
                    reviewId = review.Id.ToString(),
                    bookingId = review.BookingId?.ToString(),
                    rentalId = review.RentalId?.ToString(),
                    deviceId = review.DeviceId?.ToString(),
                    comboId = review.ComboId?.ToString(),
                    vehicleId = review.VehicleId?.ToString()
                    rating = review.Rating,
                };

                await _natsPublisher.PublishAsync("journey.events.review.created", reviewEvent);
                _logger.LogInformation($"Published journey.events.review.created event for review {review.Id}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to publish review.created event for review {review.Id}");
            }
        }

        public async Task<ReviewModel> UpdateReviewAsync(UpdateReviewDto dto)
        {
            var review = await _repository.GetReviewByIdAsync(dto.ReviewId);

            if (review == null)
            {
                throw new RpcException(new Status(StatusCode.NotFound, "Review not found"));
            }

            // Check ownership
            if (review.UserId != dto.UserId)
            {
                throw new RpcException(new Status(StatusCode.PermissionDenied,
                    "You don't have permission to update this review"));
            }

            // Check update count limit
            if (review.UpdateCount >= MaxUpdateCount)
            {
                throw new RpcException(new Status(StatusCode.FailedPrecondition,
                    $"Maximum update limit ({MaxUpdateCount}) reached for this review"));
            }

            // Validate rating
            if (dto.Rating < 1 || dto.Rating > 5)
            {
                throw new RpcException(new Status(StatusCode.InvalidArgument,
                    "Rating must be between 1 and 5"));
            }

            review.Rating = dto.Rating;
            review.Title = dto.Title;
            review.Content = dto.Content;
            review.Images = dto.Images ?? new List<string>();
            review.UpdatedAt = DateTime.UtcNow;
            review.UpdateCount++;

            return await _repository.UpdateReviewAsync(review);
        }

        public async Task<bool> DeleteReviewAsync(Guid reviewId, Guid userId)
        {
            var isOwner = await _repository.IsUserReviewOwnerAsync(reviewId, userId);

            if (!isOwner)
            {
                throw new RpcException(new Status(StatusCode.PermissionDenied,
                    "You don't have permission to delete this review"));
            }

            return await _repository.DeleteReviewAsync(reviewId);
        }

        public async Task<ReviewModel?> GetReviewByIdAsync(Guid reviewId)
        {
            return await _repository.GetReviewByIdAsync(reviewId);
        }

        public async Task<PagedResultDto<ReviewModel>> GetMyReviewsAsync(Guid userId, ReviewQueryDto query)
        {
            if (!query.IsValid())
            {
                throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid query parameters"));
            }

            var reviews = await _repository.GetReviewsByUserIdAsync(userId, query);
            var totalItems = await _repository.GetTotalCountAsync(userId: userId, query: query);

            return new PagedResultDto<ReviewModel>(reviews, query.Page, query.Limit, totalItems);
        }

        public async Task<PagedResultDto<ReviewModel>> GetReviewsByVehicleIdAsync(Guid vehicleId, ReviewQueryDto query)
        {
            if (!query.IsValid())
            {
                throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid query parameters"));
            }

            var reviews = await _repository.GetReviewsByVehicleIdAsync(vehicleId, query);
            var totalItems = await _repository.GetTotalCountAsync(vehicleId: vehicleId, query: query);

            return new PagedResultDto<ReviewModel>(reviews, query.Page, query.Limit, totalItems);
        }

        public async Task<PagedResultDto<ReviewModel>> GetReviewsByDeviceIdAsync(Guid deviceId, ReviewQueryDto query)
        {
            if (!query.IsValid())
            {
                throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid query parameters"));
            }

            var reviews = await _repository.GetReviewsByDeviceIdAsync(deviceId, query);
            var totalItems = await _repository.GetTotalCountAsync(deviceId: deviceId, query: query);

            return new PagedResultDto<ReviewModel>(reviews, query.Page, query.Limit, totalItems);
        }

        public async Task<PagedResultDto<ReviewModel>> GetReviewsByComboIdAsync(Guid comboId, ReviewQueryDto query)
        {
            if (!query.IsValid())
            {
                throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid query parameters"));
            }

            var reviews = await _repository.GetReviewsByComboIdAsync(comboId, query);
            var totalItems = await _repository.GetTotalCountAsync(comboId: comboId, query: query);

            return new PagedResultDto<ReviewModel>(reviews, query.Page, query.Limit, totalItems);
        }

        public async Task<PagedResultDto<ReviewModel>> GetAllReviewsAsync(ReviewQueryDto query, ReviewType? type = null)
        {
            if (!query.IsValid())
            {
                throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid query parameters"));
            }

            var reviews = await _repository.GetAllReviewsAsync(query, type);
            var totalItems = await _repository.GetTotalCountAsync(type: type, query: query);

            return new PagedResultDto<ReviewModel>(reviews, query.Page, query.Limit, totalItems);
        }

        public async Task<bool> AdminDeleteReviewAsync(Guid reviewId, Guid adminId)
        {
            // TODO: Add admin role verification
            // For now, we'll just delete the review
            _logger.LogInformation($"Admin {adminId} is deleting review {reviewId}");

            return await _repository.DeleteReviewAsync(reviewId);
        }

        public async Task<RatingStatsDto> GetVehicleRatingStatsAsync(Guid vehicleId)
        {
            var reviews = await _repository.GetReviewsByVehicleIdAsync(vehicleId, new ReviewQueryDto
            {
                Page = 1,
                Limit = int.MaxValue
            });

            return new RatingStatsDto
            {
                TargetId = vehicleId,
                Type = ReviewType.Vehicle,
                AverageRating = reviews.Any() ? Math.Round(reviews.Average(r => r.Rating), 2) : 0,
                TotalReviews = reviews.Count
            };
        }

        public async Task<RatingStatsDto> GetDeviceRatingStatsAsync(Guid deviceId)
        {
            var reviews = await _repository.GetReviewsByDeviceIdAsync(deviceId, new ReviewQueryDto
            {
                Page = 1,
                Limit = int.MaxValue
            });

            return new RatingStatsDto
            {
                TargetId = deviceId,
                Type = ReviewType.Device,
                AverageRating = reviews.Any() ? Math.Round(reviews.Average(r => r.Rating), 2) : 0,
                TotalReviews = reviews.Count
            };
        }

        public async Task<RatingStatsDto> GetComboRatingStatsAsync(Guid comboId)
        {
            var reviews = await _repository.GetReviewsByComboIdAsync(comboId, new ReviewQueryDto
            {
                Page = 1,
                Limit = int.MaxValue
            });

            return new RatingStatsDto
            {
                TargetId = comboId,
                Type = ReviewType.Combo,
                AverageRating = reviews.Any() ? Math.Round(reviews.Average(r => r.Rating), 2) : 0,
                TotalReviews = reviews.Count
            };
        }
    }
}
