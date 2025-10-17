using AutoMapper;
using device.Model.Dto;
using device.Model.Entities;

namespace device.Mapping
{
    public class AutoMappingProfile : Profile
    {
        public AutoMappingProfile()
        {
            // Admin mappings
            CreateMap<Device, AdminDeviceDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : null));
            CreateMap<AdminDeviceCreateDto, Device>();
            CreateMap<AdminDeviceUpdateDto, Device>();

            // User mappings
            CreateMap<Device, UserDeviceDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : null))
                .ForMember(dest => dest.Combos, opt => opt.MapFrom(src =>
                    src.ComboDevices != null
                        ? src.ComboDevices.Select(cd => new ComboUserDto
                        {
                            ComboId = cd.ComboId,
                            Name = cd.Combo != null ? cd.Combo.Name : string.Empty,
                            Price = cd.Combo != null ? cd.Combo.Price : 0,
                            Description = cd.Combo != null ? cd.Combo.Description : null,
                            Images = cd.Combo != null ? cd.Combo.Images : null,
                            DeviceCount = cd.Combo != null && cd.Combo.ComboDevices != null ? cd.Combo.ComboDevices.Count : 0
                        }).ToList()
                        : new List<ComboUserDto>()
                ));
        }
    }
}