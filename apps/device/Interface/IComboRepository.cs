using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using device.Model.Entities;
using device.Model.Dto;

namespace device.Interface
{
    public interface IComboRepository
    {
        // Admin operations
        Task<PagedResult<Combo>> GetCombosAsync(DeviceQuery query);
        Task<Combo?> GetComboByIdAsync(Guid id);
        Task<Combo> CreateComboAsync(Combo combo, List<ComboDeviceInputDto> deviceItems);
        Task<Combo?> UpdateComboAsync(Guid id, Combo combo, List<ComboDeviceInputDto>? deviceItems);
        Task<bool> DeleteComboAsync(Guid id);
    }
}
