using System.ComponentModel.DataAnnotations.Schema;

namespace rental.Model.Entities
{
    [Table("rentals")]
    public class Rental
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public Guid TargetId { get; set; } // có thể là DeviceId hoặc ComboId
        public bool IsCombo { get; set; } = false;
        public string Status { get; set; } = "Pending";
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
