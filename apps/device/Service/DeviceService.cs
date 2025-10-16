using System.Collections;
using device.Interface;
using device.Model.Dto;
using AutoMapper;
using device.Model.Entities;

namespace device.Service
{
  public class DeviceService : IDeviceService
  {
    private readonly IDeviceRepository repository;
    private readonly IMapper mapper;
    public DeviceService(IDeviceRepository repository, IMapper mapper)
    {
      this.repository = repository;
      this.mapper = mapper;
    }
    public async Task<DeviceDto> CreateDeviceAsync(DeviceCreateDto device)
    {
      var devices = mapper.Map<Device>(device);
      devices.Id = Guid.NewGuid();
      var createDevice = await repository.CreateDeviceAsync(devices);
      return mapper.Map<DeviceDto>(createDevice);

    }

    public async Task<bool> DeleteDeviceAsync(Guid id)
    {
      return await repository.DeleteDeviceAsync(id);
    }

    public async Task<DeviceDto?> GetDeviceByIdAsync(Guid id)
    {
      var device = await repository.GetDeviceByIdAsync(id);
      return device == null ? null : mapper.Map<DeviceDto>(device);
    }

    public async Task<IEnumerable<DeviceDto>> GetDevicesAsync()
    {
      var devices = await repository.GetDevicesAsync();
      return mapper.Map<IEnumerable<DeviceDto>>(devices);
    }

    public async Task<DeviceDto?> UpdateDeviceAsync(Guid id, DeviceUpdateDto dto)
    {
      var updated = await repository.UpdateDeviceAsync(id, mapper.Map<Device>(dto));
      return updated is null ? null : mapper.Map<DeviceDto>(updated);
    }

    public async Task<IEnumerable<UserDeviceDto>> GetDevicesForUserAsync()
    {
      var devices = await repository.GetDevicesAsync();
      var available = devices.Where(d => d.Status == "available"); // lọc chỉ thiết bị có thể thuê
      return mapper.Map<IEnumerable<UserDeviceDto>>(available);
    }

    public async Task<UserDeviceDto?> GetDeviceForUserByIdAsync(Guid id)
    {
      var device = await repository.GetDeviceByIdAsync(id);
      if (device == null || device.Status != "available") return null;
      return mapper.Map<UserDeviceDto>(device);
    }



  }
}