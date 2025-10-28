using AutoMapper;
using Grpc.Core;
using review.Interface;
using review.Model.Dto;
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

        public ReviewGrpcService(IReviewService reviewService, IMapper mapper, ILogger<ReviewGrpcService> logger)
        {
            _reviewService = reviewService;
            _mapper = mapper;
            _logger = logger;
        }

        public override async Task<Review.ReviewResponse> CreateReview(Review.CreateReviewRequest request, ServerCallContext context)
        {
            try
            {
                var dto = new CreateReviewDto
                {
                    BookingId = Guid.Parse(request.BookingId),
                    UserId = Guid.Parse(request.UserId),
                    VehicleId = string.IsNullOrEmpty(request.VehicleId) ? null : Guid.Parse(request.VehicleId),
                    DeviceId = string.IsNullOrEmpty(request.DeviceId) ? null : Guid.Parse(request.DeviceId),
                    ComboId = string.IsNullOrEmpty(request.ComboId) ? null : Guid.Parse(request.ComboId),
                    Rating = request.Rating,
                    Title = request.Title,
                    Type = MapProtoTypeToReviewType(request.Type),
                    Content = request.Content,
                    Images = request.Images.Count > 0 ? request.Images.ToList() : null
                };

                var review = await _reviewService.CreateReviewAsync(dto);
                var protoReview = _mapper.Map<Review.Review>(review);

                return new Review.ReviewResponse
                {
                    Review = protoReview,
                    Message = "Review created successfully"
                };
            }
            catch (RpcException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating review");
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

                return new Review.ReviewResponse
                {
                    Review = protoReview,
                    Message = "Review updated successfully"
                };
            }
            catch (RpcException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating review");
                throw new RpcException(new Status(StatusCode.Internal, "An error occurred while updating the review"));
            }
        }

        public override async Task<Review.DeleteReviewResponse> DeleteReview(Review.DeleteReviewRequest request, ServerCallContext context)
        {
            try
            {
                var reviewId = Guid.Parse(request.ReviewId);
                var userId = Guid.Parse(request.UserId);

                var success = await _reviewService.DeleteReviewAsync(reviewId, userId);

                return new Review.DeleteReviewResponse
                {
                    Success = success,
                    Message = success ? "Review deleted successfully" : "Failed to delete review"
                };
            }
            catch (RpcException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting review");
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
                    Message = "Review retrieved successfully"
                };
            }
            catch (RpcException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting review");
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
                _logger.LogError(ex, "Error getting user reviews");
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
                _logger.LogError(ex, "Error getting vehicle reviews");
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
                _logger.LogError(ex, "Error getting device reviews");
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
                _logger.LogError(ex, "Error getting combo reviews");
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
                _logger.LogError(ex, "Error getting all reviews");
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
                    Message = success ? "Review deleted successfully by admin" : "Failed to delete review"
                };
            }
            catch (RpcException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error admin deleting review");
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
