using Microsoft.AspNetCore.Mvc;
using device.Interface;
using device.Model.Dto;
using device.Model.Entities;

namespace device.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class DeviceController : ControllerBase
    {
        private readonly IDeviceService service;
        public DeviceController(IDeviceService service)
        {
            this.service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = string.Join(", ", ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage));

                    var errorResponse = new ApiErrorResponse
                    {
                        Message = $"Error.Validation: {errors}",
                        StatusCode = 400
                    };
                    return BadRequest(errorResponse);
                }
                var device = await service.GetDevicesAsync();
                return Ok(device);
            }
            catch (Exception e)
            {
                var errorResponse = new ApiErrorResponse
                {
                    Message = $"Error.Internal: {e.Message}",
                    StatusCode = 500
                };
                return StatusCode(500, errorResponse);
            }

        }

        [HttpGet]
        [Route("id:guid")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = string.Join(", ", ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage));

                    var errorResponse = new ApiErrorResponse
                    {
                        Message = $"Error.Validation: {errors}",
                        StatusCode = 400
                    };
                    return BadRequest(errorResponse);
                }
                var device = await service.GetDeviceByIdAsync(id);
                if (device == null) return NotFound($"Device with ID{id} not found");
                return Ok(device);
            }
            catch (Exception e)
            {
                var errorResponse = new ApiErrorResponse
                {
                    Message = $"Error.Internal: {e.Message}",
                    StatusCode = 500
                };
                return StatusCode(500, errorResponse);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] DeviceCreateDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = string.Join(", ", ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage));

                    var errorResponse = new ApiErrorResponse
                    {
                        Message = $"Error.Validation: {errors}",
                        StatusCode = 400
                    };
                    return BadRequest(errorResponse);
                }
                var device = await service.CreateDeviceAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = device }, device);
            }
            catch (Exception e)
            {
                var errorResponse = new ApiErrorResponse
                {
                    Message = $"Error.Internal: {e.Message}",
                    StatusCode = 500
                };
                return StatusCode(500, errorResponse);
            }
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] DeviceUpdateDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = string.Join(", ", ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage));

                    var errorResponse = new ApiErrorResponse
                    {
                        Message = $"Error.Validation: {errors}",
                        StatusCode = 400
                    };
                    return BadRequest(errorResponse);
                }
                var device = await service.UpdateDeviceAsync(id, dto);
                if (device == null) return NotFound($"Device with ID{id} not found");
                return Ok(device);
            }
            catch (Exception e)
            {
                var errorResponse = new ApiErrorResponse
                {
                    Message = $"Error.Internal: {e.Message}",
                    StatusCode = 500
                };
                return StatusCode(500, errorResponse);
            }
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var success = await service.DeleteDeviceAsync(id);
                if (!success)
                    return NotFound($"Device with ID {id} not found");

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("user")]
        public async Task<IActionResult> UserGetDeivce()
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = string.Join(", ", ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage));

                    var errorResponse = new ApiErrorResponse
                    {
                        Message = $"Error.Validation: {errors}",
                        StatusCode = 400
                    };
                    return BadRequest(errorResponse);
                }
                var device = await service.GetDevicesForUserAsync();
                return Ok(device);
            }
            catch (Exception e)
            {
                var errorResponse = new ApiErrorResponse
                {
                    Message = $"Error.Internal: {e.Message}",
                    StatusCode = 500
                };
                return StatusCode(500, errorResponse);
            }
        }

        [HttpGet("user/{id:guid}")]
        public async Task<IActionResult> UserGetDeviceById(Guid id)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = string.Join(", ", ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage));

                    var errorResponse = new ApiErrorResponse
                    {
                        Message = $"Error.Validation: {errors}",
                        StatusCode = 400
                    };
                    return BadRequest(errorResponse);
                }
                var device = await service.GetDeviceForUserByIdAsync(id);
                return Ok(device);
            }
            catch (Exception e)
            {
                var errorResponse = new ApiErrorResponse
                {
                    Message = $"Error.Internal: {e.Message}",
                    StatusCode = 500
                };
                return StatusCode(500, errorResponse);
            }
        }

    }

}
