using AutoMapper;
using Grpc.Core;
using review.Interface;
using review.Model.Dto;
using review.Nats;
using ReviewModel = review.Model.Review;
using ReviewType = review.Model.ReviewType;
using ProtoReviewType = Review.ReviewType;

namespace review.Services
{
    public class ReviewGrpcService : Review.ReviewService.ReviewServiceBase
    {
        private readonly IReviewService _reviewService;
        private readonly IMapper _mapper;
        private readonly ILogger<ReviewGrpcService> _logger;
        private readonly NatsPublisher _natsPublisher;


        public ReviewGrpcService(IReviewService reviewService, IMapper mapper, ILogger<ReviewGrpcService> logger, NatsPublisher natsPublisher)
        {
            _reviewService = reviewService;
            _mapper = mapper;
            _logger = logger;
            _natsPublisher = natsPublisher;
        }

        public override async Task<Review.ReviewResponse> CreateReview(Review.CreateReviewRequest request, ServerCallContext context)
        {
            try
            {
                var dto = new CreateReviewDto
                {
                    BookingId = Guid.TryParse(request.BookingId, out var bookingId) ? bookingId : (Guid?)null,
                    UserId = Guid.Parse(request.UserId),
                    RentalId = Guid.TryParse(request.RentalId, out var rentalId) ? rentalId : (Guid?)null,
                    Rating = request.Rating,
                    Title = request.Title,
                    Type = MapProtoTypeToReviewType(request.Type),
                    Content = request.Content,
                    Images = request.Images.Count > 0 ? request.Images.ToList() : null
                };

                var review = await _reviewService.CreateReviewAsync(dto);
                var protoReview = _mapper.Map<Review.Review>(review);

                // Publish review.created event to NATS
                try
                {
                    var reviewCreatedEvent = new review.Nats.Events.ReviewCreatedEvent
                    {
                        reviewId = review.Id.ToString(),
                        bookingId = review.BookingId?.ToString(),
                        rentalId = review.RentalId?.ToString(),
                        vehicleId = review.VehicleId?.ToString(),
                        deviceId = review.DeviceId?.ToString(),
                        comboId = review.ComboId?.ToString(),
                    };
                    await _natsPublisher.PublishAsync("journey.events.review.created", reviewCreatedEvent);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to publish review.created event for review {ReviewId}", review.Id);
                }

                return new Review.ReviewResponse
                {
                    Review = protoReview,
                    Message = "Successfully.ReviewCreated"
                };
            }
            catch (RpcException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error.CreatingReview");
                throw new RpcException(new Status(StatusCode.Internal, "An error occurred while creating the review"));
            }
        }

        public override async Task<Review.ReviewResponse> UpdateReview(Review.UpdateReviewRequest request, ServerCallContext context)
        {
            try
            {
                var dto = new UpdateReviewDto
                {
                    ReviewId = Guid.Parse(request.ReviewId),
                    UserId = Guid.Parse(request.UserId),
                    Rating = request.Rating,
                    Title = request.Title,
                    Content = request.Content,
                    Images = request.Images.Count > 0 ? request.Images.ToList() : null
                };

                var review = await _reviewService.UpdateReviewAsync(dto);
                var protoReview = _mapper.Map<Review.Review>(review);

                // Publish review.updated event to NATS
                try
                {
                    var reviewUpdatedEvent = new review.Nats.Events.ReviewUpdatedEvent
                    {
                        ReviewId = review.Id.ToString(),
                        Rating = review.Rating,
                        Title = review.Title,
                        Content = review.Content,
                        UpdatedAt = DateTime.UtcNow.ToString("O")
                    };
                    await _natsPublisher.PublishAsync("journey.events.review.updated", reviewUpdatedEvent);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to publish review.updated event for review {ReviewId}", review.Id);
                }

                return new Review.ReviewResponse
                {
                    Review = protoReview,
                    Message = "Successfully.ReviewUpdated"
                };
            }
            catch (RpcException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error.UpdatingReview");
                throw new RpcException(new Status(StatusCode.Internal, "An error occurred while updating the review"));
            }
        }

        public override async Task<Review.DeleteReviewResponse> DeleteReview(Review.DeleteReviewRequest request, ServerCallContext context)
        {
            try
            {
                var reviewId = Guid.Parse(request.ReviewId);
                var userId = Guid.Parse(request.UserId);

                // Get review before deletion for event publishing
                var review = await _reviewService.GetReviewByIdAsync(reviewId);

                var success = await _reviewService.DeleteReviewAsync(reviewId, userId);

                // Publish review.deleted event to NATS
                if (success && review != null)
                {
                    try
                    {
                        var reviewDeletedEvent = new review.Nats.Events.ReviewDeletedEvent
                        {
                            ReviewId = reviewId.ToString(),
                            DeviceId = review.DeviceId?.ToString(),
                            VehicleId = review.VehicleId?.ToString(),
                            ComboId = review.ComboId?.ToString(),
                            DeletedAt = DateTime.UtcNow.ToString("O")
                        };
                        await _natsPublisher.PublishAsync("journey.events.review.deleted", reviewDeletedEvent);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to publish review.deleted event for review {ReviewId}", reviewId);
                    }
                }

                return new Review.DeleteReviewResponse
                {
                    Success = success,
                    Message = success ? "Successfully.ReviewDeleted" : "Error.FailedToDeleteReview"
                };
            }
            catch (RpcException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error.DeletingReview");
                throw new RpcException(new Status(StatusCode.Internal, "An error occurred while deleting the review"));
            }
        }

        public override async Task<Review.ReviewResponse> GetReviewById(Review.GetReviewByIdRequest request, ServerCallContext context)
        {
            try
            {
                var reviewId = Guid.Parse(request.ReviewId);
                var review = await _reviewService.GetReviewByIdAsync(reviewId);

                if (review == null)
                {
                    throw new RpcException(new Status(StatusCode.NotFound, "Review not found"));
                }

                var protoReview = _mapper.Map<Review.Review>(review);

                return new Review.ReviewResponse
                {
                    Review = protoReview,
                    Message = "Successfully.ReviewRetrieved"
                };
            }
            catch (RpcException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error.GettingReviewById");
                throw new RpcException(new Status(StatusCode.Internal, "An error occurred while retrieving the review"));
            }
        }

        public override async Task<Review.GetMyReviewsResponse> GetMyReviews(Review.GetMyReviewsRequest request, ServerCallContext context)
        {
            try
            {
                var userId = Guid.Parse(request.UserId);
                var query = CreateQueryDto(request.Page, request.Limit, request.SearchText,
                    request.MinRating, request.MaxRating, request.StartDate, request.EndDate,
                    request.SortBy, request.SortOrder);

                var pagedResult = await _reviewService.GetMyReviewsAsync(userId, query);
                if (pagedResult == null)
                {
                    throw new RpcException(new Status(StatusCode.NotFound, "Not found"));
                }
                var response = new Review.GetMyReviewsResponse
                {
                    Page = pagedResult.Page,
                    Limit = pagedResult.Limit,
                    TotalItems = pagedResult.TotalItems,
                    TotalPages = pagedResult.TotalPages
                };

                foreach (var review in pagedResult.Items)
                {
                    response.Reviews.Add(_mapper.Map<Review.Review>(review));
                }

                return response;
            }
            catch (RpcException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error.GettingUserReviews");
                throw new RpcException(new Status(StatusCode.Internal, "An error occurred while retrieving user reviews"));
            }
        }

        public override async Task<Review.GetReviewsResponse> GetReviewsByVehicle(Review.GetReviewsByVehicleRequest request, ServerCallContext context)
        {
            try
            {
                var vehicleId = Guid.Parse(request.VehicleId);
                var query = CreateQueryDto(request.Page, request.Limit, request.SearchText,
                    request.MinRating, request.MaxRating, request.StartDate, request.EndDate,
                    request.SortBy, request.SortOrder);

                var pagedResult = await _reviewService.GetReviewsByVehicleIdAsync(vehicleId, query);
                if (pagedResult == null)
                {
                    throw new RpcException(new Status(StatusCode.NotFound, "Not found"));
                }
                var response = new Review.GetReviewsResponse
                {
                    Page = pagedResult.Page,
                    Limit = pagedResult.Limit,
                    TotalItems = pagedResult.TotalItems,
                    TotalPages = pagedResult.TotalPages
                };

                foreach (var review in pagedResult.Items)
                {
                    response.Reviews.Add(_mapper.Map<Review.Review>(review));
                }

                return response;
            }
            catch (RpcException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error.GettingVehicleReviews");
                throw new RpcException(new Status(StatusCode.Internal, "An error occurred while retrieving vehicle reviews"));
            }
        }

        public override async Task<Review.GetReviewsResponse> GetReviewsByDevice(Review.GetReviewsByDeviceRequest request, ServerCallContext context)
        {
            try
            {
                var deviceId = Guid.Parse(request.DeviceId);
                var query = CreateQueryDto(request.Page, request.Limit, request.SearchText,
                    request.MinRating, request.MaxRating, request.StartDate, request.EndDate,
                    request.SortBy, request.SortOrder);

                var pagedResult = await _reviewService.GetReviewsByDeviceIdAsync(deviceId, query);

                if (pagedResult == null)
                {
                    throw new RpcException(new Status(StatusCode.NotFound, "Not found"));
                }
                var response = new Review.GetReviewsResponse
                {
                    Page = pagedResult.Page,
                    Limit = pagedResult.Limit,
                    TotalItems = pagedResult.TotalItems,
                    TotalPages = pagedResult.TotalPages
                };

                foreach (var review in pagedResult.Items)
                {
                    response.Reviews.Add(_mapper.Map<Review.Review>(review));
                }

                return response;
            }
            catch (RpcException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error.GettingDeviceReviews");
                throw new RpcException(new Status(StatusCode.Internal, "An error occurred while retrieving device reviews"));
            }
        }

        public override async Task<Review.GetReviewsResponse> GetReviewsByCombo(Review.GetReviewsByComboRequest request, ServerCallContext context)
        {
            try
            {
                var comboId = Guid.Parse(request.ComboId);
                var query = CreateQueryDto(request.Page, request.Limit, request.SearchText,
                    request.MinRating, request.MaxRating, request.StartDate, request.EndDate,
                    request.SortBy, request.SortOrder);

                var pagedResult = await _reviewService.GetReviewsByComboIdAsync(comboId, query);
                if (pagedResult == null)
                {
                    throw new RpcException(new Status(StatusCode.NotFound, "Not found"));
                }
                var response = new Review.GetReviewsResponse
                {
                    Page = pagedResult.Page,
                    Limit = pagedResult.Limit,
                    TotalItems = pagedResult.TotalItems,
                    TotalPages = pagedResult.TotalPages
                };

                foreach (var review in pagedResult.Items)
                {
                    response.Reviews.Add(_mapper.Map<Review.Review>(review));
                }

                return response;
            }
            catch (RpcException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error.GettingComboReviews");
                throw new RpcException(new Status(StatusCode.Internal, "An error occurred while retrieving combo reviews"));
            }
        }

        public override async Task<Review.GetReviewsResponse> GetAllReviews(Review.GetAllReviewsRequest request, ServerCallContext context)
        {
            try
            {
                // TODO: Verify admin role for adminId
                var type = request.Type == ProtoReviewType.Device && request.Type == 0
                    ? (ReviewType?)null
                    : MapProtoTypeToReviewType(request.Type);

                var query = CreateQueryDto(request.Page, request.Limit, request.SearchText,
                    request.MinRating, request.MaxRating, request.StartDate, request.EndDate,
                    request.SortBy, request.SortOrder, type);

                var pagedResult = await _reviewService.GetAllReviewsAsync(query, type);

                var response = new Review.GetReviewsResponse
                {
                    Page = pagedResult.Page,
                    Limit = pagedResult.Limit,
                    TotalItems = pagedResult.TotalItems,
                    TotalPages = pagedResult.TotalPages
                };

                foreach (var review in pagedResult.Items)
                {
                    response.Reviews.Add(_mapper.Map<Review.Review>(review));
                }

                return response;
            }
            catch (RpcException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error.GettingAllReviews");
                throw new RpcException(new Status(StatusCode.Internal, "An error occurred while retrieving all reviews"));
            }
        }

        public override async Task<Review.DeleteReviewResponse> AdminDeleteReview(Review.AdminDeleteReviewRequest request, ServerCallContext context)
        {
            try
            {
                var reviewId = Guid.Parse(request.ReviewId);
                var adminId = Guid.Parse(request.AdminId);

                var success = await _reviewService.AdminDeleteReviewAsync(reviewId, adminId);

                return new Review.DeleteReviewResponse
                {
                    Success = success,
                    Message = success ? "Successfully.ReviewDeleted" : "Error.FailedToDeleteReview"
                };
            }
            catch (RpcException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error.AdminDeletingReview");
                throw new RpcException(new Status(StatusCode.Internal, "An error occurred while deleting the review"));
            }
        }

        // Helper methods
        private ReviewQueryDto CreateQueryDto(int page, int limit, string searchText,
            int minRating, int maxRating, string startDate, string endDate,
            Review.SortField sortBy, Review.SortOrder sortOrder, ReviewType? type = null)
        {
            return new ReviewQueryDto
            {
                Page = page > 0 ? page : 1,
                Limit = limit > 0 ? limit : 10,
                SearchText = string.IsNullOrWhiteSpace(searchText) ? null : searchText,
                MinRating = minRating > 0 ? minRating : null,
                MaxRating = maxRating > 0 ? maxRating : null,
                StartDate = ParseDateTime(startDate),
                EndDate = ParseDateTime(endDate),
                Type = type,
                SortBy = MapProtoSortField(sortBy),
                SortOrder = MapProtoSortOrder(sortOrder)
            };
        }

        private DateTime? ParseDateTime(string dateString)
        {
            if (string.IsNullOrWhiteSpace(dateString))
                return null;

            if (DateTime.TryParse(dateString, out var result))
                return result;

            return null;
        }

        private SortField MapProtoSortField(Review.SortField field)
        {
            return field switch
            {
                Review.SortField.CreatedAt => SortField.CreatedAt,
                Review.SortField.UpdatedAt => SortField.UpdatedAt,
                Review.SortField.Rating => SortField.Rating,
                Review.SortField.Title => SortField.Title,
                _ => SortField.CreatedAt
            };
        }

        private Model.Dto.SortOrder MapProtoSortOrder(Review.SortOrder order)
        {
            return order switch
            {
                Review.SortOrder.Ascending => Model.Dto.SortOrder.Ascending,
                Review.SortOrder.Descending => Model.Dto.SortOrder.Descending,
                _ => Model.Dto.SortOrder.Descending
            };
        }

        private static ReviewType MapProtoTypeToReviewType(ProtoReviewType type)
        {
            return type switch
            {
                ProtoReviewType.Device => ReviewType.Device,
                ProtoReviewType.Vehicle => ReviewType.Vehicle,
                ProtoReviewType.Combo => ReviewType.Combo,
                _ => ReviewType.Device
            };
        }
    }
}
