using System;
using System.Collections.Generic;

namespace device.Model.Dto
{
    // Admin-facing DTOs (full control & visibility)
    public class AdminDeviceDto
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

        public DateTime CreateAt { get; set; }
        public DateTime UpdateAt { get; set; }
    }

    public class AdminDeviceCreateDto
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

    public class AdminDeviceUpdateDto
    {
        public string? Name { get; set; }
        public double? Price { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
        public int? Quantity { get; set; }
        public List<string>? Information { get; set; }
        public List<string>? Images { get; set; }
        public Guid? CategoryId { get; set; }
    }
}
