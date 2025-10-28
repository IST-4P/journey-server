using System.ComponentModel.DataAnnotations.Schema;

namespace ComplaintService.Model
{
    public enum ComplaintStatus
    {
        Unspecified = 0,
        Pending = 1,        // Chờ xử lý
        Processing = 2,     // Đang xử lý
        Resolved = 3,       // Đã giải quyết
        Rejected = 4        // Bị từ chối
    }

    public enum ComplaintType
    {
        Unspecified = 0,
        Device = 1,         // Khiếu nại về thiết bị
        Vehicle = 2,        // Khiếu nại về xe
        Combo = 3,          // Khiếu nại về combo
        Service = 4,        // Khiếu nại về dịch vụ
        Other = 5           // Khác
    }

    [Table("complaints")]
    public class Complaint
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid UserId { get; set; }
        public Guid? RentalId { get; set; }
        public Guid? BookingId { get; set; }

        // Optional references
        public Guid? DeviceId { get; set; }
        public Guid? VehicleId { get; set; }
        public Guid? ComboId { get; set; }

        public ComplaintType Type { get; set; } = ComplaintType.Unspecified;

        public required string Title { get; set; }
        public required string Content { get; set; }

        public List<string> EvidenceImages { get; set; } = new List<string>();

        public ComplaintStatus Status { get; set; } = ComplaintStatus.Pending;

        public string? AdminResponse { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ResolvedAt { get; set; }
    }
}