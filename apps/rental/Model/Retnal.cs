using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace rental.Model.Entities
{
    [Table("rentals")]
    public class Rental
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }

        // [{ "targetId": "guid", "isCombo": bool, "quantity": int }]
        // Note: Only ONE item allowed per rental
        public string Items { get; set; } = "[]";

        //chi phí
        public double RentalFee { get; set; }
        public double? Deposit { get; set; }
        public double DiscountPercent { get; set; } = 0; // Discount percentage (e.g., 10 for 10%)
        public double MaxDiscount { get; set; } = 0; // Maximum discount amount in VND

        public double TotalPrice { get; set; }
        public int TotalQuantity { get; set; }
        public double VAT { get; set; } = 10.0; // VAT percentage (default 10%)

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
    }

    public class RentalExtension //      gia hạn
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public DateTime? NewEndDate { get; set; }
        public double? AdditionalFee { get; set; }
        public double? AdditionalHours { get; set; }
        public Guid? RequestedBy { get; set; } // UserId người yêu cầu gia hạn
        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
        public string? Notes { get; set; }
        public Guid? RentalId { get; set; }
    }

    // Helper class for JSON serialization of rental items
    public class RentalItemData
    {
        public Guid TargetId { get; set; }
        public bool IsCombo { get; set; }
        public int Quantity { get; set; }
    }

    public enum RentalStatus
    {
        PENDING, // Chờ thanh toán
        CONFIRMED, // Đã thanh toán, chờ nhận xe
        ONGOING, // Đang thuê (đã check-in)
        COMPLETED, // Hoàn thành (đã check-out)
        CANCELLED, // Đã hủy
        EXPIRED // Hết hạn (quá thời gian không thanh toán)

    }
}

