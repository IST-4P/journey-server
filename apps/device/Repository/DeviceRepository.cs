using device.Data;
using device.Interface;
using device.Model.Entities;
using device.Model.Dto;
using Microsoft.EntityFrameworkCore;

namespace device.Repository
{
    public class DeviceRepository : IDeviceRepository
    {
        private readonly DeviceDbContext _dbContext;
        public DeviceRepository(DeviceDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        private static IQueryable<Device> ApplyFilter(IQueryable<Device> queryable, DeviceQuery query)
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

        private static IQueryable<Device> ApplySort(IQueryable<Device> queryable, DeviceQuery query)
        {
            var sortBy = (query.SortBy ?? "createAt").ToLower();
            var desc = string.Equals(query.SortDir, "desc", StringComparison.OrdinalIgnoreCase);
            return sortBy switch
            {
                "name" => desc ? queryable.OrderByDescending(d => d.Name) : queryable.OrderBy(d => d.Name),
                "price" => desc ? queryable.OrderByDescending(d => d.Price) : queryable.OrderBy(d => d.Price),
                "updateat" => desc ? queryable.OrderByDescending(d => d.UpdateAt) : queryable.OrderBy(d => d.UpdateAt),
                _ => desc ? queryable.OrderByDescending(d => d.CreateAt) : queryable.OrderBy(d => d.CreateAt),
            };
        }

        private static PagedResult<Device> ToPaged<T>(IQueryable<Device> source, DeviceQuery query, long totalCount)
        {
            var page = query.Page <= 0 ? 1 : query.Page;
            var pageSize = query.PageSize <= 0 ? 10 : query.PageSize;
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
            return new PagedResult<Device>
            {
                Page = page,
                PageSize = pageSize,
                TotalPages = totalPages,
                TotalCount = totalCount,
                Items = source.Skip((page - 1) * pageSize).Take(pageSize).ToList(),
            };
        }

        public async Task<PagedResult<Device>> GetDevicesAsync(DeviceQuery query)
        {
            var q = _dbContext.Devices.Include(x => x.Category).AsQueryable();
            q = ApplyFilter(q, query);
            var total = await q.LongCountAsync();
            q = ApplySort(q, query);
            var page = query.Page <= 0 ? 1 : query.Page;
            var pageSize = query.PageSize <= 0 ? 10 : query.PageSize;
            var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return new PagedResult<Device>
            {
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(total / (double)pageSize),
                TotalCount = total,
                Items = items
            };
        }

        public async Task<Device?> GetDeviceByIdAsync(Guid id)
        {
            return await _dbContext.Devices
                .Include(x => x.Category)
                .Include(x => x.ComboDevices!) // for user combo projection when needed
                    .ThenInclude(cd => cd.Combo)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<Device> CreateDeviceAsync(Device device)
        {
            await _dbContext.Devices.AddAsync(device);
            await _dbContext.SaveChangesAsync();
            return device;
        }

        public async Task<Device?> UpdateDeviceAsync(Guid id, Device device)
        {
            var existing = await _dbContext.Devices.FirstOrDefaultAsync(x => x.Id == id);
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
            var existing = await _dbContext.Devices.FirstOrDefaultAsync(x => x.Id == id);
            if (existing == null) return false;

            _dbContext.Devices.Remove(existing);
            await _dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<PagedResult<Device>> GetAvailableDevicesAsync(DeviceQuery query)
        {
            // Force available status for user view
            var q = _dbContext.Devices
                .Include(x => x.Category)
                .Include(x => x.ComboDevices!).ThenInclude(cd => cd.Combo)
                .Where(d => d.Status == "available")
                .AsQueryable();

            q = ApplyFilter(q, query);
            var total = await q.LongCountAsync();
            q = ApplySort(q, query);
            var page = query.Page <= 0 ? 1 : query.Page;
            var pageSize = query.PageSize <= 0 ? 10 : query.PageSize;
            var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            return new PagedResult<Device>
            {
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(total / (double)pageSize),
                TotalCount = total,
                Items = items
            };
        }
    }
}
