using System;

namespace rental.Model.Dto
{
    // Response for User - basic info with enriched data
    public class UserRentalDto
    {
        public Guid Id { get; set; }
        public Guid TargetId { get; set; }
        public bool IsCombo { get; set; }
        public string TargetName { get; set; } = string.Empty; // Device or Combo name
        public double TargetPrice { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public ReviewSummaryDto? Review { get; set; } // Optional - rental may not have review
    }

    // Response for Admin - full info including UserId with enriched data
    public class AdminRentalDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty; // User full name
        public string UserEmail { get; set; } = string.Empty;
        public Guid TargetId { get; set; }
        public bool IsCombo { get; set; }
        public string TargetName { get; set; } = string.Empty; // Device or Combo name
        public double TargetPrice { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public ReviewSummaryDto? Review { get; set; } // Optional - rental may not have review
    }
}
