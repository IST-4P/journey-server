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
        private const int MaxUpdateCount = 2;

        public ReviewService(IReviewRepository repository, ILogger<ReviewService> logger, NatsPublisher natsPublisher, Rental.RentalService.RentalServiceClient rentalClient)
        {
            _repository = repository;
            _logger = logger;
            _natsPublisher = natsPublisher;
            _rentalClient = rentalClient;
        }

        public async Task<ReviewModel> CreateReviewAsync(CreateReviewDto dto)
        {
            // Validate that at least one target is specified
            if (!dto.BookingId.HasValue && !dto.RentalId.HasValue)
            {
                throw new RpcException(new Status(StatusCode.InvalidArgument,
                    "At least one of bookingId or rentalId must be specified"));
            }

            // Check if booking has already been reviewed
            var hasBeenReviewed = await _repository.HasBookingBeenReviewedAsync(dto.BookingId);
            var hasRentalBeenReviewed = await _repository.HasRentalBeenReviewedAsync(dto.RentalId);

            if (hasBeenReviewed || hasRentalBeenReviewed)
            {
                throw new RpcException(new Status(StatusCode.AlreadyExists,
                    "This booking or rental has already been reviewed"));
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

            // If RentalId provided, fetch and populate target IDs (DeviceId/ComboId)
            if (dto.RentalId.HasValue)
            {
                try
                {
                    var rentalResp = await _rentalClient.GetRentalByIdAsync(new Rental.GetRentalByIdRequest
                    {
                        RentalId = dto.RentalId.Value.ToString()
                    });

                    var firstItem = rentalResp.Items.FirstOrDefault();
                    if (firstItem != null)
                    {
                        var targetId = Guid.Parse(firstItem.TargetId);
                        if (firstItem.IsCombo)
                        {
                            review.ComboId = targetId;
                            review.Type = ReviewType.Combo;
                        }
                        else
                        {
                            review.DeviceId = targetId;
                            review.Type = ReviewType.Device;
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to fetch rental details for RentalId {RentalId}", dto.RentalId);
                }
            }



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
                    ReviewId = review.Id.ToString(),
                    BookingId = review.BookingId?.ToString(),
                    RentalId = review.RentalId?.ToString(),
                    UserId = review.UserId.ToString(),
                    Rating = review.Rating,
                    Type = review.Type.ToString(),
                    CreatedAt = review.CreatedAt.ToString("o"),
                    // Use target IDs already populated in review entity
                    DeviceId = review.DeviceId?.ToString(),
                    ComboId = review.ComboId?.ToString(),
                    VehicleId = review.VehicleId?.ToString()
                };

                await _natsPublisher.PublishAsync("review.created", reviewEvent);
                _logger.LogInformation($"Published review.created event for review {review.Id}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to publish review.created event for review {review.Id}");
                // Don't throw - the review was created successfully
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

        private void ValidatePagination(int page, int limit)
        {
            if (page < 1)
            {
                throw new RpcException(new Status(StatusCode.InvalidArgument,
                    "Page must be greater than 0"));
            }

            if (limit < 1 || limit > 100)
            {
                throw new RpcException(new Status(StatusCode.InvalidArgument,
                    "Limit must be between 1 and 100"));
            }
        }
    }
}
