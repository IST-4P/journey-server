using device.Data;
using device.Interface;
using device.Model.Entities;
using device.Model.Dto;
using Microsoft.EntityFrameworkCore;

namespace device.Repository
{
    public class ComboRepository : IComboRepository
    {
        private readonly DeviceDbContext _dbContext;

        public ComboRepository(DeviceDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<PagedResult<Combo>> GetCombosAsync(DeviceQuery query)
        {
            var q = _dbContext.Combos
                .Include(c => c.ComboDevices!)
                    .ThenInclude(cd => cd.Device)
                .AsQueryable();

            // Apply search filter
            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.Trim().ToLower();
                q = q.Where(c =>
                    (c.Name != null && c.Name.ToLower().Contains(search)) ||
                    (c.Description != null && c.Description.ToLower().Contains(search)));
            }

            // Apply price filter
            if (query.MinPrice.HasValue)
            {
                q = q.Where(c => c.Price >= query.MinPrice.Value);
            }
            if (query.MaxPrice.HasValue)
            {
                q = q.Where(c => c.Price <= query.MaxPrice.Value);
            }

            var total = await q.LongCountAsync();

            // Apply sorting
            var sortBy = (query.SortBy ?? "createAt").ToLower();
            var desc = string.Equals(query.SortDir, "desc", StringComparison.OrdinalIgnoreCase);
            q = sortBy switch
            {
                "name" => desc ? q.OrderByDescending(c => c.Name) : q.OrderBy(c => c.Name),
                "price" => desc ? q.OrderByDescending(c => c.Price) : q.OrderBy(c => c.Price),
                "updateat" => desc ? q.OrderByDescending(c => c.UpdateAt) : q.OrderBy(c => c.UpdateAt),
                _ => desc ? q.OrderByDescending(c => c.CreateAt) : q.OrderBy(c => c.CreateAt),
            };

            // Pagination
            var page = query.Page <= 0 ? 1 : query.Page;
            var pageSize = query.PageSize <= 0 ? 10 : query.PageSize;
            var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            return new PagedResult<Combo>
            {
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(total / (double)pageSize),
                TotalCount = total,
                Items = items
            };
        }

        public async Task<Combo?> GetComboByIdAsync(Guid id)
        {
            return await _dbContext.Combos
                .Include(c => c.ComboDevices!)
                    .ThenInclude(cd => cd.Device)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Combo> CreateComboAsync(Combo combo, List<ComboDeviceInputDto> deviceItems)
        {
            combo.Id = Guid.NewGuid();
            combo.CreateAt = DateTime.UtcNow;
            combo.UpdateAt = DateTime.UtcNow;

            await _dbContext.Combos.AddAsync(combo);

            // Add devices to combo
            foreach (var item in deviceItems)
            {
                var comboDevice = new ComboDevice
                {
                    Id = Guid.NewGuid(),
                    ComboId = combo.Id,
                    DeviceId = item.DeviceId,
                    Quantity = item.Quantity,
                    CreatedAt = DateTime.UtcNow
                };
                await _dbContext.ComboDevices.AddAsync(comboDevice);
            }

            await _dbContext.SaveChangesAsync();

            // Reload with includes
            return (await GetComboByIdAsync(combo.Id))!;
        }

        public async Task<Combo?> UpdateComboAsync(Guid id, Combo combo, List<ComboDeviceInputDto>? deviceItems)
        {
            var existing = await _dbContext.Combos
                .Include(c => c.ComboDevices)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (existing == null) return null;

            // Update combo properties
            existing.Name = combo.Name ?? existing.Name;
            existing.Price = combo.Price != 0 ? combo.Price : existing.Price;
            existing.Description = combo.Description ?? existing.Description;
            existing.Images = combo.Images ?? existing.Images;
            existing.UpdateAt = DateTime.UtcNow;

            // Update device items if provided
            if (deviceItems != null && deviceItems.Any())
            {
                // Remove existing combo devices
                if (existing.ComboDevices != null)
                {
                    _dbContext.ComboDevices.RemoveRange(existing.ComboDevices);
                }

                // Add new combo devices
                foreach (var item in deviceItems)
                {
                    var comboDevice = new ComboDevice
                    {
                        Id = Guid.NewGuid(),
                        ComboId = existing.Id,
                        DeviceId = item.DeviceId,
                        Quantity = item.Quantity,
                        CreatedAt = DateTime.UtcNow
                    };
                    await _dbContext.ComboDevices.AddAsync(comboDevice);
                }
            }

            await _dbContext.SaveChangesAsync();

            // Reload with includes
            return await GetComboByIdAsync(existing.Id);
        }

        public async Task<bool> DeleteComboAsync(Guid id)
        {
            var existing = await _dbContext.Combos
                .Include(c => c.ComboDevices)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (existing == null) return false;

            // Remove combo devices first
            if (existing.ComboDevices != null)
            {
                _dbContext.ComboDevices.RemoveRange(existing.ComboDevices);
            }

            _dbContext.Combos.Remove(existing);
            await _dbContext.SaveChangesAsync();
            return true;
        }
    }
}
