using device.Data;
using device.Interface;
using device.Model.Entities;
using device.Model.Dto;
using Microsoft.EntityFrameworkCore;

namespace device.Repository
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly DeviceDbContext _dbContext;

        public CategoryRepository(DeviceDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        private static IQueryable<Category> ApplyFilter(IQueryable<Category> queryable, DeviceQuery query)
        {
            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.Trim().ToLower();
                queryable = queryable.Where(c => c.Name.ToLower().Contains(search));
            }
            return queryable;
        }

        private static IQueryable<Category> ApplySort(IQueryable<Category> queryable, DeviceQuery query)
        {
            var sortBy = (query.SortBy ?? "createAt").ToLower();
            var desc = string.Equals(query.SortDir, "desc", StringComparison.OrdinalIgnoreCase);
            return sortBy switch
            {
                "name" => desc ? queryable.OrderByDescending(c => c.Name) : queryable.OrderBy(c => c.Name),
                "updateat" => desc ? queryable.OrderByDescending(c => c.UpdateAt) : queryable.OrderBy(c => c.UpdateAt),
                "createat" => desc ? queryable.OrderByDescending(c => c.CreateAt) : queryable.OrderBy(c => c.CreateAt),
                _ => desc ? queryable.OrderByDescending(c => c.CreateAt) : queryable.OrderBy(c => c.CreateAt),
            };
        }

        public async Task<PagedResult<Category>> GetCategoryAsync(DeviceQuery query)
        {
            var q = _dbContext.Categories.Include(c => c.Devices).AsQueryable();
            q = ApplyFilter(q, query);
            var total = await q.LongCountAsync();
            q = ApplySort(q, query);

            var page = query.Page <= 0 ? 1 : query.Page;
            var pageSize = query.PageSize <= 0 ? 10 : query.PageSize;
            var items = await q
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<Category>
            {
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(total / (double)pageSize),
                TotalCount = total,
                Items = items
            };
        }

        public async Task<Category?> GetCategoryByIdAsync(Guid id)
        {
            return await _dbContext.Categories.Include(c => c.Devices).FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Category> CreateCategoryAsync(Category category)
        {
            await _dbContext.Categories.AddAsync(category);
            await _dbContext.SaveChangesAsync();
            return category;
        }

        public async Task<Category?> UpdateCategoryAsync(Guid id, Category category)
        {
            var existing = await _dbContext.Categories.FirstOrDefaultAsync(c => c.Id == id);
            if (existing == null) return null;

            existing.Name = category.Name ?? existing.Name;
            existing.LogoUrl = category.LogoUrl ?? existing.LogoUrl;
            existing.UpdateAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteCategoryAsync(Guid id)
        {
            var existing = await _dbContext.Categories.Include(c => c.Devices).FirstOrDefaultAsync(c => c.Id == id);
            if (existing == null) return false;

            _dbContext.Categories.Remove(existing);
            await _dbContext.SaveChangesAsync();
            return true;
        }
    }
}
