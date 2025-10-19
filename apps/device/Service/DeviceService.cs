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
    public async Task<AdminDeviceDto> CreateDeviceAsync(AdminDeviceCreateDto device)
    {
      var entity = mapper.Map<Device>(device);
      entity.Id = Guid.NewGuid();
      var created = await repository.CreateDeviceAsync(entity);
      return mapper.Map<AdminDeviceDto>(created);

    }

    public async Task<bool> DeleteDeviceAsync(Guid id)
    {
      return await repository.DeleteDeviceAsync(id);
    }

    public async Task<AdminDeviceDto?> GetDeviceByIdAsync(Guid id)
    {
      var device = await repository.GetDeviceByIdAsync(id);
      return device == null ? null : mapper.Map<AdminDeviceDto>(device);
    }

    public async Task<PagedResult<AdminDeviceDto>> GetDevicesAsync(DeviceQuery query)
    {
      var page = await repository.GetDevicesAsync(query);
      return new PagedResult<AdminDeviceDto>
      {
        Page = page.Page,
        PageSize = page.PageSize,
        TotalPages = page.TotalPages,
        TotalCount = page.TotalCount,
        Items = mapper.Map<IEnumerable<AdminDeviceDto>>(page.Items)
      };
    }

    public async Task<AdminDeviceDto?> UpdateDeviceAsync(Guid id, AdminDeviceUpdateDto dto)
    {
      var updated = await repository.UpdateDeviceAsync(id, mapper.Map<Device>(dto));
      return updated is null ? null : mapper.Map<AdminDeviceDto>(updated);
    }

    public async Task<PagedResult<UserDeviceDto>> GetDevicesForUserAsync(DeviceQuery query)
    {
      var page = await repository.GetAvailableDevicesAsync(query);
      return new PagedResult<UserDeviceDto>
      {
        Page = page.Page,
        PageSize = page.PageSize,
        TotalPages = page.TotalPages,
        TotalCount = page.TotalCount,
        Items = mapper.Map<IEnumerable<UserDeviceDto>>(page.Items)
      };
    }

    public async Task<UserDeviceDto?> GetDeviceForUserByIdAsync(Guid id)
    {
      var device = await repository.GetDeviceByIdAsync(id);
      if (device == null || device.Status != "Available") return null;
      return mapper.Map<UserDeviceDto>(device);
    }
  }
}