using device.Data;
using device.Interface;
using device.Model.Entities;
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

        public async Task<List<Device>> GetDevicesAsync()
        {
            return await _dbContext.Devices
                .Include(x => x.Category)
                .ToListAsync();
        }

        public async Task<Device?> GetDeviceByIdAsync(Guid id)
        {
            return await _dbContext.Devices
                .Include(x => x.Category)
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
    }
}
