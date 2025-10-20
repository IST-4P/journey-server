using AutoMapper;
using device.Model.Dto;
using device.Model.Entities;

namespace device.Mapping
{
    public class AutoMapping : Profile
    {
        public AutoMapping()
        {
            // Admin mappings
            CreateMap<device.Model.Entities.Device, AdminDeviceDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : null));
            CreateMap<AdminDeviceCreateDto, device.Model.Entities.Device>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreateAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdateAt, opt => opt.Ignore());
            CreateMap<AdminDeviceUpdateDto, device.Model.Entities.Device>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreateAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdateAt, opt => opt.Ignore())
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // User mappings
            CreateMap<device.Model.Entities.Device, UserDeviceDto>()
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