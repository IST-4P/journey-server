using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using device.Model.Entities;
using device.Model.Dto;
using DeviceEntity = device.Model.Entities.Device;


namespace device.Interface
{
    public interface IDeviceRepository
    {
        Task<PagedResult<DeviceEntity>> GetDevicesAsync(DeviceQuery query);
        Task<DeviceEntity?> GetDeviceByIdAsync(Guid id);
        Task<DeviceEntity> CreateDeviceAsync(DeviceEntity device);
        Task<DeviceEntity?> UpdateDeviceAsync(Guid id, DeviceEntity device); 
        Task<bool> DeleteDeviceAsync(Guid id);

        // User queries
        Task<PagedResult<DeviceEntity>> GetAvailableDevicesAsync(DeviceQuery query);
    }
}