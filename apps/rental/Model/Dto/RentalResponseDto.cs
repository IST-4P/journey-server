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

}
