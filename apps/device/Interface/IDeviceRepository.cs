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

        //Dashboard
        Task<int> GetTotalDevicesAsync();

        // User queries
        Task<PagedResult<DeviceEntity>> GetAvailableDevicesAsync(DeviceQuery query);

        // Review management
        Task<bool> AddReviewIdAsync(Guid deviceId, Guid reviewId);
        Task<bool> RemoveReviewIdAsync(Guid deviceId, Guid reviewId);
        Task<bool> UpdateAverageReviewAsync(Guid deviceId, double averageRating);
    }
}