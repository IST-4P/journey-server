using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using device.Model.Dto;
using device.Model.Entities;


namespace device.Interface
{
    public interface IDeviceService
    {
        // Admin 
        Task<PagedResult<AdminDeviceDto>> GetDevicesAsync(DeviceQuery query);
        Task<AdminDeviceDto?> GetDeviceByIdAsync(Guid id);
        Task<AdminDeviceDto> CreateDeviceAsync(AdminDeviceCreateDto device);
        Task<AdminDeviceDto?> UpdateDeviceAsync(Guid id, AdminDeviceUpdateDto dto);
        Task<bool> DeleteDeviceAsync(Guid id);

        // User
        Task<PagedResult<UserDeviceDto>> GetDevicesForUserAsync(DeviceQuery query);
        Task<UserDeviceDto?> GetDeviceForUserByIdAsync(Guid id);
    }
}