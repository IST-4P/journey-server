using device.Model.Dto;
using device.Model.Entities;
using Grpc.Core;
using Device;

namespace device.Service
{
    public partial class DeviceGrpcService : DeviceService.DeviceServiceBase
    {
        public override async Task<GetComboResponse> GetCombo(GetComboRequest request, ServerCallContext context)
        {
            try
            {
                _logger.LogInformation("GetCombo called with ComboId: {ComboId}", request.ComboId);
                if (!Guid.TryParse(request.ComboId, out var id))
                    throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid comboId"));

                var combo = await _comboRepository.GetComboByIdAsync(id);
                if (combo is null)
                    throw new RpcException(new Status(StatusCode.NotFound, "Combo not found"));

                var dto = _mapper.Map<AdminComboDto>(combo);

                var response = new GetComboResponse
                {
                    Id = dto.Id.ToString(),
                    Name = dto.Name,
                    Price = dto.Price,
                    Description = dto.Description ?? string.Empty,
                    Images = { dto.Images ?? new List<string>() },
                    CreatedAt = dto.CreateAt.ToString("O"),
                    UpdatedAt = dto.UpdateAt.ToString("O")
                };

                var devices = dto.Devices ?? new List<ComboDeviceItemDto>();
                Console.WriteLine("ComboDevices: " + (combo.ComboDevices?.Count ?? 0));

                foreach (var dev in devices)
                {
                    response.Devices.Add(new ComboDeviceItem
                    {
                        DeviceId = dev.DeviceId.ToString(),
                        DeviceName = dev.DeviceName,
                        DevicePrice = dev.DevicePrice,
                        Quantity = dev.Quantity
                    });
                }
                return response;
            }
            catch (RpcException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting combo");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

        public override async Task<GetManyCombosResponse> GetManyCombos(GetManyCombosRequest request, ServerCallContext context)
        {
            try
            {
                var query = new DeviceQuery
                {
                    Page = request.Page,
                    PageSize = request.Limit,
                    Search = request.Search
                };

                var paged = await _comboRepository.GetCombosAsync(query);
                var dtos = _mapper.Map<List<AdminComboDto>>(paged.Items);

                var response = new GetManyCombosResponse
                {
                    Page = paged.Page,
                    Limit = paged.PageSize,
                    TotalItems = (int)paged.TotalCount,
                    TotalPages = paged.TotalPages
                };

                foreach (var combo in dtos)
                {
                    var deviceCount = combo.Devices?.Count ?? 0;

                    response.Combos.Add(new GetManyCombos
                    {
                        Id = combo.Id.ToString(),
                        Name = combo.Name,
                        Price = combo.Price,
                        Description = combo.Description ?? string.Empty,
                        Images = { combo.Images ?? new List<string>() },
                        CreatedAt = combo.CreateAt.ToString("O"),
                        UpdatedAt = combo.UpdateAt.ToString("O")
                    });
                }

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting combos");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

        public override async Task<GetComboResponse> CreateCombo(CreateComboRequest request, ServerCallContext context)
        {
            try
            {
                var dto = new AdminComboCreateDto
                {
                    Name = request.Name,
                    Price = request.Price,
                    Description = request.Description,
                    Images = request.Images.ToList(),
                    DeviceItems = request.DeviceItems.Select(di => new ComboDeviceInputDto
                    {
                        DeviceId = Guid.Parse(di.DeviceId),
                        Quantity = di.Quantity
                    }).ToList()
                };

                var entity = _mapper.Map<Combo>(dto);
                var created = await _comboRepository.CreateComboAsync(entity, dto.DeviceItems);
                var result = _mapper.Map<AdminComboDto>(created);

                var response = new GetComboResponse
                {
                    Id = result.Id.ToString(),
                    Name = result.Name,
                    Price = result.Price,
                    Description = result.Description ?? string.Empty,
                    Images = { result.Images ?? new List<string>() },
                    CreatedAt = result.CreateAt.ToString("O"),
                    UpdatedAt = result.UpdateAt.ToString("O")
                };

                var devices = result.Devices ?? new List<ComboDeviceItemDto>();

                foreach (var dev in devices)
                {
                    response.Devices.Add(new ComboDeviceItem
                    {
                        DeviceId = dev.DeviceId.ToString(),
                        DeviceName = dev.DeviceName,
                        DevicePrice = dev.DevicePrice,
                        Quantity = dev.Quantity
                    });
                }
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating combo");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

        public override async Task<GetComboResponse> UpdateCombo(UpdateComboRequest request, ServerCallContext context)
        {
            try
            {
                if (!Guid.TryParse(request.ComboId, out var id))
                    throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid comboId"));

                var dto = new AdminComboUpdateDto
                {
                    Name = request.Name,
                    Price = request.Price,
                    Description = request.Description,
                    Images = request.Images?.ToList(),
                    DeviceItems = request.DeviceItems?.Select(di => new ComboDeviceInputDto
                    {
                        DeviceId = Guid.Parse(di.DeviceId),
                        Quantity = di.Quantity
                    }).ToList()
                };

                var entity = _mapper.Map<Combo>(dto);
                var updated = await _comboRepository.UpdateComboAsync(id, entity, dto.DeviceItems);

                if (updated is null)
                    throw new RpcException(new Status(StatusCode.NotFound, "Combo not found"));

                var result = _mapper.Map<AdminComboDto>(updated);

                var response = new GetComboResponse
                {
                    Id = result.Id.ToString(),
                    Name = result.Name,
                    Price = result.Price,
                    Description = result.Description ?? string.Empty,
                    Images = { result.Images ?? new List<string>() },
                    CreatedAt = result.CreateAt.ToString("O"),
                    UpdatedAt = result.UpdateAt.ToString("O")
                };

                var devices = result.Devices ?? new List<ComboDeviceItemDto>();

                {
                    foreach (var dev in devices)
                    {
                        response.Devices.Add(new ComboDeviceItem
                        {
                            DeviceId = dev.DeviceId.ToString(),
                            DeviceName = dev.DeviceName,
                            DevicePrice = dev.DevicePrice,
                            Quantity = dev.Quantity
                        });
                    }
                    return response;
                }
            }
            catch (RpcException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating combo");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

        public override async Task<DeleteComboResponse> DeleteCombo(DeleteComboRequest request, ServerCallContext context)

        {
            try
            {
                if (!Guid.TryParse(request.ComboId, out var id))
                    throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid comboId"));

                var result = await _comboRepository.DeleteComboAsync(id);
                if (!result)
                    throw new RpcException(new Status(StatusCode.NotFound, "Combo not found"));

                return new DeleteComboResponse { Message = "ComboDeletedSuccessfully" };
            }
            catch (RpcException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting combo");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

    }
}