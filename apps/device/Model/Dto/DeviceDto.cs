using device.Model.Entities;
using device.Model.Dto;

namespace device.Model.Dto
{
    public class DeviceDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public double Price { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
        public int? Quantity { get; set; }
        public List<string>? Information { get; set; }
        public List<string>? Images { get; set; }

        public Guid CategoryId { get; set; }
        public string? CategoryName { get; set; }

        public List<Guid>? ComboIds { get; set; }

        public DateTime CreateAt { get; set; }
        public DateTime UpdateAt { get; set; }

    }

    public class DeviceCreateDto
    {
        public required string Name { get; set; } = string.Empty;

        public required double Price { get; set; }

        public string? Description { get; set; }
        public string? Status { get; set; }
        public int? Quantity { get; set; }

        public List<string>? Information { get; set; }
        public List<string>? Images { get; set; }
        public required Guid CategoryId { get; set; }
    }

    public class DeviceUpdateDto
    {
        public string? Name { get; set; }
        public double? Price { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
        public int? Quantity { get; set; }
        public List<string>? Information { get; set; }
        public List<string>? Images { get; set; }
        public Guid? CategoryId { get; set; }

        public DateTime? UpdateAt { get; set; } = DateTime.UtcNow;
    }

    public class UserDeviceDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public double Price { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
        public int? Quantity { get; set; }
        public List<string>? Information { get; set; }
        public List<string>? Images { get; set; }
        public string? CategoryName { get; set; }
        public List<ComboUserDto>? Combos { get; set; }
    }

    public class ComboUserDto
    {
        public Guid ComboId { get; set; }
        public string Name { get; set; } = string.Empty;
        public double Price { get; set; }
        public string? Description { get; set; }
        public List<string>? Images { get; set; }
        public int DeviceCount { get; set; }
    }
}