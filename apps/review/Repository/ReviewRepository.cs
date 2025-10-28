using Microsoft.EntityFrameworkCore;
using review.Data;
using review.Interface;
using review.Model.Dto;
using ReviewModel = review.Model.Review;
using ReviewType = review.Model.ReviewType;

namespace review.Repository
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly ReviewDbContext _context;

        public ReviewRepository(ReviewDbContext context)
        {
            _context = context;
        }

        public async Task<ReviewModel> CreateReviewAsync(ReviewModel review)
        {
            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();
            return review;
        }

        public async Task<ReviewModel?> GetReviewByIdAsync(Guid reviewId)
        {
            return await _context.Reviews.FindAsync(reviewId);
        }

        public async Task<List<ReviewModel>> GetReviewsByUserIdAsync(Guid userId, ReviewQueryDto query)
        {
            var dbQuery = _context.Reviews.Where(r => r.UserId == userId);
            dbQuery = ApplyFiltersAndSorting(dbQuery, query);

            return await dbQuery
                .Skip((query.Page - 1) * query.Limit)
                .Take(query.Limit)
                .ToListAsync();
        }

        public async Task<List<ReviewModel>> GetReviewsByVehicleIdAsync(Guid vehicleId, ReviewQueryDto query)
        {
            var dbQuery = _context.Reviews.Where(r => r.VehicleId == vehicleId);
            dbQuery = ApplyFiltersAndSorting(dbQuery, query);

            return await dbQuery
                .Skip((query.Page - 1) * query.Limit)
                .Take(query.Limit)
                .ToListAsync();
        }

        public async Task<List<ReviewModel>> GetReviewsByDeviceIdAsync(Guid deviceId, ReviewQueryDto query)
        {
            var dbQuery = _context.Reviews.Where(r => r.DeviceId == deviceId);
            dbQuery = ApplyFiltersAndSorting(dbQuery, query);

            return await dbQuery
                .Skip((query.Page - 1) * query.Limit)
                .Take(query.Limit)
                .ToListAsync();
        }

        public async Task<List<ReviewModel>> GetReviewsByComboIdAsync(Guid comboId, ReviewQueryDto query)
        {
            var dbQuery = _context.Reviews.Where(r => r.ComboId == comboId);
            dbQuery = ApplyFiltersAndSorting(dbQuery, query);

            return await dbQuery
                .Skip((query.Page - 1) * query.Limit)
                .Take(query.Limit)
                .ToListAsync();
        }

        public async Task<List<ReviewModel>> GetAllReviewsAsync(ReviewQueryDto query, ReviewType? type = null)
        {
            var dbQuery = _context.Reviews.AsQueryable();

            if (type.HasValue)
            {
                dbQuery = dbQuery.Where(r => r.Type == type.Value);
            }

            dbQuery = ApplyFiltersAndSorting(dbQuery, query);

            return await dbQuery
                .Skip((query.Page - 1) * query.Limit)
                .Take(query.Limit)
                .ToListAsync();
        }

        public async Task<int> GetTotalCountAsync(Guid? userId = null, Guid? vehicleId = null,
            Guid? deviceId = null, Guid? comboId = null, ReviewType? type = null, ReviewQueryDto? query = null)
        {
            var dbQuery = _context.Reviews.AsQueryable();

            if (userId.HasValue)
                dbQuery = dbQuery.Where(r => r.UserId == userId.Value);

            if (vehicleId.HasValue)
                dbQuery = dbQuery.Where(r => r.VehicleId == vehicleId.Value);

            if (deviceId.HasValue)
                dbQuery = dbQuery.Where(r => r.DeviceId == deviceId.Value);

            if (comboId.HasValue)
                dbQuery = dbQuery.Where(r => r.ComboId == comboId.Value);

            if (type.HasValue)
                dbQuery = dbQuery.Where(r => r.Type == type.Value);

            // Apply filters from query
            if (query != null)
            {
                dbQuery = ApplyFilters(dbQuery, query);
            }

            return await dbQuery.CountAsync();
        }

        public async Task<ReviewModel> UpdateReviewAsync(ReviewModel review)
        {
            _context.Reviews.Update(review);
            await _context.SaveChangesAsync();
            return review;
        }

        public async Task<bool> DeleteReviewAsync(Guid reviewId)
        {
            var review = await _context.Reviews.FindAsync(reviewId);
            if (review == null)
                return false;

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IsUserReviewOwnerAsync(Guid reviewId, Guid userId)
        {
            return await _context.Reviews
                .AnyAsync(r => r.Id == reviewId && r.UserId == userId);
        }

        public async Task<bool> HasBookingBeenReviewedAsync(Guid bookingId)
        {
            return await _context.Reviews.AnyAsync(r => r.BookingId == bookingId);
        }

        public async Task<ReviewModel?> GetReviewByBookingIdAsync(Guid bookingId)
        {
            return await _context.Reviews.FirstOrDefaultAsync(r => r.BookingId == bookingId);
        }

        private IQueryable<ReviewModel> ApplyFiltersAndSorting(IQueryable<ReviewModel> query, ReviewQueryDto dto)
        {
            query = ApplyFilters(query, dto);
            query = ApplySorting(query, dto);
            return query;
        }

        private IQueryable<ReviewModel> ApplyFilters(IQueryable<ReviewModel> query, ReviewQueryDto dto)
        {
            // Search text in title or content
            if (!string.IsNullOrWhiteSpace(dto.SearchText))
            {
                var searchLower = dto.SearchText.ToLower();
                query = query.Where(r =>
                    r.Title.ToLower().Contains(searchLower) ||
                    r.Content.ToLower().Contains(searchLower));
            }

            // Rating filter
            if (dto.MinRating.HasValue)
            {
                query = query.Where(r => r.Rating >= dto.MinRating.Value);
            }

            if (dto.MaxRating.HasValue)
            {
                query = query.Where(r => r.Rating <= dto.MaxRating.Value);
            }

            // Date range filter
            if (dto.StartDate.HasValue)
            {
                query = query.Where(r => r.CreatedAt >= dto.StartDate.Value);
            }

            if (dto.EndDate.HasValue)
            {
                query = query.Where(r => r.CreatedAt <= dto.EndDate.Value);
            }

            return query;
        }

        private IQueryable<ReviewModel> ApplySorting(IQueryable<ReviewModel> query, ReviewQueryDto dto)
        {
            // Apply sorting based on SortBy and SortOrder
            query = dto.SortBy switch
            {
                SortField.CreatedAt => dto.SortOrder == SortOrder.Ascending
                    ? query.OrderBy(r => r.CreatedAt)
                    : query.OrderByDescending(r => r.CreatedAt),

                SortField.UpdatedAt => dto.SortOrder == SortOrder.Ascending
                    ? query.OrderBy(r => r.UpdatedAt)
                    : query.OrderByDescending(r => r.UpdatedAt),

                SortField.Rating => dto.SortOrder == SortOrder.Ascending
                    ? query.OrderBy(r => r.Rating)
                    : query.OrderByDescending(r => r.Rating),

                SortField.Title => dto.SortOrder == SortOrder.Ascending
                    ? query.OrderBy(r => r.Title)
                    : query.OrderByDescending(r => r.Title),

                _ => query.OrderByDescending(r => r.CreatedAt)
            };

            return query;
        }
    }
}
