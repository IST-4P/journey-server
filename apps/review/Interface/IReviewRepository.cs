using ReviewModel = review.Model.Review;
using ReviewType = review.Model.ReviewType;
using review.Model.Dto;

namespace review.Interface
{
    public interface IReviewRepository
    {
        // Create
        Task<ReviewModel> CreateReviewAsync(ReviewModel review);

        // Read
        Task<ReviewModel?> GetReviewByIdAsync(Guid reviewId);
        Task<List<ReviewModel>> GetReviewsByUserIdAsync(Guid userId, ReviewQueryDto query);
        Task<List<ReviewModel>> GetReviewsByVehicleIdAsync(Guid vehicleId, ReviewQueryDto query);
        Task<List<ReviewModel>> GetReviewsByDeviceIdAsync(Guid deviceId, ReviewQueryDto query);
        Task<List<ReviewModel>> GetReviewsByComboIdAsync(Guid comboId, ReviewQueryDto query);
        Task<List<ReviewModel>> GetAllReviewsAsync(ReviewQueryDto query, ReviewType? type = null);
        Task<int> GetTotalCountAsync(Guid? userId = null, Guid? vehicleId = null, Guid? deviceId = null, Guid? comboId = null, ReviewType? type = null, ReviewQueryDto? query = null);

        // Update
        Task<ReviewModel> UpdateReviewAsync(ReviewModel review);

        // Delete
        Task<bool> DeleteReviewAsync(Guid reviewId);

        // Check if user owns review
        Task<bool> IsUserReviewOwnerAsync(Guid reviewId, Guid userId);

        // Get review by booking ID
        Task<ReviewModel?> GetReviewByBookingIdAsync(Guid bookingId);
        Task<ReviewModel?> GetReviewByRentalIdAsync(Guid rentalId);

    }
}
