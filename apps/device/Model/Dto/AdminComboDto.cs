using System;
using System.Collections.Generic;

namespace device.Model.Dto
{
    // ============================================
    // ADMIN COMBO DTOs
    // ============================================

    public class AdminComboDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public double Price { get; set; }
        public string? Description { get; set; }
        public List<string>? Images { get; set; }
        public DateTime CreateAt { get; set; }
        public DateTime UpdateAt { get; set; }

        // Devices in this combo
        public List<ComboDeviceItemDto>? Devices { get; set; }
    }

    public class AdminComboCreateDto
    {
        public required string Name { get; set; }
        public required double Price { get; set; }
        public string? Description { get; set; }
        public List<string>? Images { get; set; }

        // List of devices to add to combo with their quantities
        public required List<ComboDeviceInputDto> DeviceItems { get; set; }
    }

    public class AdminComboUpdateDto
    {
        public string? Name { get; set; }
        public double? Price { get; set; }
        public string? Description { get; set; }
        public List<string>? Images { get; set; }

        // Optional: update device items in combo
        public List<ComboDeviceInputDto>? DeviceItems { get; set; }
    }

    // ============================================
    // SHARED COMBO DTOs
    // ============================================

    public class ComboDeviceItemDto
    {
        public Guid DeviceId { get; set; }
        public string DeviceName { get; set; } = string.Empty;
        public double DevicePrice { get; set; }
        public int Quantity { get; set; }
    }

    public class ComboDeviceInputDto
    {
        public Guid DeviceId { get; set; }
        public int Quantity { get; set; } = 1;
    }

    // ============================================
    // USER COMBO DTO (already exists in UserDeviceDto.cs)
    // ============================================
    // Keep ComboUserDto in UserDeviceDto.cs for user-facing responses
}
