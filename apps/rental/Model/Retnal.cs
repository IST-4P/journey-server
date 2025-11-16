using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace rental.Model.Entities
{
    [Table("rentals")]
    public class Rental
    {

        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }

        // Multiple items allowed per rental
        public string Items { get; set; } = "[]";

        //chi phí
        public double RentalFee { get; set; } // Tổng giá trị thuê (sum of all items)
        public double? Deposit { get; set; } // 20% of RentalFee
        public double? RemainingAmount { get; set; } // 80% of RentalFee (paid on pickup)
        public double DiscountPercent { get; set; } = 0; // Discount percentage 
        public double MaxDiscount { get; set; } = 0; // Maximum discount amount in VND

        public double TotalPrice { get; set; } // = RentalFee (total amount to pay)
        public int TotalQuantity { get; set; }

        //trạng thái
        public RentalStatus Status { get; set; } = RentalStatus.PENDING;

        // thời gian thuê
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime? ActualEndDate { get; set; }

        // thời gian tạo
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Review relationship (optional - not required after rental)
        public Guid? ReviewId { get; set; }

        // relationship
        public Guid? RentalExtensionId { get; set; }
        public RentalExtension? Rentals { get; set; }

        // Navigation for history
        public ICollection<RentalHistory>? History { get; set; }
    }

    public class RentalExtension //gia hạn
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public DateTime? NewEndDate { get; set; }
        public double? TotalPrice { get; set; } // Extension total price (calculated like rental)
        public int? AdditionalDays { get; set; }
        public Guid? RequestedBy { get; set; } // UserId người yêu cầu gia hạn
        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
        public string? Notes { get; set; }
        public Guid? RentalId { get; set; }
        public ExtensionStatus Status { get; set; }
    }

    // Helper class for JSON serialization of rental items
    public class RentalItemData
    {
        public Guid TargetId { get; set; }
        public bool IsCombo { get; set; }
        public int Quantity { get; set; }
    }

    [Table("rental_histories")]
    public class RentalHistory
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid RentalId { get; set; }
        public RentalStatus OldStatus { get; set; }
        public RentalStatus NewStatus { get; set; }
        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
        public string? Notes { get; set; } // Optional notes about status change

        // Navigation
        public Rental? Rental { get; set; }
    }

    public enum ExtensionStatus
    {
        PENDING,  // Chờ duyệt
        APPROVED, // Đã duyệt
        REJECTED // Đã từ chối
    }

    public enum RentalStatus
    {
        PENDING, // Chờ thanh toán deposit
        PAID, // Đã thanh toán deposit (20%), chờ nhận hàng
        RECEIVED, // Đã nhận hàng và thanh toán phần còn lại (80%), đang thuê
        ONGOING, // Đang thuê (alias for RECEIVED)
        COMPLETED, // Hoàn thành (đã trả hàng)
        CANCELLED, // Đã hủy (có thể hoàn deposit)
        EXPIRED // Hết hạn (quá thời gian không thanh toán)
    }
}

