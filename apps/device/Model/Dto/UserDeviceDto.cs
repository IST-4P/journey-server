using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace device.Model.Dto
{
    public class UserDeviceDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public double Price { get; set; }
        public string? Brand { get; set; }
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