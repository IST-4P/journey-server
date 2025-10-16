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
        Task<IEnumerable<DeviceDto>> GetDevicesAsync();
        Task<DeviceDto?> GetDeviceByIdAsync(Guid id);
        Task<DeviceDto> CreateDeviceAsync(DeviceCreateDto device);
        Task<DeviceDto?> UpdateDeviceAsync(Guid id, DeviceUpdateDto dto);
        Task<bool> DeleteDeviceAsync(Guid id);
        Task<IEnumerable<UserDeviceDto>> GetDevicesForUserAsync();
        Task<UserDeviceDto?> GetDeviceForUserByIdAsync(Guid id);

    }
}