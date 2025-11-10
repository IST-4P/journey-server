using AutoMapper;
using device.Repository;
using device.Model.Dto;
using device.Model.Entities;
using device.Interface;
using Grpc.Core;
using Device;
using DeviceEntity = device.Model.Entities.Device;

namespace device.Service
{
    public class DeviceGrpcService : global::Device.DeviceService.DeviceServiceBase
    {
        private readonly IDeviceRepository _deviceRepository;
        private readonly IComboRepository _comboRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<DeviceGrpcService> _logger;
        private readonly ICategoryRepository _categoryRepository;

        public DeviceGrpcService(
            IDeviceRepository deviceRepository,
            IComboRepository comboRepository,
            IMapper mapper,
            ILogger<DeviceGrpcService> logger,
            ICategoryRepository categoryRepository)
        {
            _deviceRepository = deviceRepository;
            _comboRepository = comboRepository;
            _mapper = mapper;
            _logger = logger;
        }

        // DEVICE

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

                var paged = await _deviceRepository.GetDevicesAsync(query);
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

                var device = await _deviceRepository.GetDeviceByIdAsync(id);
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

                var paged = await _deviceRepository.GetDevicesAsync(query);
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
                        Id = d.Id.ToString(),
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

                var created = await _deviceRepository.CreateDeviceAsync(entity);
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

                var updated = await _deviceRepository.UpdateDeviceAsync(id, _mapper.Map<DeviceEntity>(update));
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

                var result = await _deviceRepository.DeleteDeviceAsync(id);
                if (!result)
                    throw new RpcException(new Status(StatusCode.NotFound, "Device not found"));

                return new DeleteDeviceResponse { Message = "DeletedDeviceSuccessul" };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting device");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

        // COMBO 

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

                if (dto.Devices != null)
                {
                    foreach (var dev in dto.Devices)
                    {
                        response.Devices.Add(new ComboDeviceItem
                        {
                            DeviceId = dev.DeviceId.ToString(),
                            DeviceName = dev.DeviceName,
                            DevicePrice = dev.DevicePrice,
                            Quantity = dev.Quantity
                        });
                    }
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
                    response.Combos.Add(new GetManyCombos
                    {
                        Id = combo.Id.ToString(),
                        Name = combo.Name,
                        Price = combo.Price,
                        Description = combo.Description ?? string.Empty,
                        Images = { combo.Images ?? new List<string>() },
                        DeviceCount = combo.Devices?.Count ?? 0,
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

                if (result.Devices != null)
                {
                    foreach (var dev in result.Devices)
                    {
                        response.Devices.Add(new ComboDeviceItem
                        {
                            DeviceId = dev.DeviceId.ToString(),
                            DeviceName = dev.DeviceName,
                            DevicePrice = dev.DevicePrice,
                            Quantity = dev.Quantity
                        });
                    }
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

                if (result.Devices != null)
                {
                    foreach (var dev in result.Devices)
                    {
                        response.Devices.Add(new ComboDeviceItem
                        {
                            DeviceId = dev.DeviceId.ToString(),
                            DeviceName = dev.DeviceName,
                            DevicePrice = dev.DevicePrice,
                            Quantity = dev.Quantity
                        });
                    }
                }

                return response;
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

        // CATEGORY

        public override async Task<GetCategoryResponse> GetCategory(GetCategoryRequest request, ServerCallContext context)
        {
            try
            {
                _logger.LogInformation("GetCategory called with CategoryId: {CategoryId}", request.CategoryId);

                if (!Guid.TryParse(request.CategoryId, out var id))
                    throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid CategoryId"));

                var category = await _categoryRepository.GetCategoryByIdAsync(id);
                if (category is null)
                    throw new RpcException(new Status(StatusCode.NotFound, "CategoryId not found"));

                var dto = _mapper.Map<CategoryDto>(category);

                var response = new GetCategoryResponse
                {
                    Id = category.Id.ToString(),
                    Name = category.Name,
                    LogoUrl = category.LogoUrl,
                    CreatedAt = category.CreateAt.ToString("O"),
                    UpdatedAt = category.UpdateAt.ToString("O")
                };

                return response;
            }
            catch (RpcException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting category");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

        public override async Task<GetManyCategoriesResponse> GetManyCategories(GetManyCategoriesRequest request, ServerCallContext context)
        {
            try
            {
                var query = new DeviceQuery
                {
                    Page = request.Page,
                    PageSize = request.Limit,
                    Search = request.Search,
                    SortBy = request.SortBy,
                    SortDir = request.SortDir
                };

                var paged = await _categoryRepository.GetCategoryAsync(query);

                // Map entity -> DTO list
                var dtos = _mapper.Map<List<CategoryDto>>(paged.Items);

                var res = new GetManyCategoriesResponse
                {
                    Page = paged.Page,
                    Limit = paged.PageSize,
                    TotalItems = (int)paged.TotalCount,
                    TotalPages = paged.TotalPages
                };

                foreach (var d in dtos)
                {
                    res.Categories.Add(new GetManyCategories
                    {
                        Id = d.Id.ToString(),
                        Name = d.Name,
                        LogoUrl = d.LogoUrl,
                        CreatedAt = d.CreateAt.ToString("O"),
                        UpdatedAt = d.UpdateAt.ToString("O")
                    });
                }

                return res;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting categories");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

        public override async Task<CreateCategoryResponse> CreateCategory(CreateCategoryRequest request, ServerCallContext context)
        {
            try
            {
                _logger.LogInformation("CreateCategory called with Name: {Name}", request.Name);

                var dto = new CreateCategoryDto
                {
                    Name = request.Name,
                    LogoUrl = request.LogoUrl
                };

                var entity = _mapper.Map<Category>(dto);
                var created = await _categoryRepository.CreateCategoryAsync(entity);
                var result = _mapper.Map<CategoryDto>(created);

                var response = new CreateCategoryResponse
                {
                    Id = result.Id.ToString(),
                    Name = result.Name,
                    LogoUrl = result.LogoUrl,
                    CreatedAt = result.CreateAt.ToString("O"),
                    UpdatedAt = result.UpdateAt.ToString("O")
                };

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating category");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

        public override async Task<UpdateCategoryResponse> UpdateCategory(UpdateCategoryRequest request, ServerCallContext context)
        {
            try
            {
                if (!Guid.TryParse(request.CategoryId, out var id))
                    throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid CategoryId"));

                var dto = new UpdateCategoryDto
                {
                    Name = request.Name,
                    LogoUrl = request.LogoUrl
                };

                var entity = _mapper.Map<Category>(dto);
                var updated = await _categoryRepository.UpdateCategoryAsync(id, entity);

                if (updated is null)
                    throw new RpcException(new Status(StatusCode.NotFound, "Category not found"));

                var result = _mapper.Map<CategoryDto>(updated);

                var response = new UpdateCategoryResponse
                {
                    Id = result.Id.ToString(),
                    Name = result.Name,
                    LogoUrl = result.LogoUrl,
                    CreatedAt = result.CreateAt.ToString("O"),
                    UpdatedAt = result.UpdateAt.ToString("O")
                };

                return response;
            }
            catch (RpcException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating combo");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

        public override async Task<DeleteCategoryResponse> DeleteCategory(DeleteCategoryRequest request, ServerCallContext context)
        {
            try
            {
                if (!Guid.TryParse(request.CategoryId, out var id))
                    throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid CategoryId"));

                var result = await _categoryRepository.DeleteCategoryAsync(id);
                if (!result)
                    throw new RpcException(new Status(StatusCode.NotFound, "Category not found"));

                return new DeleteCategoryResponse { Message = "DeletedCategorySuccessful" };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting category");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

    }
}
