using AutoMapper;
using rental.Model.Dto;
using RentalEntity = rental.Model.Entities.Rental;

namespace rental.Mapping
{
    public class AutoMapping : Profile
    {
        public AutoMapping()
        {
            // Entity to Response DTOs
            CreateMap<RentalEntity, UserRentalDto>();
            CreateMap<RentalEntity, AdminRentalDto>();

            // Request DTOs to Entity
            CreateMap<CreateRentalRequestDto, RentalEntity>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore());

            CreateMap<UpdateRentalRequestDto, RentalEntity>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.Items, opt => opt.Ignore())
                .ForMember(dest => dest.TotalQuantity, opt => opt.Ignore())
                .ForMember(dest => dest.RentalFee, opt => opt.Ignore())
                .ForMember(dest => dest.Deposit, opt => opt.Ignore())
                .ForMember(dest => dest.DiscountPercent, opt => opt.Ignore())
                .ForMember(dest => dest.MaxDiscount, opt => opt.Ignore())
                .ForMember(dest => dest.TotalPrice, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}
