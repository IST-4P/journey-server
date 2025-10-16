using System.ComponentModel.DataAnnotations.Schema;

namespace device.Model.Entities
{
    [Table("device")]
    public class Device
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public required double Price { get; set; }
        public List<string>? Information { get; set; }
        public int? Quantity { get; set; }
        public string? Status { get; set; }
        public List<string>? Images { get; set; }

        public DateTime CreateAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdateAt { get; set; } = DateTime.UtcNow;

        public Guid CategoryId { get; set; }
        public Category? Category { get; set; }
        public ICollection<ComboDevice>? ComboDevices { get; set; }

    }

    [Table("categories")]
    public class Category
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public string? LogoUrl { get; set; }

        public DateTime CreateAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdateAt { get; set; } = DateTime.UtcNow;

        public ICollection<Device>? Devices { get; set; }

    }
    [Table("combos")]
    public class Combo
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required double Price { get; set; }
        public string? Description { get; set; }
        public List<string>? Images { get; set; }

        public ICollection<ComboDevice>? ComboProducts { get; set; }

        public DateTime CreateAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdateAt { get; set; } = DateTime.UtcNow;

    }

    [Table("combo_devices")]
    public class ComboDevice
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        // 🔗 Many-to-many link between Product and Combo
        public Guid ProductId { get; set; }
        public Device? Device { get; set; }

        public Guid ComboId { get; set; }
        public Combo? Combo { get; set; }

        public int Quantity { get; set; } = 1;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
    public class ApiResponse
    {
        public string Message { get; set; } = string.Empty;
    }
    public class ApiErrorResponse
    {
        public string Message { get; set; } = string.Empty;
        public int StatusCode { get; set; }
    }
}