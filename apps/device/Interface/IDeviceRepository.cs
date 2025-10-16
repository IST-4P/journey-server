using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using device.Model.Entities; 
{
    
}
namespace device.Interface
{
    public interface IDeviceRepository
    {
        Task<List<Device>> GetDevicesAsync();
        Task<Device?> GetDeviceByIdAsync(Guid id);
        Task<Device> CreateDeviceAsync(Device device);
        Task<Device?> UpdateDeviceAsync(Guid id, Device device);
        Task<bool> DeleteDeviceAsync(Guid id);

    }
}