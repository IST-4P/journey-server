using AutoMapper;
using device.Model.Dto;
using device.Model.Entities;

namespace device.Mapping
{
    public class AutoMapping : Profile
    {
        public AutoMapping()
        {
            // ============================================
            // DEVICE MAPPINGS - ADMIN
            // ============================================

            CreateMap<device.Model.Entities.Device, AdminDeviceDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : null));

            CreateMap<AdminDeviceCreateDto, device.Model.Entities.Device>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreateAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdateAt, opt => opt.Ignore())
                .ForMember(dest => dest.Category, opt => opt.Ignore())
                .ForMember(dest => dest.ComboDevices, opt => opt.Ignore());

            CreateMap<AdminDeviceUpdateDto, device.Model.Entities.Device>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreateAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdateAt, opt => opt.Ignore())
                .ForMember(dest => dest.Category, opt => opt.Ignore())
                .ForMember(dest => dest.ComboDevices, opt => opt.Ignore())
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // ============================================
            // DEVICE MAPPINGS - USER
            // ============================================

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

            // ============================================
            // COMBO MAPPINGS - ADMIN
            // ============================================

            CreateMap<Combo, AdminComboDto>()
                .ForMember(dest => dest.Devices, opt => opt.MapFrom(src =>
                    src.ComboDevices != null
                        ? src.ComboDevices.Select(cd => new ComboDeviceItemDto
                        {
                            DeviceId = cd.DeviceId,
                            DeviceName = cd.Device != null ? cd.Device.Name : string.Empty,
                            DevicePrice = cd.Device != null ? cd.Device.Price : 0,
                            Quantity = cd.Quantity
                        }).ToList()
                        : new List<ComboDeviceItemDto>()
                ));

            CreateMap<AdminComboCreateDto, Combo>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreateAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdateAt, opt => opt.Ignore())
                .ForMember(dest => dest.ComboDevices, opt => opt.Ignore()); // Handle separately in service

            CreateMap<AdminComboUpdateDto, Combo>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreateAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdateAt, opt => opt.Ignore())
                .ForMember(dest => dest.ComboDevices, opt => opt.Ignore()) // Handle separately in service
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // ============================================
            // COMBO MAPPINGS - USER (summary only)
            // ============================================

            CreateMap<Combo, ComboUserDto>()
                .ForMember(dest => dest.ComboId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.DeviceCount, opt => opt.MapFrom(src =>
                    src.ComboDevices != null ? src.ComboDevices.Count : 0));
        }
    }
}