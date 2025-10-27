using AutoMapper;
using ComplaintService.Model;
using Google.Protobuf.WellKnownTypes;

namespace ComplaintService.Mapping
{
    public class ComplaintMappingProfile : Profile
    {
        public ComplaintMappingProfile()
        {
            // Entity to DTO
            CreateMap<Complaint, ComplaintDto>();
            CreateMap<Complaint, ComplaintSummaryDto>();

            // DTO to Entity
            CreateMap<CreateComplaintDto, Complaint>();
            CreateMap<UpdateComplaintStatusDto, Complaint>()
                .ForMember(dest => dest.ResolvedAt, opt => opt.MapFrom((src, dest) =>
                    (src.Status == ComplaintStatus.Resolved || src.Status == ComplaintStatus.Rejected)
                        ? DateTime.UtcNow
                        : dest.ResolvedAt));

            // Proto to DTO
            CreateMap<ComplaintProto.CreateComplaintRequest, CreateComplaintDto>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => Guid.Parse(src.UserId)))
                .ForMember(dest => dest.RentalId, opt => opt.MapFrom(src => Guid.Parse(src.RentalId)))
                .ForMember(dest => dest.DeviceId, opt => opt.MapFrom(src =>
                    string.IsNullOrEmpty(src.DeviceId) ? (Guid?)null : Guid.Parse(src.DeviceId)))
                .ForMember(dest => dest.VehicleId, opt => opt.MapFrom(src =>
                    string.IsNullOrEmpty(src.VehicleId) ? (Guid?)null : Guid.Parse(src.VehicleId)))
                .ForMember(dest => dest.ComboId, opt => opt.MapFrom(src =>
                    string.IsNullOrEmpty(src.ComboId) ? (Guid?)null : Guid.Parse(src.ComboId)))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => (ComplaintType)src.Type))
                .ForMember(dest => dest.EvidenceImages, opt => opt.MapFrom(src => src.EvidenceImages.ToList()));

            CreateMap<ComplaintProto.UpdateComplaintStatusRequest, UpdateComplaintStatusDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.Parse(src.Id)))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => (ComplaintStatus)src.Status))
                .ForMember(dest => dest.AdminId, opt => opt.MapFrom(src =>
                    string.IsNullOrEmpty(src.AdminId) ? (Guid?)null : Guid.Parse(src.AdminId)));

            // Entity/DTO to Proto
            CreateMap<Complaint, ComplaintProto.Complaint>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()))
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId.ToString()))
                .ForMember(dest => dest.RentalId, opt => opt.MapFrom(src => src.RentalId.ToString()))
                .ForMember(dest => dest.DeviceId, opt => opt.MapFrom(src => src.DeviceId.HasValue ? src.DeviceId.Value.ToString() : string.Empty))
                .ForMember(dest => dest.VehicleId, opt => opt.MapFrom(src => src.VehicleId.HasValue ? src.VehicleId.Value.ToString() : string.Empty))
                .ForMember(dest => dest.ComboId, opt => opt.MapFrom(src => src.ComboId.HasValue ? src.ComboId.Value.ToString() : string.Empty))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => (ComplaintProto.ComplaintType)src.Type))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => (ComplaintProto.ComplaintStatus)src.Status))
                .ForMember(dest => dest.AdminId, opt => opt.MapFrom(src => src.AdminId.HasValue ? src.AdminId.Value.ToString() : string.Empty))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => Timestamp.FromDateTime(src.CreatedAt.ToUniversalTime())))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => Timestamp.FromDateTime(src.UpdatedAt.ToUniversalTime())))
                .ForMember(dest => dest.ResolvedAt, opt => opt.MapFrom(src => src.ResolvedAt.HasValue ? Timestamp.FromDateTime(src.ResolvedAt.Value.ToUniversalTime()) : null))
                .ForMember(dest => dest.EvidenceImages, opt => opt.MapFrom(src => src.EvidenceImages));

            CreateMap<Complaint, ComplaintProto.ComplaintSummary>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()))
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId.ToString()))
                .ForMember(dest => dest.RentalId, opt => opt.MapFrom(src => src.RentalId.ToString()))
                .ForMember(dest => dest.DeviceId, opt => opt.MapFrom(src => src.DeviceId.HasValue ? src.DeviceId.Value.ToString() : string.Empty))
                .ForMember(dest => dest.VehicleId, opt => opt.MapFrom(src => src.VehicleId.HasValue ? src.VehicleId.Value.ToString() : string.Empty))
                .ForMember(dest => dest.ComboId, opt => opt.MapFrom(src => src.ComboId.HasValue ? src.ComboId.Value.ToString() : string.Empty))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => (ComplaintProto.ComplaintType)src.Type))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => (ComplaintProto.ComplaintStatus)src.Status))
                .ForMember(dest => dest.AdminId, opt => opt.MapFrom(src => src.AdminId.HasValue ? src.AdminId.Value.ToString() : string.Empty))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => Timestamp.FromDateTime(src.CreatedAt.ToUniversalTime())))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => Timestamp.FromDateTime(src.UpdatedAt.ToUniversalTime())))
                .ForMember(dest => dest.ResolvedAt, opt => opt.MapFrom(src => src.ResolvedAt.HasValue ? Timestamp.FromDateTime(src.ResolvedAt.Value.ToUniversalTime()) : null));
        }
    }
}
