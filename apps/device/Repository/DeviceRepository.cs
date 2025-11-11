using device.Data;
using device.Interface;
using device.Model.Entities;
using device.Model.Dto;
using Microsoft.EntityFrameworkCore;
using DeviceEntity = device.Model.Entities.Device;

namespace device.Repository
{
    public class DeviceRepository : IDeviceRepository
    {
        private readonly DeviceDbContext _dbContext;
        public DeviceRepository(DeviceDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        private static IQueryable<DeviceEntity> ApplyFilter(IQueryable<DeviceEntity> queryable, DeviceQuery query)
        {
            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.Trim().ToLower();
                queryable = queryable.Where(d =>
                    (d.Name != null && d.Name.ToLower().Contains(search)) ||
                    (d.Description != null && d.Description.ToLower().Contains(search)));
            }
            if (query.CategoryId.HasValue)
            {
                queryable = queryable.Where(d => d.CategoryId == query.CategoryId.Value);
            }
            if (!string.IsNullOrWhiteSpace(query.Status))
            {
                queryable = queryable.Where(d => d.Status == query.Status);
            }
            if (query.MinPrice.HasValue)
            {
                queryable = queryable.Where(d => d.Price >= query.MinPrice.Value);
            }
            if (query.MaxPrice.HasValue)
            {
                queryable = queryable.Where(d => d.Price <= query.MaxPrice.Value);
            }
            return queryable;
        }

        private static IQueryable<DeviceEntity> ApplySort(IQueryable<DeviceEntity> queryable, DeviceQuery query)
        {
            var sortBy = (query.SortBy ?? "createAt").ToLower();
            var desc = string.Equals(query.SortDir, "desc", StringComparison.OrdinalIgnoreCase);
            return sortBy switch
            {
                "name" => desc ? queryable.OrderByDescending(d => d.Name) : queryable.OrderBy(d => d.Name),
                "price" => desc ? queryable.OrderByDescending(d => d.Price) : queryable.OrderBy(d => d.Price),
                "updateat" => desc ? queryable.OrderByDescending(d => d.UpdateAt) : queryable.OrderBy(d => d.UpdateAt),
                "category" => desc ? queryable.OrderByDescending(d => d.CategoryId) : queryable.OrderBy(d => d.CategoryId),
                _ => desc ? queryable.OrderByDescending(d => d.CreateAt) : queryable.OrderBy(d => d.CreateAt),
            };
        }

        private static PagedResult<DeviceEntity> ToPaged<T>(IQueryable<DeviceEntity> source, DeviceQuery query, long totalCount)
        {
            var page = query.Page <= 0 ? 1 : query.Page;
            var pageSize = query.PageSize <= 0 ? 10 : query.PageSize;
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
            return new PagedResult<DeviceEntity>
            {
                Page = page,
                PageSize = pageSize,
                TotalPages = totalPages,
                TotalCount = totalCount,
                Items = source.Skip((page - 1) * pageSize).Take(pageSize).ToList(),
            };
        }

        public async Task<PagedResult<DeviceEntity>> GetDevicesAsync(DeviceQuery query)
        {
            var q = _dbContext.Set<DeviceEntity>().Include(x => x.Category).AsQueryable();
            q = ApplyFilter(q, query);
            var total = await q.LongCountAsync();
            q = ApplySort(q, query);
            var page = query.Page <= 0 ? 1 : query.Page;
            var pageSize = query.PageSize <= 0 ? 10 : query.PageSize;
            var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return new PagedResult<DeviceEntity>
            {
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(total / (double)pageSize),
                TotalCount = total,
                Items = items
            };
        }

        public async Task<DeviceEntity?> GetDeviceByIdAsync(Guid id)
        {
            return await _dbContext.Set<DeviceEntity>()
                .Include(x => x.Category)
                .Include(x => x.ComboDevices!)
                    .ThenInclude(cd => cd.Combo)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<DeviceEntity> CreateDeviceAsync(DeviceEntity device)
        {
            await _dbContext.Set<DeviceEntity>().AddAsync(device);
            await _dbContext.SaveChangesAsync();
            return device;
        }

        public async Task<DeviceEntity?> UpdateDeviceAsync(Guid id, DeviceEntity device)
        {
            var existing = await _dbContext.Set<DeviceEntity>().FirstOrDefaultAsync(x => x.Id == id);
            if (existing == null) return null;

            existing.Name = device.Name ?? existing.Name;
            existing.Price = device.Price != 0 ? device.Price : existing.Price;
            existing.Description = device.Description ?? existing.Description;
            existing.Status = device.Status ?? existing.Status;
            existing.Quantity = device.Quantity ?? existing.Quantity;
            existing.Information = device.Information ?? existing.Information;
            existing.Images = device.Images ?? existing.Images;
            existing.CategoryId = device.CategoryId != Guid.Empty ? device.CategoryId : existing.CategoryId;
            existing.UpdateAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();
            return existing;
        }


        public async Task<bool> DeleteDeviceAsync(Guid id)
        {
            var existing = await _dbContext.Set<DeviceEntity>().FirstOrDefaultAsync(x => x.Id == id);
            if (existing == null) return false;

            _dbContext.Set<DeviceEntity>().Remove(existing);
            await _dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<PagedResult<DeviceEntity>> GetAvailableDevicesAsync(DeviceQuery query)
        {
            var q = _dbContext.Set<DeviceEntity>()
                .Include(x => x.Category)
                .Include(x => x.ComboDevices!).ThenInclude(cd => cd.Combo)
                .Where(d => d.Status == "Available")
                .AsQueryable();

            q = ApplyFilter(q, query);
            var total = await q.LongCountAsync();
            q = ApplySort(q, query);
            var page = query.Page <= 0 ? 1 : query.Page;
            var pageSize = query.PageSize <= 0 ? 10 : query.PageSize;
            var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            return new PagedResult<DeviceEntity>
            {
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(total / (double)pageSize),
                TotalCount = total,
                Items = items
            };
        }

        public async Task<bool> AddReviewIdAsync(Guid deviceId, Guid reviewId)
        {
            var device = await _dbContext.Set<DeviceEntity>().FirstOrDefaultAsync(x => x.Id == deviceId);
            if (device == null) return false;

            if (device.TotalReviewIds == null)
            {
                device.TotalReviewIds = new List<string>();
            }

            var reviewIdString = reviewId.ToString();
            if (!device.TotalReviewIds.Contains(reviewIdString))
            {
                device.TotalReviewIds.Add(reviewIdString);
                device.UpdateAt = DateTime.UtcNow;
                await _dbContext.SaveChangesAsync();
            }

            return true;
        }
    }
}
