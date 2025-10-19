using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using device.Model.Entities;
using device.Model.Dto;

namespace device.Interface
{
    public interface IDeviceRepository
    {
        Task<PagedResult<Device>> GetDevicesAsync(DeviceQuery query);
        Task<Device?> GetDeviceByIdAsync(Guid id);
        Task<Device> CreateDeviceAsync(Device device);
        Task<Device?> UpdateDeviceAsync(Guid id, Device device);
        Task<bool> DeleteDeviceAsync(Guid id);

        // User queries
        Task<PagedResult<Device>> GetAvailableDevicesAsync(DeviceQuery query);
    }
}