using Grpc.Core;
using AutoMapper;
using rental.Repository;
using rental.Model.Dto;
using Rental;
using RentalEntity = rental.Model.Entities.Rental;
using RentalExtensionEntity = rental.Model.Entities.RentalExtension;
using rental.Model.Entities;
using System.Text.Json;

namespace rental.Service
{
    public class RentalGrpcService : global::Rental.RentalService.RentalServiceBase
    {
        private readonly RentalRepository _repository;
        private readonly IMapper _mapper;
        private readonly ILogger<RentalGrpcService> _logger;
        private readonly User.UserService.UserServiceClient _userClient;
        private readonly Device.DeviceService.DeviceServiceClient _deviceClient;

        public RentalGrpcService(
            RentalRepository repository,
            IMapper mapper,
            ILogger<RentalGrpcService> logger,
            User.UserService.UserServiceClient userClient,
            Device.DeviceService.DeviceServiceClient deviceClient)
        {
            _repository = repository;
            _mapper = mapper;
            _logger = logger;
            _userClient = userClient;
            _deviceClient = deviceClient;
        }

        // User: Create rental
        public override async Task<RentalResponse> CreateRental(CreateRentalRequest request, ServerCallContext context)
        {
            try
            {
                if (request.Item == null)
                {
                    throw new RpcException(new Status(StatusCode.InvalidArgument, "Item is required"));
                }

                var rental = new RentalEntity();
                rental.Id = Guid.NewGuid();
                rental.UserId = Guid.Parse(request.UserId);
                rental.StartDate = DateTime.Parse(request.StartDate).ToUniversalTime();
                rental.EndDate = DateTime.Parse(request.EndDate).ToUniversalTime();
                rental.CreatedAt = DateTime.UtcNow;
                rental.Status = RentalStatus.PENDING;
                rental.VAT = RentalCalculationHelper.VAT_PERCENT;

                // Only ONE item allowed
                var protoItem = request.Item;
                var itemData = new RentalItemData
                {
                    TargetId = Guid.Parse(protoItem.TargetId),
                    IsCombo = protoItem.IsCombo,
                    Quantity = protoItem.Quantity
                };
                var items = new List<RentalItemData> { itemData };
                int totalQuantity = protoItem.Quantity;

                // Fetch price and details
                string name;
                double unitPrice;
                RentalTargetDetail? targetDetail = null;

                if (protoItem.IsCombo)
                {
                    var combo = await _deviceClient.GetComboAsync(new Device.GetComboRequest
                    {
                        ComboId = protoItem.TargetId
                    });
                    name = combo.Name;
                    unitPrice = combo.Price;
                    targetDetail = new RentalTargetDetail { Combo = combo };
                }
                else
                {
                    var device = await _deviceClient.GetDeviceAsync(new Device.GetDeviceRequest
                    {
                        DeviceId = protoItem.TargetId
                    });
                    name = device.Name;
                    unitPrice = device.Price;
                    targetDetail = new RentalTargetDetail { Device = device };

                    // Validate available quantity
                    if (device.Quantity < protoItem.Quantity)
                    {
                        throw new RpcException(new Status(StatusCode.FailedPrecondition, $"Not enough stock for device {protoItem.TargetId}. Available: {device.Quantity}, requested: {protoItem.Quantity}"));
                    }

                    // Reduce device quantity (send full payload to avoid overwriting with defaults)
                    try
                    {
                        var updateReq = new Device.UpdateDeviceRequest
                        {
                            DeviceId = protoItem.TargetId,
                            Name = device.Name,
                            Price = device.Price,
                            Description = device.Description,
                            Status = device.Status,
                            Quantity = Math.Max(0, device.Quantity - protoItem.Quantity),
                            CategoryId = device.CategoryId
                        };
                        updateReq.Information.AddRange(device.Information);
                        updateReq.Images.AddRange(device.Images);

                        await _deviceClient.UpdateDeviceAsync(updateReq);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to reduce device quantity for {DeviceId}", protoItem.TargetId);
                        throw new RpcException(new Status(StatusCode.Internal, "Failed to update device quantity"));
                    }
                }

                double totalRentalFee = unitPrice * protoItem.Quantity;
                double subtotal = totalRentalFee;

                var itemDetail = new RentalItemDetail
                {
                    TargetId = protoItem.TargetId,
                    IsCombo = protoItem.IsCombo,
                    Quantity = protoItem.Quantity,
                    Name = name,
                    UnitPrice = unitPrice,
                    Subtotal = subtotal,
                    Detail = targetDetail
                };

                // Calculate discount amount (capped by maxDiscount)
                double discountAmount = RentalCalculationHelper.CalculateDiscountAmount(
                    totalRentalFee,
                    request.DiscountPercent,
                    request.MaxDiscount
                );

                // Calculate price after discount (before deposit)
                double priceAfterDiscount = totalRentalFee - discountAmount;

                // Calculate deposit based on price after discount
                double deposit = RentalCalculationHelper.CalculateDeposit(priceAfterDiscount);

                // Final total price: (RentalFee - discount + deposit) * (1 + VAT/100)
                double totalPrice = RentalCalculationHelper.CalculateTotalPrice(totalRentalFee, discountAmount, deposit);

                rental.Items = JsonSerializer.Serialize(items);
                rental.RentalFee = totalRentalFee;
                rental.DiscountPercent = request.DiscountPercent;
                rental.MaxDiscount = request.MaxDiscount;
                rental.Deposit = deposit;
                rental.TotalPrice = totalPrice;
                rental.TotalQuantity = totalQuantity;

                var created = await _repository.CreateAsync(rental);

                var response = new RentalResponse
                {
                    Id = created.Id.ToString(),
                    UserId = created.UserId.ToString(),
                    Status = created.Status.ToString(),
                    RentalFee = created.RentalFee,
                    Deposit = created.Deposit ?? 0,
                    MaxDiscount = created.MaxDiscount,
                    DiscountPercent = created.DiscountPercent,
                    TotalPrice = created.TotalPrice,
                    TotalQuantity = created.TotalQuantity,
                    VAT = created.VAT,
                    StartDate = created.StartDate.ToString("O"),
                    EndDate = created.EndDate.ToString("O"),
                    CreatedAt = created.CreatedAt.ToString("O"),
                    ActualEndDate = created.ActualEndDate?.ToString("O") ?? string.Empty,
                };

                response.Items.Add(itemDetail);

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating rental");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

        // User: Get my rentals
        public override async Task<GetMyRentalsResponse> GetMyRentals(GetMyRentalsRequest request, ServerCallContext context)
        {
            try
            {
                var queryDto = new RentalQueryDto
                {
                    UserId = null,
                    Status = string.IsNullOrEmpty(request.Status) ? null : request.Status,
                    FromDate = null,
                    ToDate = null,
                    Page = request.Page > 0 ? request.Page : 1,
                    PageSize = request.Limit > 0 ? request.Limit : 10,
                    SortBy = null,
                    SortDirection = null
                };

                var userId = Guid.Parse(request.UserId);
                var pagedResult = await _repository.GetUserRentalsAsync(userId, queryDto);

                var response = new GetMyRentalsResponse
                {
                    TotalItems = (int)pagedResult.TotalCount,
                    Page = pagedResult.Page,
                    Limit = pagedResult.PageSize,
                    TotalPages = (int)Math.Ceiling((double)pagedResult.TotalCount / pagedResult.PageSize)
                };

                foreach (var rental in pagedResult.Items)
                {
                    var userRental = await MapToUserRental(rental);
                    response.Rentals.Add(userRental);
                }

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user rentals");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

        // User: Get rental by ID
        public override async Task<RentalResponse> GetRentalById(GetRentalByIdRequest request, ServerCallContext context)
        {
            try
            {
                var rentalId = Guid.Parse(request.RentalId);
                var rental = await _repository.GetByIdAsync(rentalId);

                if (rental is null)
                {
                    throw new RpcException(new Status(StatusCode.NotFound, "Rental not found"));
                }

                // Deserialize items and build details
                var items = JsonSerializer.Deserialize<List<RentalItemData>>(rental.Items) ?? new List<RentalItemData>();
                var itemDetails = await BuildItemDetails(items);

                var response = new RentalResponse
                {
                    Id = rental.Id.ToString(),
                    UserId = rental.UserId.ToString(),
                    Status = rental.Status.ToString(),
                    RentalFee = rental.RentalFee,
                    Deposit = rental.Deposit ?? 0,
                    MaxDiscount = rental.MaxDiscount,
                    DiscountPercent = rental.DiscountPercent,
                    TotalPrice = rental.TotalPrice,
                    TotalQuantity = rental.TotalQuantity,
                    VAT = rental.VAT,
                    StartDate = rental.StartDate.ToString("O"),
                    EndDate = rental.EndDate.ToString("O"),
                    CreatedAt = rental.CreatedAt.ToString("O"),
                    ActualEndDate = rental.ActualEndDate?.ToString("O") ?? string.Empty,
                };

                foreach (var item in itemDetails)
                {
                    response.Items.Add(item);
                }

                return response;
            }
            catch (RpcException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting rental by ID");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

        // Admin: Get all rentals
        public override async Task<GetAllRentalsAdminResponse> GetAllRentals(GetAllRentalsRequest request, ServerCallContext context)
        {
            try
            {
                // Permission: requester must be admin
                if (string.IsNullOrEmpty(request.RequesterId))
                {
                    throw new RpcException(new Status(StatusCode.PermissionDenied, "RequesterId is required"));
                }
                try
                {
                    var requester = await _userClient.GetProfileAsync(new User.GetProfileRequest { UserId = request.RequesterId });
                    if (!string.Equals(requester.Role, "ADMIN", StringComparison.OrdinalIgnoreCase))
                    {
                        throw new RpcException(new Status(StatusCode.PermissionDenied, "Only admin can access this resource"));
                    }
                }
                catch (RpcException) { throw; }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to validate admin role for requester {RequesterId}", request.RequesterId);
                    throw new RpcException(new Status(StatusCode.PermissionDenied, "Permission denied"));
                }

                var queryDto = new RentalQueryDto
                {
                    UserId = !string.IsNullOrEmpty(request.UserId) ? Guid.Parse(request.UserId) : null,
                    Status = string.IsNullOrEmpty(request.Status) ? null : request.Status,
                    FromDate = null,
                    ToDate = null,
                    Page = request.Page > 0 ? request.Page : 1,
                    PageSize = request.Limit > 0 ? request.Limit : 10,
                    SortBy = null,
                    SortDirection = null
                };

                var pagedResult = await _repository.GetAllRentalsAsync(queryDto);

                var response = new GetAllRentalsAdminResponse
                {
                    TotalItems = (int)pagedResult.TotalCount,
                    Page = pagedResult.Page,
                    Limit = pagedResult.PageSize,
                    TotalPages = (int)Math.Ceiling((double)pagedResult.TotalCount / pagedResult.PageSize)
                };

                foreach (var rental in pagedResult.Items)
                {
                    var adminRental = await MapToAdminRental(rental);
                    response.Rentals.Add(adminRental);
                }

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all rentals");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

        // Extensions: Create rental extension
        public override async Task<RentalResponse> CreateRentalExtension(CreateRentalExtensionRequest request, ServerCallContext context)
        {
            try
            {
                var rentalId = Guid.Parse(request.RentalId);
                var rental = await _repository.GetByIdAsync(rentalId);
                if (rental is null)
                {
                    throw new RpcException(new Status(StatusCode.NotFound, "Rental not found"));
                }

                DateTime newEnd;
                try { newEnd = DateTime.Parse(request.NewEndDate).ToUniversalTime(); }
                catch { throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid newEndDate")); }

                // Save current EndDate to ActualEndDate before extension
                if (!rental.ActualEndDate.HasValue)
                {
                    rental.ActualEndDate = rental.EndDate;
                }

                var extension = new RentalExtensionEntity
                {
                    RentalId = rental.Id,
                    NewEndDate = newEnd,
                    AdditionalFee = request.AdditionalFee,
                    AdditionalHours = request.AdditionalHours,
                    RequestedBy = Guid.TryParse(request.RequestedBy, out var uid) ? uid : null,
                    Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes
                };

                await _repository.CreateExtensionAsync(extension);

                // Update the rental's end date to reflect the extension
                rental.EndDate = newEnd;
                await _repository.UpdateAsync(rental.Id, new UpdateRentalRequestDto { EndDate = newEnd });

                // Return the updated rental
                var items = JsonSerializer.Deserialize<List<RentalItemData>>(rental.Items) ?? new List<RentalItemData>();
                var itemDetails = await BuildItemDetails(items);

                var response = new RentalResponse
                {
                    Id = rental.Id.ToString(),
                    UserId = rental.UserId.ToString(),
                    Status = rental.Status.ToString(),
                    RentalFee = rental.RentalFee,
                    Deposit = rental.Deposit ?? 0,
                    MaxDiscount = rental.MaxDiscount,
                    DiscountPercent = rental.DiscountPercent,
                    TotalPrice = rental.TotalPrice,
                    TotalQuantity = rental.TotalQuantity,
                    VAT = rental.VAT,
                    StartDate = rental.StartDate.ToString("O"),
                    EndDate = rental.EndDate.ToString("O"),
                    CreatedAt = rental.CreatedAt.ToString("O"),
                    ActualEndDate = rental.ActualEndDate?.ToString("O") ?? string.Empty,
                };

                foreach (var item in itemDetails)
                {
                    response.Items.Add(item);
                }

                return response;
            }
            catch (RpcException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating rental extension");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

        // Extensions: Get rental extensions by rentalId
        public override async Task<GetRentalExtensionsResponse> GetRentalExtensions(GetRentalExtensionsRequest request, ServerCallContext context)
        {
            try
            {
                var rentalId = Guid.Parse(request.RentalId);
                var items = await _repository.GetExtensionsByRentalIdAsync(rentalId);
                var resp = new GetRentalExtensionsResponse();
                foreach (var e in items)
                {
                    resp.Extensions.Add(new RentalExtensionMessage
                    {
                        Id = e.Id.ToString(),
                        RentalId = (e.RentalId?.ToString()) ?? string.Empty,
                        NewEndDate = e.NewEndDate?.ToString("O") ?? string.Empty,
                        AdditionalFee = e.AdditionalFee ?? 0,
                        AdditionalHours = e.AdditionalHours ?? 0,
                        RequestedBy = e.RequestedBy?.ToString() ?? string.Empty,
                        CreatedAt = e.CreatedAt?.ToString("O") ?? string.Empty,
                        Notes = e.Notes ?? string.Empty
                    });
                }
                return resp;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting rental extensions");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

        // Admin: Update rental
        public override async Task<RentalResponse> UpdateRental(UpdateRentalRequest request, ServerCallContext context)
        {
            try
            {
                var updateDto = new UpdateRentalRequestDto
                {
                    Status = string.IsNullOrEmpty(request.Status) ? null : request.Status,
                    StartDate = !string.IsNullOrEmpty(request.StartDate) ? DateTime.Parse(request.StartDate).ToUniversalTime() : null,
                    EndDate = !string.IsNullOrEmpty(request.EndDate) ? DateTime.Parse(request.EndDate).ToUniversalTime() : null
                };

                var rentalId = Guid.Parse(request.RentalId);
                var updated = await _repository.UpdateAsync(rentalId, updateDto);

                if (updated is null)
                {
                    throw new RpcException(new Status(StatusCode.NotFound, "Rental not found"));
                }

            var items = JsonSerializer.Deserialize<List<RentalItemData>>(updated.Items) ?? new List<RentalItemData>();
            var itemDetails = await BuildItemDetails(items);

            var response = new RentalResponse
            {
                Id = updated.Id.ToString(),
                UserId = updated.UserId.ToString(),
                Status = updated.Status.ToString(),
                RentalFee = updated.RentalFee,
                Deposit = updated.Deposit ?? 0,
                MaxDiscount = updated.MaxDiscount,
                DiscountPercent = updated.DiscountPercent,
                TotalPrice = updated.TotalPrice,
                TotalQuantity = updated.TotalQuantity,
                VAT = updated.VAT,
                StartDate = updated.StartDate.ToString("O"),
                EndDate = updated.EndDate.ToString("O"),
                CreatedAt = updated.CreatedAt.ToString("O"),
                ActualEndDate = updated.ActualEndDate?.ToString("O") ?? string.Empty,
            };

            foreach (var item in itemDetails)
            {
                response.Items.Add(item);
            }

            return response;
        }
            catch (RpcException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating rental");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

        // Admin: Delete rental
        public override async Task<DeleteRentalResponse> DeleteRental(DeleteRentalRequest request, ServerCallContext context)
{
    try
    {
        var rentalId = Guid.Parse(request.RentalId);
        var deleted = await _repository.DeleteAsync(rentalId);

        if (!deleted)
        {
            throw new RpcException(new Status(StatusCode.NotFound, "Rental not found"));
        }

        return new DeleteRentalResponse
        {
            Message = "RentalDeletedSuccessfully"
        };
    }
    catch (RpcException)
    {
        throw;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error deleting rental");
        throw new RpcException(new Status(StatusCode.Internal, ex.Message));
    }
}

// Helper methods
private async Task<UserRental> MapToUserRental(RentalEntity rental)
{
    var items = JsonSerializer.Deserialize<List<RentalItemData>>(rental.Items) ?? new List<RentalItemData>();
    var itemDetails = await BuildItemDetails(items);

    var response = new UserRental
    {
        Id = rental.Id.ToString(),
        TotalPrice = rental.TotalPrice,
        MaxDiscount = rental.MaxDiscount,
        DiscountPercent = rental.DiscountPercent,
        Status = rental.Status.ToString(),
        StartDate = rental.StartDate.ToString("O"),
        EndDate = rental.EndDate.ToString("O"),
        CreatedAt = rental.CreatedAt.ToString("O")
    };

    foreach (var item in itemDetails)
    {
        response.Items.Add(item);
    }

    return response;
}

private async Task<AdminRental> MapToAdminRental(RentalEntity rental)
{
    var userName = "Unknown";
    var userEmail = "";

    try
    {
        // Fetch user info
        var userResponse = await _userClient.GetProfileAsync(new User.GetProfileRequest
        {
            UserId = rental.UserId.ToString()
        });
        userName = userResponse.FullName;
        userEmail = userResponse.Email;
    }
    catch (Exception ex)
    {
        _logger.LogWarning(ex, "Failed to fetch user info for rental {RentalId}", rental.Id);
    }

    var items = JsonSerializer.Deserialize<List<RentalItemData>>(rental.Items) ?? new List<RentalItemData>();
    var itemDetails = await BuildItemDetails(items);

    var response = new AdminRental
    {
        Id = rental.Id.ToString(),
        UserId = rental.UserId.ToString(),
        UserName = userName,
        UserEmail = userEmail,
        TotalPrice = rental.TotalPrice,
        MaxDiscount = rental.MaxDiscount,
        DiscountPercent = rental.DiscountPercent,
        Status = rental.Status.ToString(),
        StartDate = rental.StartDate.ToString("O"),
        EndDate = rental.EndDate.ToString("O"),
        CreatedAt = rental.CreatedAt.ToString("O")
    };

    foreach (var item in itemDetails)
    {
        response.Items.Add(item);
    }

    return response;
}

// Build item details helper
private async Task<List<RentalItemDetail>> BuildItemDetails(List<RentalItemData> items)
{
    var details = new List<RentalItemDetail>();

    foreach (var item in items)
    {
        try
        {
            string name;
            double unitPrice;
            RentalTargetDetail? targetDetail = null;

            if (item.IsCombo)
            {
                var combo = await _deviceClient.GetComboAsync(new Device.GetComboRequest
                {
                    ComboId = item.TargetId.ToString()
                });
                name = combo.Name;
                unitPrice = combo.Price;
                targetDetail = new RentalTargetDetail { Combo = combo };
            }
            else
            {
                var device = await _deviceClient.GetDeviceAsync(new Device.GetDeviceRequest
                {
                    DeviceId = item.TargetId.ToString()
                });
                name = device.Name;
                unitPrice = device.Price;
                targetDetail = new RentalTargetDetail { Device = device };
            }

            details.Add(new RentalItemDetail
            {
                TargetId = item.TargetId.ToString(),
                IsCombo = item.IsCombo,
                Quantity = item.Quantity,
                Name = name,
                UnitPrice = unitPrice,
                Subtotal = unitPrice * item.Quantity,
                Detail = targetDetail
            });
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to build detail for item {TargetId}", item.TargetId);
            // Add placeholder detail
            details.Add(new RentalItemDetail
            {
                TargetId = item.TargetId.ToString(),
                IsCombo = item.IsCombo,
                Quantity = item.Quantity,
                Name = "Unknown",
                UnitPrice = 0,
                Subtotal = 0
            });
        }
    }

    return details;
}
    }
}
