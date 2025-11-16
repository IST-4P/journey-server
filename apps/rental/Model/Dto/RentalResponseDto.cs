using System;
using System.Collections.Generic;

namespace rental.Model.Dto
{
    // Response for User - matches UserRental from Proto
    public class UserRentalDto
    {
        public Guid Id { get; set; }
        public double TotalPrice { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid? ReviewId { get; set; } // Review ID if user has reviewed this rental
    }

    // Response for Admin - matches AdminRental from Proto
    public class AdminRentalDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public double TotalPrice { get; set; }
        public double MaxDiscount { get; set; }
        public double DiscountPercent { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // Full rental response - matches RentalResponse from Proto
    public class RentalResponseDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Status { get; set; } = string.Empty;
        public double RentalFee { get; set; } // Total item value (sum before discount)
        public double Deposit { get; set; } // 20% of total price (paid upfront)
        public double RemainingAmount { get; set; } // 80% of total price (paid on pickup)
        public double TotalPrice { get; set; } // (RentalFee - Discount) × 1.1 (including VAT 10%)
        public int TotalQuantity { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ActualEndDate { get; set; }
        public Guid? ReviewId { get; set; } // Review ID if user has reviewed this rental
    }

    // Rental item detail DTO
    public class RentalItemDetailDto
    {
        public string TargetId { get; set; } = string.Empty;
        public bool IsCombo { get; set; }
        public int Quantity { get; set; }
        public string Name { get; set; } = string.Empty;
        public double UnitPrice { get; set; }
        public double Subtotal { get; set; }
    }
}
