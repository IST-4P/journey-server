using AutoMapper;
using device.Repository;
using device.Model.Dto;
using device.Model.Entities;
using device.Interface;
using Grpc.Core;
using Device; // generated from Protos/device.proto
using DeviceEntity = device.Model.Entities.Device;

namespace device.Service
{
    public class DeviceGrpcService : global::Device.DeviceService.DeviceServiceBase
    {
        private readonly IDeviceRepository _repository;
        private readonly IMapper _mapper;
        private readonly ILogger<DeviceGrpcService> _logger;

        public DeviceGrpcService(IDeviceRepository repository, IMapper mapper, ILogger<DeviceGrpcService> logger)
        {
            _repository = repository;
            _mapper = mapper;
            _logger = logger;
        }
        public override async Task<GetManyDevicesAdminResponse> GetManyDevicesAdmin(GetManyDevicesRequest request, ServerCallContext context)
        {
            try
            {
                var query = new DeviceQuery
                {
                    Page = request.Page,
                    PageSize = request.Limit,
                    Search = request.Search,
                    Status = request.Status,
                    CategoryId = Guid.TryParse(request.CategoryId, out var cat) ? cat : (Guid?)null
                };

                var paged = await _repository.GetDevicesAsync(query);
                var dtos = _mapper.Map<List<AdminDeviceDto>>(paged.Items);

                var res = new GetManyDevicesAdminResponse
                {
                    Page = paged.Page,
                    Limit = paged.PageSize,
                    TotalItems = (int)paged.TotalCount,
                    TotalPages = paged.TotalPages
                };

                foreach (var d in dtos)
                {
                    res.Devices.Add(new GetManyDevicesAdmin
                    {
                        Id = d.Id.ToString(),
                        Name = d.Name,
                        Price = d.Price,
                        Description = d.Description ?? string.Empty,
                        Status = d.Status ?? string.Empty,
                        Quantity = d.Quantity ?? 0,
                        Information = { d.Information ?? new List<string>() },
                        Images = { d.Images ?? new List<string>() },
                        CategoryId = d.CategoryId.ToString(),
                        CategoryName = d.CategoryName ?? string.Empty,
                        CreatedAt = d.CreateAt.ToString("O"),
                        UpdatedAt = d.UpdateAt.ToString("O")
                    });
                }

                return res;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting devices (admin)");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

        public override async Task<GetDeviceResponse> GetDevice(GetDeviceRequest request, ServerCallContext context)
        {
            try
            {
                _logger.LogInformation("GetDevice called with DeviceId: {DeviceId}", request.DeviceId);
                if (!Guid.TryParse(request.DeviceId, out var id))
                    throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid deviceId"));

                var device = await _repository.GetDeviceByIdAsync(id);
                if (device is null)
                    throw new RpcException(new Status(StatusCode.NotFound, "Device not found"));

                var dto = _mapper.Map<AdminDeviceDto>(device);

                return new GetDeviceResponse
                {
                    Id = dto.Id.ToString(),
                    Name = dto.Name,
                    Price = dto.Price,
                    Description = dto.Description ?? "",
                    Status = dto.Status ?? "",
                    Quantity = dto.Quantity ?? 0,
                    Information = { dto.Information ?? new List<string>() },
                    Images = { dto.Images ?? new List<string>() },
                    CategoryId = dto.CategoryId.ToString(),
                    CategoryName = dto.CategoryName ?? "",
                    CreatedAt = dto.CreateAt.ToString("O"),
                    UpdatedAt = dto.UpdateAt.ToString("O")
                };
            }
            catch (RpcException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting device");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

        public override async Task<GetManyDevicesResponse> GetManyDevices(GetManyDevicesRequest request, ServerCallContext context)
        {
            try
            {
                var query = new DeviceQuery
                {
                    Page = request.Page,
                    PageSize = request.Limit,
                    Search = request.Search,
                    Status = request.Status,
                    CategoryId = Guid.TryParse(request.CategoryId, out var cat) ? cat : (Guid?)null
                };

                var paged = await _repository.GetDevicesAsync(query);
                var dtos = _mapper.Map<List<UserDeviceDto>>(paged.Items);

                var res = new GetManyDevicesResponse
                {
                    Page = paged.Page,
                    Limit = paged.PageSize,
                    TotalItems = (int)paged.TotalCount,
                    TotalPages = paged.TotalPages
                };

                foreach (var d in dtos)
                {
                    res.Devices.Add(new GetManyDevices
                    {
                        Name = d.Name,
                        Price = d.Price,
                        Description = d.Description ?? "",
                        Status = d.Status ?? "",
                        Quantity = d.Quantity ?? 0,
                        Information = { d.Information ?? new List<string>() },
                        Images = { d.Images ?? new List<string>() },
                        CategoryName = d.CategoryName ?? ""
                    });
                }

                return res;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting devices");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

        public override async Task<GetDeviceResponse> CreateDevice(CreateDeviceRequest request, ServerCallContext context)
        {
            try
            {
                var dto = new AdminDeviceCreateDto
                {
                    Name = request.Name,
                    Price = request.Price,
                    Description = request.Description,
                    Status = request.Status,
                    Quantity = request.Quantity,
                    Information = request.Information.ToList(),
                    Images = request.Images.ToList(),
                    CategoryId = Guid.Parse(request.CategoryId)
                };

                var entity = _mapper.Map<DeviceEntity>(dto);
                entity.Id = Guid.NewGuid();

                var created = await _repository.CreateDeviceAsync(entity);
                var res = _mapper.Map<AdminDeviceDto>(created);

                return new GetDeviceResponse
                {
                    Id = res.Id.ToString(),
                    Name = res.Name,
                    Price = res.Price,
                    Description = res.Description ?? "",
                    Status = res.Status ?? "",
                    Quantity = res.Quantity ?? 0,
                    Information = { res.Information ?? new List<string>() },
                    Images = { res.Images ?? new List<string>() },
                    CategoryId = res.CategoryId.ToString(),
                    CategoryName = res.CategoryName ?? "",
                    CreatedAt = res.CreateAt.ToString("O"),
                    UpdatedAt = res.UpdateAt.ToString("O")
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating device");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

        public override async Task<GetDeviceResponse> UpdateDevice(UpdateDeviceRequest request, ServerCallContext context)
        {
            try
            {
                if (!Guid.TryParse(request.DeviceId, out var id))
                    throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid deviceId"));

                var update = new AdminDeviceUpdateDto
                {
                    Name = request.Name,
                    Price = request.Price,
                    Description = request.Description,
                    Status = request.Status,
                    Quantity = request.Quantity,
                    Information = request.Information.ToList(),
                    Images = request.Images.ToList(),
                    CategoryId = Guid.TryParse(request.CategoryId, out var cat) ? cat : (Guid?)null
                };

                var updated = await _repository.UpdateDeviceAsync(id, _mapper.Map<DeviceEntity>(update));
                if (updated == null)
                    throw new RpcException(new Status(StatusCode.NotFound, "Device not found"));

                var res = _mapper.Map<AdminDeviceDto>(updated);
                return new GetDeviceResponse
                {
                    Id = res.Id.ToString(),
                    Name = res.Name,
                    Price = res.Price,
                    Description = res.Description ?? "",
                    Status = res.Status ?? "",
                    Quantity = res.Quantity ?? 0,
                    Information = { res.Information ?? new List<string>() },
                    Images = { res.Images ?? new List<string>() },
                    CategoryId = res.CategoryId.ToString(),
                    CategoryName = res.CategoryName ?? "",
                    CreatedAt = res.CreateAt.ToString("O"),
                    UpdatedAt = res.UpdateAt.ToString("O")
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating device");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

        public override async Task<DeleteDeviceResponse> DeleteDevice(DeleteDeviceRequest request, ServerCallContext context)
        {
            try
            {
                if (!Guid.TryParse(request.DeviceId, out var id))
                    throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid deviceId"));

                var result = await _repository.DeleteDeviceAsync(id);
                if (!result)
                    throw new RpcException(new Status(StatusCode.NotFound, "Device not found"));

                return new DeleteDeviceResponse { Message = "Device deleted successfully" };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting device");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }
    }
}
