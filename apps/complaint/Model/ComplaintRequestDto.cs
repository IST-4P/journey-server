namespace ComplaintService.Model
{
    // DTO for creating a new complaint
    public class CreateComplaintDto
    {
        public required Guid UserId { get; set; }
        public required Guid RentalId { get; set; }

        public Guid? DeviceId { get; set; }
        public Guid? VehicleId { get; set; }
        public Guid? ComboId { get; set; }

        public ComplaintType Type { get; set; }
        public required string Title { get; set; }
        public required string Content { get; set; }
        public List<string> EvidenceImages { get; set; } = new List<string>();
    }

    
    // DTO for updating complaint status
    public class UpdateComplaintStatusDto
    {
        public required Guid Id { get; set; }
        public required ComplaintStatus Status { get; set; }
        public string? AdminResponse { get; set; }
    }
}