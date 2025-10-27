using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ComplaintService.Model;

namespace complaint.Model
{
    // DTO for complaint response (full detail)
    public class ComplaintDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid? RentalId { get; set; }
        public Guid? BookingId { get; set; }

        public Guid? DeviceId { get; set; }
        public Guid? VehicleId { get; set; }
        public Guid? ComboId { get; set; }

        public ComplaintType Type { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public List<string> EvidenceImages { get; set; } = new List<string>();

        public ComplaintStatus Status { get; set; }
        public string? AdminResponse { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
    }

    // DTO for Admin summary (no content)
    public class ComplaintSummaryDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid? RentalId { get; set; }
        public Guid? BookingId { get; set; }

        public Guid? DeviceId { get; set; }
        public Guid? VehicleId { get; set; }
        public Guid? ComboId { get; set; }

        public ComplaintType Type { get; set; }
        public string Title { get; set; } = string.Empty;

        public ComplaintStatus Status { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
    }

}