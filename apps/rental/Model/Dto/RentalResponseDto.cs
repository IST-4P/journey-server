using System;

namespace rental.Model.Dto
{
    // Response for User - basic info
    public class UserRentalDto
    {
        public Guid Id { get; set; }
        public Guid TargetId { get; set; }
        public bool IsCombo { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // Response for Admin - full info including UserId
    public class AdminRentalDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid TargetId { get; set; }
        public bool IsCombo { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
