using review.Model.Dto;
using ReviewModel = review.Model.Review;
using ReviewType = review.Model.ReviewType;

namespace review.Interface
{
    public interface IReviewService
    {
        // User operations
        Task<ReviewModel> CreateReviewAsync(CreateReviewDto dto);
        Task<ReviewModel> UpdateReviewAsync(UpdateReviewDto dto);
        Task<bool> DeleteReviewAsync(Guid reviewId, Guid userId);
        Task<ReviewModel?> GetReviewByIdAsync(Guid reviewId);
        Task<PagedResultDto<ReviewModel>> GetMyReviewsAsync(Guid userId, ReviewQueryDto query);

        // Public operations
        Task<PagedResultDto<ReviewModel>> GetReviewsByVehicleIdAsync(Guid vehicleId, ReviewQueryDto query);
        Task<PagedResultDto<ReviewModel>> GetReviewsByDeviceIdAsync(Guid deviceId, ReviewQueryDto query);
        Task<PagedResultDto<ReviewModel>> GetReviewsByComboIdAsync(Guid comboId, ReviewQueryDto query);

        // Admin operations
        Task<PagedResultDto<ReviewModel>> GetAllReviewsAsync(ReviewQueryDto query, ReviewType? type = null);
        Task<bool> AdminDeleteReviewAsync(Guid reviewId, Guid adminId);
    }
}
