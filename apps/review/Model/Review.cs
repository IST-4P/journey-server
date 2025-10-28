using System.ComponentModel.DataAnnotations;

namespace review.Model
{
    public class Review
    {
        [Key]
        public Guid Id { get; set; }

        public Guid? BookingId { get; set; }
        public Guid? RentalId { get; set; }
        public Guid? VehicleId { get; set; }
        public Guid? DeviceId { get; set; }
        public Guid? ComboId { get; set; }

        
        [Required]
        public Guid UserId { get; set; }

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public ReviewType Type { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Content { get; set; } = string.Empty;

        public List<string>? Images { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Mỗi user chỉ được update tối đa 2 lần
        public int UpdateCount { get; set; } = 0;
    }

    public enum ReviewType
    {
        Device = 0,
        Vehicle = 1,
        Combo = 2
    }
}
