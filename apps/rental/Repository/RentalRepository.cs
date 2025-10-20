using rental.Data;
using rental.Model.Entities;
using rental.Model.Dto;
using Microsoft.EntityFrameworkCore;
using RentalEntity = rental.Model.Entities.Rental;

namespace rental.Repository
{
    public class RentalRepository
    {
        private readonly RentalDbContext _context;

        public RentalRepository(RentalDbContext context)
        {
            _context = context;
        }

        // User: Create rental
        public async Task<RentalEntity> CreateAsync(RentalEntity rental)
        {
            _context.Set<RentalEntity>().Add(rental);
            await _context.SaveChangesAsync();
            return rental;
        }

        // User: Get own rentals
        public async Task<PagedResult<RentalEntity>> GetUserRentalsAsync(Guid userId, RentalQueryDto query)
        {
            var q = _context.Set<RentalEntity>()
                .Where(r => r.UserId == userId)
                .AsQueryable();

            if (!string.IsNullOrEmpty(query.Status))
            {
                q = q.Where(r => r.Status == query.Status);
            }

            if (query.FromDate.HasValue)
            {
                q = q.Where(r => r.StartDate >= query.FromDate.Value);
            }

            if (query.ToDate.HasValue)
            {
                q = q.Where(r => r.EndDate <= query.ToDate.Value);
            }

            var totalCount = await q.CountAsync();

            var sortBy = (query.SortBy ?? "CreatedAt").ToLower();
            var desc = string.Equals(query.SortDirection, "desc", StringComparison.OrdinalIgnoreCase);

            q = sortBy switch
            {
                "startdate" => desc ? q.OrderByDescending(r => r.StartDate) : q.OrderBy(r => r.StartDate),
                "enddate" => desc ? q.OrderByDescending(r => r.EndDate) : q.OrderBy(r => r.EndDate),
                _ => desc ? q.OrderByDescending(r => r.CreatedAt) : q.OrderBy(r => r.CreatedAt)
            };

            var items = await q
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            return new PagedResult<RentalEntity>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            };
        }

        // Get rental by ID
        public async Task<RentalEntity?> GetByIdAsync(Guid id)
        {
            return await _context.Set<RentalEntity>().FindAsync(id);
        }

        // Admin: Get all rentals
        public async Task<PagedResult<RentalEntity>> GetAllRentalsAsync(RentalQueryDto query)
        {
            var q = _context.Set<RentalEntity>().AsQueryable();

            if (query.UserId.HasValue)
            {
                q = q.Where(r => r.UserId == query.UserId.Value);
            }

            if (!string.IsNullOrEmpty(query.Status))
            {
                q = q.Where(r => r.Status == query.Status);
            }

            if (query.FromDate.HasValue)
            {
                q = q.Where(r => r.StartDate >= query.FromDate.Value);
            }

            if (query.ToDate.HasValue)
            {
                q = q.Where(r => r.EndDate <= query.ToDate.Value);
            }

            var totalCount = await q.CountAsync();

            var sortBy = (query.SortBy ?? "CreatedAt").ToLower();
            var desc = string.Equals(query.SortDirection, "desc", StringComparison.OrdinalIgnoreCase);

            q = sortBy switch
            {
                "startdate" => desc ? q.OrderByDescending(r => r.StartDate) : q.OrderBy(r => r.StartDate),
                "enddate" => desc ? q.OrderByDescending(r => r.EndDate) : q.OrderBy(r => r.EndDate),
                _ => desc ? q.OrderByDescending(r => r.CreatedAt) : q.OrderBy(r => r.CreatedAt)
            };

            var items = await q
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            return new PagedResult<RentalEntity>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            };
        }

        // Admin: Update rental
        public async Task<RentalEntity?> UpdateAsync(Guid id, UpdateRentalRequestDto updateDto)
        {
            var rental = await _context.Set<RentalEntity>().FindAsync(id);
            if (rental == null) return null;

            if (!string.IsNullOrEmpty(updateDto.Status))
                rental.Status = updateDto.Status;

            if (updateDto.StartDate.HasValue)
                rental.StartDate = updateDto.StartDate.Value;

            if (updateDto.EndDate.HasValue)
                rental.EndDate = updateDto.EndDate.Value;

            await _context.SaveChangesAsync();
            return rental;
        }

        // Admin: Delete rental
        public async Task<bool> DeleteAsync(Guid id)
        {
            var rental = await _context.Set<RentalEntity>().FindAsync(id);
            if (rental == null) return false;

            _context.Set<RentalEntity>().Remove(rental);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
