using Microsoft.AspNetCore.Mvc;
using device.Interface;
using device.Model.Dto;
using device.Model.Entities;
using Microsoft.AspNetCore.Authorization;

namespace device.Controller
{
    [ApiController]
    [Route("api/admin/devices")]
    public class AdminDevicesController : ControllerBase
    {
        private readonly IDeviceService service;
        public AdminDevicesController(IDeviceService service)
        {
            this.service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] DeviceQuery query)
        {
            if (!ModelState.IsValid)
            {
                var errors = string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
                return BadRequest(new ApiErrorResponse { Message = $"Error.Validation: {errors}", StatusCode = 400 });
            }
            var result = await service.GetDevicesAsync(query);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var device = await service.GetDeviceByIdAsync(id);
            if (device == null) return NotFound($"Device with ID {id} not found");
            return Ok(device);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AdminDeviceCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
                return BadRequest(new ApiErrorResponse { Message = $"Error.Validation: {errors}", StatusCode = 400 });
            }
            var device = await service.CreateDeviceAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = device.Id }, device);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] AdminDeviceUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
                return BadRequest(new ApiErrorResponse { Message = $"Error.Validation: {errors}", StatusCode = 400 });
            }
            var device = await service.UpdateDeviceAsync(id, dto);
            if (device == null) return NotFound($"Device with ID {id} not found");
            return Ok(device);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await service.DeleteDeviceAsync(id);
            if (!success) return NotFound($"Device with ID {id} not found");
            return NoContent();
        }
    }


    [ApiController]
    [Route("api/devices")]
    public class UserDevicesController : ControllerBase
    {
        private readonly IDeviceService service;
        public UserDevicesController(IDeviceService service)
        {
            this.service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] DeviceQuery query)
        {
            if (!ModelState.IsValid)
            {
                var errors = string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
                return BadRequest(new ApiErrorResponse { Message = $"Error.Validation: {errors}", StatusCode = 400 });
            }
            var result = await service.GetDevicesForUserAsync(query);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var device = await service.GetDeviceForUserByIdAsync(id);
            if (device == null) return NotFound($"Device with ID {id} not found or unavailable");
            return Ok(device);
        }
    }
}
