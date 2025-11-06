using Grpc.Core;
using AutoMapper;
using rental.Repository;
using rental.Model.Dto;
using Rental;
using RentalEntity = rental.Model.Entities.Rental;
using RentalExtensionEntity = rental.Model.Entities.RentalExtension;
using rental.Model.Entities;
using System.Text.Json;
using rental.Nats;

namespace rental.Service
{
    public class RentalGrpcService : global::Rental.RentalService.RentalServiceBase
    {
        private readonly RentalRepository _repository;
        private readonly IMapper _mapper;
        private readonly ILogger<RentalGrpcService> _logger;
        private readonly User.UserService.UserServiceClient _userClient;
        private readonly Device.DeviceService.DeviceServiceClient _deviceClient;
        private readonly Payment.PaymentService.PaymentServiceClient _paymentClient;
        private readonly NatsPublisher _natsPublisher;

        public RentalGrpcService(
            RentalRepository repository,
            IMapper mapper,
            ILogger<RentalGrpcService> logger,
            User.UserService.UserServiceClient userClient,
            Device.DeviceService.DeviceServiceClient deviceClient,
            Payment.PaymentService.PaymentServiceClient paymentClient,
            NatsPublisher natsPublisher)
        {
            _repository = repository;
            _mapper = mapper;
            _logger = logger;
            _userClient = userClient;
            _deviceClient = deviceClient;
            _paymentClient = paymentClient;
            _natsPublisher = natsPublisher;
        }

        // User: Create rental
        public override async Task<RentalResponse> CreateRental(CreateRentalRequest request, ServerCallContext context)
        {
            try
            {
                if (request.Items == null || request.Items.Count == 0)
                {
                    throw new RpcException(new Status(StatusCode.InvalidArgument, "At least one item is required"));
                }

                var rental = new RentalEntity();
                rental.Id = Guid.NewGuid();
                rental.UserId = Guid.Parse(request.UserId);
                rental.StartDate = DateTime.Parse(request.StartDate).ToUniversalTime();
                rental.EndDate = DateTime.Parse(request.EndDate).ToUniversalTime();
                rental.CreatedAt = DateTime.UtcNow;
                rental.Status = RentalStatus.PENDING;

                // Process multiple items
                var itemsDataList = new List<RentalItemData>();
                var itemDetailsList = new List<RentalItemDetail>();
                int totalQuantity = 0;
                double totalRentalFee = 0;

                foreach (var protoItem in request.Items)
                {
                    var itemData = new RentalItemData
                    {
                        TargetId = Guid.Parse(protoItem.TargetId),
                        IsCombo = protoItem.IsCombo,
                        Quantity = protoItem.Quantity
                    };
                    itemsDataList.Add(itemData);
                    totalQuantity += protoItem.Quantity;

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

                        // Reduce device quantity
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

                    double subtotal = unitPrice * protoItem.Quantity;
                    totalRentalFee += subtotal;

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
                    itemDetailsList.Add(itemDetail);
                }

                // Calculate discount
                double discountAmount = RentalCalculationHelper.CalculateDiscountAmount(
                    totalRentalFee,
                    request.DiscountPercent,
                    request.MaxDiscount
                );

                // Calculate total price: (RentalFee - Discount) × 1.1 (including VAT 10%)
                double totalPrice = RentalCalculationHelper.CalculateTotalPrice(totalRentalFee, discountAmount);

                // Calculate deposit: 20% of total price (paid upfront)
                double deposit = RentalCalculationHelper.CalculateDeposit(totalPrice);

                // Calculate remaining amount: 80% of total price (paid on pickup)
                double remainingAmount = RentalCalculationHelper.CalculateRemainingAmount(totalPrice);

                rental.Items = JsonSerializer.Serialize(itemsDataList);
                rental.RentalFee = totalRentalFee;
                rental.DiscountPercent = request.DiscountPercent;
                rental.MaxDiscount = request.MaxDiscount;
                rental.Deposit = deposit;
                rental.RemainingAmount = remainingAmount;
                rental.TotalPrice = totalPrice;
                rental.TotalQuantity = totalQuantity;

                var created = await _repository.CreateAsync(rental);

                // Record initial status in history
                await RecordStatusChange(created.Id, RentalStatus.PENDING, RentalStatus.PENDING, "Initial rental creation");

                // Payment integration - CLIENT ONLY PAYS DEPOSIT
                string? paymentMessage = null;
                try
                {
                    var demoMode = (Environment.GetEnvironmentVariable("PAYMENT_DEMO_MODE") ?? "false").Equals("true", StringComparison.OrdinalIgnoreCase);

                    if (!demoMode)
                    {
                        var req = new Payment.WebhookPaymentRequest
                        {
                            Id = (int)(DateTimeOffset.UtcNow.ToUnixTimeSeconds() % int.MaxValue),
                            Gateway = "internal",
                            TransactionDate = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                            TransferType = "in",
                            TransferAmount = deposit, // Only charge deposit
                            Accumulated = deposit,
                            Description = $"Deposit for rental:{created.Id} user:{created.UserId}",
                        };

                        var resp = await _paymentClient.ReceiverAsync(req);
                        paymentMessage = resp.Message;

                        // If payment succeeds, mark rental as DEPOSIT_PAID
                        if (!string.IsNullOrWhiteSpace(paymentMessage))
                        {
                            await _repository.UpdateAsync(created.Id, new UpdateRentalRequestDto { Status = RentalStatus.DEPOSIT_PAID.ToString() });
                            created.Status = RentalStatus.DEPOSIT_PAID;
                            await RecordStatusChange(created.Id, RentalStatus.PENDING, RentalStatus.DEPOSIT_PAID, "Deposit payment successful");
                        }
                    }
                    else
                    {
                        paymentMessage = "Payment.Success (demo)";
                        await _repository.UpdateAsync(created.Id, new UpdateRentalRequestDto { Status = RentalStatus.DEPOSIT_PAID.ToString() });
                        created.Status = RentalStatus.DEPOSIT_PAID;
                        await RecordStatusChange(created.Id, RentalStatus.PENDING, RentalStatus.DEPOSIT_PAID, "Deposit payment successful (demo mode)");
                    }
                }
                catch (RpcException ex)
                {
                    _logger.LogWarning(ex, "Payment integration failed for rental {RentalId}. Leaving status as {Status}", created.Id, created.Status);
                }

                // Publish rental.created event to NATS
                try
                {
                    await _natsPublisher.PublishAsync("rental.created", new
                    {
                        rentalId = created.Id,
                        userId = created.UserId,
                        items = itemsDataList,
                        status = created.Status.ToString(),
                        deposit = created.Deposit,
                        totalPrice = created.TotalPrice,
                        startDate = created.StartDate,
                        endDate = created.EndDate,
                        createdAt = created.CreatedAt
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to publish rental.created event for rental {RentalId}", created.Id);
                }

                var response = new RentalResponse
                {
                    Id = created.Id.ToString(),
                    UserId = created.UserId.ToString(),
                    Status = created.Status.ToString(),
                    RentalFee = created.RentalFee,
                    Deposit = created.Deposit ?? 0,
                    RemainingAmount = created.RemainingAmount ?? 0,
                    MaxDiscount = created.MaxDiscount,
                    DiscountPercent = created.DiscountPercent,
                    TotalPrice = created.TotalPrice,
                    TotalQuantity = created.TotalQuantity,
                    StartDate = created.StartDate.ToString("O"),
                    EndDate = created.EndDate.ToString("O"),
                    CreatedAt = created.CreatedAt.ToString("O"),
                    ActualEndDate = created.ActualEndDate?.ToString("O") ?? string.Empty,
                };

                response.Items.AddRange(itemDetailsList);

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating rental");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

        //User: Cancel rental
        public override async Task<CancelRentalResponse> CancelRental(CancelRentalRequest request, ServerCallContext context)
        {
            try
            {
                var rentalId = Guid.Parse(request.RentalId);
                var rental = await _repository.GetByIdAsync(rentalId);
                if (rental is null)
                {
                    throw new RpcException(new Status(StatusCode.NotFound, "Rental not found"));
                }

                if (rental.Status != RentalStatus.PENDING && rental.Status != RentalStatus.DEPOSIT_PAID)
                {
                    throw new RpcException(new Status(StatusCode.FailedPrecondition, "Only PENDING or DEPOSIT_PAID rentals can be cancelled"));
                }

                // Calculate refund amount based on cancellation time
                double refundPercent = RentalCalculationHelper.CalculateRefundPercent(rental.StartDate, DateTime.UtcNow);
                double refundAmount = RentalCalculationHelper.CalculateRefundAmount(rental.Deposit ?? 0, refundPercent);

                // Deserialize items for event publishing
                var items = DeserializeItemsSafe(rental.Items);

                // Update rental status to CANCELLED
                await _repository.UpdateAsync(rental.Id, new UpdateRentalRequestDto { Status = RentalStatus.CANCELLED.ToString() });
                await RecordStatusChange(rental.Id, rental.Status, RentalStatus.CANCELLED,
                    $"Rental cancelled by user. Refund: {refundPercent}% = {refundAmount:F2} VND");

                _logger.LogInformation(
                    "Rental {RentalId} cancelled. Deposit: {Deposit} VND, Refund: {RefundPercent}% = {RefundAmount} VND",
                    rentalId, rental.Deposit ?? 0, refundPercent, refundAmount);

                // TODO: Integrate with payment service to process refund

                // Publish rental.cancelled event to NATS
                try
                {
                    await _natsPublisher.PublishAsync("rental.cancelled", new
                    {
                        rentalId = rental.Id,
                        userId = rental.UserId,
                        items = items, // để device service biết cần hoàn lại bao nhiêu
                        refundAmount = refundAmount,
                        refundPercent = refundPercent,
                        cancelledAt = DateTime.UtcNow
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to publish rental.cancelled event for rental {RentalId}", rental.Id);
                }

                var response = new CancelRentalResponse
                {
                    Success = true,
                    Message = $"Rental cancelled successfully. Refund amount: {refundAmount:F2} VND ({refundPercent}% of deposit)",
                    RefundAmount = refundAmount,
                    RefundPercent = refundPercent
                };

                return response;
            }
            catch (RpcException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling rental");
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

                // Deserialize items and build details (defensive for null/empty/invalid JSON)
                var items = DeserializeItemsSafe(rental.Items);
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

                // If additional fee applies, attempt payment for the extension
                if (request.AdditionalFee > 0)
                {
                    try
                    {
                        var demoMode = (Environment.GetEnvironmentVariable("PAYMENT_DEMO_MODE") ?? "false").Equals("true", StringComparison.OrdinalIgnoreCase);
                        if (!demoMode)
                        {
                            var reqPay = new Payment.WebhookPaymentRequest
                            {
                                Id = (int)(DateTimeOffset.UtcNow.ToUnixTimeSeconds() % int.MaxValue),
                                Gateway = "internal",
                                TransactionDate = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                                TransferType = "in",
                                TransferAmount = request.AdditionalFee,
                                Accumulated = request.AdditionalFee,
                                Description = $"rental-extension:{rental.Id}",
                            };
                            await _paymentClient.ReceiverAsync(reqPay);
                        }
                        else
                        {
                            _logger.LogInformation("[Payment DEMO] Extension fee for rental {RentalId} paid successfully.", rental.Id);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Payment for rental extension failed for rental {RentalId}", rental.Id);
                    }
                }

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
                var rentalId = Guid.Parse(request.RentalId);

                // Get current rental to track status change
                var currentRental = await _repository.GetByIdAsync(rentalId);
                if (currentRental is null)
                {
                    throw new RpcException(new Status(StatusCode.NotFound, "Rental not found"));
                }

                var oldStatus = currentRental.Status;

                var updateDto = new UpdateRentalRequestDto
                {
                    Status = string.IsNullOrEmpty(request.Status) ? null : request.Status,
                    StartDate = !string.IsNullOrEmpty(request.StartDate) ? DateTime.Parse(request.StartDate).ToUniversalTime() : null,
                    EndDate = !string.IsNullOrEmpty(request.EndDate) ? DateTime.Parse(request.EndDate).ToUniversalTime() : null
                };

                var updated = await _repository.UpdateAsync(rentalId, updateDto);

                if (updated is null)
                {
                    throw new RpcException(new Status(StatusCode.NotFound, "Rental not found"));
                }

                // Record status change if status was updated
                if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<RentalStatus>(request.Status, true, out var newStatus))
                {
                    if (oldStatus != newStatus)
                    {
                        await RecordStatusChange(rentalId, oldStatus, newStatus, $"Admin updated status from {oldStatus} to {newStatus}");

                        // Handle refund if status changed to CANCELLED or COMPLETED
                        if (newStatus == RentalStatus.CANCELLED || newStatus == RentalStatus.COMPLETED)
                        {
                            double refundPercent = 0;
                            if (newStatus == RentalStatus.CANCELLED)
                            {
                                refundPercent = RentalCalculationHelper.CalculateRefundPercent(updated.StartDate, DateTime.UtcNow);
                            }
                            else if (newStatus == RentalStatus.COMPLETED)
                            {
                                refundPercent = 100; // Full refund on completion
                            }

                            double refundAmount = RentalCalculationHelper.CalculateRefundAmount(updated.Deposit ?? 0, refundPercent);
                            _logger.LogInformation("Rental {RentalId} status changed to {NewStatus}. Refund: {RefundPercent}% = {RefundAmount} VND",
                                rentalId, newStatus, refundPercent, refundAmount);

                            // TODO: Integrate with payment service to process refund
                        }

                        // Publish rental.updated event to NATS
                        try
                        {
                            await _natsPublisher.PublishAsync("rental.updated", new
                            {
                                rentalId = updated.Id,
                                userId = updated.UserId,
                                oldStatus = oldStatus.ToString(),
                                newStatus = newStatus.ToString(),
                                updatedAt = DateTime.UtcNow
                            });
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to publish rental.updated event for rental {RentalId}", rentalId);
                        }

                        // Publish rental.completed event if status is COMPLETED
                        if (newStatus == RentalStatus.COMPLETED)
                        {
                            try
                            {
                                var items = DeserializeItemsSafe(updated.Items);
                                await _natsPublisher.PublishAsync("rental.completed", new
                                {
                                    rentalId = updated.Id,
                                    userId = updated.UserId,
                                    items = items,
                                    completedAt = DateTime.UtcNow
                                });
                            }
                            catch (Exception ex)
                            {
                                _logger.LogWarning(ex, "Failed to publish rental.completed event for rental {RentalId}", rentalId);
                            }
                        }
                    }
                }

                // Defensive JSON parsing for rental items
                var itemDetails = await BuildItemDetails(DeserializeItemsSafe(updated.Items));

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
            // Defensive JSON parsing for rental items
            var items = DeserializeItemsSafe(rental.Items);
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

            // Defensive JSON parsing for rental items
            var items = DeserializeItemsSafe(rental.Items);
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

        // Safely deserialize rental items JSON to a strongly-typed list.
        // Returns an empty list when the JSON is null/empty/whitespace or invalid.
        private List<RentalItemData> DeserializeItemsSafe(string? json)
        {
            if (string.IsNullOrWhiteSpace(json))
            {
                return new List<RentalItemData>();
            }
            try
            {
                var result = JsonSerializer.Deserialize<List<RentalItemData>>(json);
                return result ?? new List<RentalItemData>();
            }
            catch (JsonException ex)
            {
                _logger.LogWarning(ex, "Failed to deserialize rental items JSON. Returning empty list.");
                return new List<RentalItemData>();
            }
        }

        // Record status change in rental history
        private async Task RecordStatusChange(Guid rentalId, RentalStatus oldStatus, RentalStatus newStatus, string? notes = null)
        {
            try
            {
                var history = new RentalHistory
                {
                    Id = Guid.NewGuid(),
                    RentalId = rentalId,
                    OldStatus = oldStatus,
                    NewStatus = newStatus,
                    ChangedAt = DateTime.UtcNow,
                    Notes = notes
                };

                await _repository.AddRentalHistoryAsync(history);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to record status change for rental {RentalId}", rentalId);
                // Don't throw - status change logging is not critical
            }
        }

        // Get rental history
        public override async Task<GetHistoryRentalResponse> GetHistoryRental(GetHistoryRentalRequest request, ServerCallContext context)
        {
            try
            {
                if (!Guid.TryParse(request.RentalId, out var rentalId))
                {
                    throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid rental ID format"));
                }

                // Verify rental exists
                var rental = await _repository.GetByIdAsync(rentalId);
                if (rental == null)
                {
                    throw new RpcException(new Status(StatusCode.NotFound, "Rental not found"));
                }

                // Get history records
                var histories = await _repository.GetRentalHistoryAsync(rentalId);

                var response = new GetHistoryRentalResponse();
                foreach (var history in histories)
                {
                    response.Histories.Add(new RentalHistoryMessage
                    {
                        Id = history.Id.ToString(),
                        RentalId = history.RentalId.ToString(),
                        OldStatus = history.OldStatus.ToString(),
                        NewStatus = history.NewStatus.ToString(),
                        ChangedAt = history.ChangedAt.ToString("o"), // ISO 8601 format
                        Notes = history.Notes ?? ""
                    });
                }

                return response;
            }
            catch (RpcException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting rental history for rental {RentalId}", request.RentalId);
                throw new RpcException(new Status(StatusCode.Internal, "Failed to get rental history"));
            }
        }
    }
}
