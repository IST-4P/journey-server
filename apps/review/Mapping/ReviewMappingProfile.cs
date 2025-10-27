using AutoMapper;
using Google.Protobuf.Collections;
using ReviewModel = review.Model.Review;
using ReviewType = review.Model.ReviewType;
using ProtoReview = Review.Review;
using ProtoReviewType = Review.ReviewType;

namespace review.Mapping
{
    public class ReviewMappingProfile : Profile
    {
        public ReviewMappingProfile()
        {
            // Model to Proto
            CreateMap<ReviewModel, ProtoReview>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()))
                .ForMember(dest => dest.VehicleId, opt => opt.MapFrom(src => src.VehicleId.HasValue ? src.VehicleId.Value.ToString() : string.Empty))
                .ForMember(dest => dest.DeviceId, opt => opt.MapFrom(src => src.DeviceId.HasValue ? src.DeviceId.Value.ToString() : string.Empty))
                .ForMember(dest => dest.ComboId, opt => opt.MapFrom(src => src.ComboId.HasValue ? src.ComboId.Value.ToString() : string.Empty))
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId.ToString()))
                .ForMember(dest => dest.Rating, opt => opt.MapFrom(src => src.Rating))
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Title))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => MapReviewTypeToProto(src.Type)))
                .ForMember(dest => dest.Content, opt => opt.MapFrom(src => src.Content))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt.ToString("o")))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt.ToString("o")))
                .ForMember(dest => dest.UpdateCount, opt => opt.MapFrom(src => src.UpdateCount))
                .AfterMap((src, dest) =>
                {
                    dest.Images.Clear();
                    if (src.Images != null)
                    {
                        foreach (var image in src.Images)
                        {
                            dest.Images.Add(image);
                        }
                    }
                });

            // Proto to Model (for create/update)
            CreateMap<Review.CreateReviewRequest, ReviewModel>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => Guid.Parse(src.UserId)))
                .ForMember(dest => dest.VehicleId, opt => opt.MapFrom(src => string.IsNullOrEmpty(src.VehicleId) ? (Guid?)null : Guid.Parse(src.VehicleId)))
                .ForMember(dest => dest.DeviceId, opt => opt.MapFrom(src => string.IsNullOrEmpty(src.DeviceId) ? (Guid?)null : Guid.Parse(src.DeviceId)))
                .ForMember(dest => dest.ComboId, opt => opt.MapFrom(src => string.IsNullOrEmpty(src.ComboId) ? (Guid?)null : Guid.Parse(src.ComboId)))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => MapProtoTypeToReviewType(src.Type)))
                .ForMember(dest => dest.Images, opt => opt.MapFrom(src => src.Images.ToList()))
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdateCount, opt => opt.Ignore());
        }

        private static ProtoReviewType MapReviewTypeToProto(ReviewType type)
        {
            return type switch
            {
                ReviewType.Device => ProtoReviewType.Device,
                ReviewType.Vehicle => ProtoReviewType.Vehicle,
                ReviewType.Combo => ProtoReviewType.Combo,
                _ => ProtoReviewType.Device
            };
        }

        private static ReviewType MapProtoTypeToReviewType(ProtoReviewType type)
        {
            return type switch
            {
                ProtoReviewType.Device => ReviewType.Device,
                ProtoReviewType.Vehicle => ReviewType.Vehicle,
                ProtoReviewType.Combo => ReviewType.Combo,
                _ => ReviewType.Device
            };
        }
    }
}
