using Grpc.Core;
using rental.Repository;
using rental.Model.Dto;
using Rental;
using RentalEntity = rental.Model.Entities.Rental;
using rental.Model.Entities;
using System.Text.Json;
using rental.Nats;
namespace rental.Service
{
    public partial class RentalGrpcService : Rental.RentalService.RentalServiceBase
    {
        private readonly RentalRepository _repository;
        private readonly ILogger<RentalGrpcService> _logger;
        private readonly User.UserService.UserServiceClient _userClient;
        private readonly Device.DeviceService.DeviceServiceClient _deviceClient;
        private readonly Payment.PaymentService.PaymentServiceClient _paymentClient;
        private readonly NatsPublisher _natsPublisher;

        public RentalGrpcService(
            RentalRepository repository,
            ILogger<RentalGrpcService> logger,
            User.UserService.UserServiceClient userClient,
            Device.DeviceService.DeviceServiceClient deviceClient,
            Payment.PaymentService.PaymentServiceClient paymentClient,
            NatsPublisher natsPublisher)
        {
            _repository = repository;
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

                        // NOTE: Quantity will be reduced by RentalPaidConsumer after payment is confirmed
                        // This prevents duplicate reduction and ensures quantity is only decreased for paid rentals
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

                // Calculate rental days
                int rentalDays = RentalCalculationHelper.CalculateRentalDays(rental.StartDate, rental.EndDate);

                // Calculate discount
                double discountAmount = RentalCalculationHelper.CalculateDiscountAmount(
                    totalRentalFee,
                    request.DiscountPercent,
                    request.MaxDiscount
                );

                // Calculate total price: (RentalFee - Discount) × RentalDays × 1.1 (including VAT 10%)
                // totalRentalFee = sum of (unitPrice × quantity) for all items
                double totalPrice = RentalCalculationHelper.CalculateTotalPrice(totalRentalFee, discountAmount, rentalDays);

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

                var createDto = new CreateRentalRequestDto
                {
                    UserId = rental.UserId,
                    StartDate = rental.StartDate,
                    EndDate = rental.EndDate,
                    Items = itemsDataList
                };

                var created = await _repository.CreateAsync(createDto);

                // Update the created entity with calculated values
                created.RentalFee = totalRentalFee;
                created.DiscountPercent = request.DiscountPercent;
                created.MaxDiscount = request.MaxDiscount;
                created.Deposit = deposit;
                created.RemainingAmount = remainingAmount;
                created.TotalPrice = totalPrice;
                created.TotalQuantity = totalQuantity;

                await _repository.SaveChangesAsync();

                // Record initial status in history
                await RecordStatusChange(created.Id, RentalStatus.PENDING, RentalStatus.PENDING, "Initial rental creation");

                // Publish NATS events for payment processing
                // Payment service will handle payment creation and send back rental-paid or rental-expired events
                try
                {
                    var rentalCreatedEvent = new rental.Nats.Events.RentalCreatedEvent
                    {
                        id = created.Id.ToString(),
                        userId = created.UserId.ToString(),
                        type = itemsDataList.Any(i => i.IsCombo) ? "COMBO" : "DEVICE",
                        rentalId = created.Id.ToString(),
                        totalAmount = created.Deposit.GetValueOrDefault()
                    };

                    // Publish rental.created event for notification/logging
                    await _natsPublisher.PublishAsync("journey.events.rental.created", rentalCreatedEvent);

                    // Publish to payment-booking subject for payment service to create payment record
                    await _natsPublisher.PublishAsync("journey.events.payment-booking", rentalCreatedEvent);

                    _logger.LogInformation("[Rental] Published payment-booking event for rental {RentalId} with deposit amount {Deposit}",
                        created.Id, created.Deposit);
                    await RecordStatusChange(created.Id, RentalStatus.PENDING, RentalStatus.PAID, "Initial rental creation");

                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to publish rental events for rental {RentalId}", created.Id);
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

                if (rental.Status != RentalStatus.PENDING && rental.Status != RentalStatus.PAID)
                {
                    throw new RpcException(new Status(StatusCode.FailedPrecondition, "Only PENDING or PAID rentals can be cancelled"));
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
                    rentalId, rental.Deposit.GetValueOrDefault(), refundPercent, refundAmount);

                // Restore device quantity if rental was PAID (quantity was already decreased)
                if (rental.Status == RentalStatus.PAID && items != null && items.Count > 0)
                {
                    try
                    {
                        var quantityChangeEvent = new rental.Nats.Events.RentalQuantityChangeEvent
                        {
                            RentalId = rental.Id.ToString(),
                            Action = "INCREASE",
                            Items = items.Select(item => new rental.Nats.Events.QuantityChangeItem
                            {
                                TargetId = item.TargetId.ToString(),
                                IsCombo = item.IsCombo,
                                Quantity = item.Quantity
                            }).ToList(),
                            ChangedAt = DateTime.UtcNow
                        };

                        await _natsPublisher.PublishAsync("journey.events.rental-quantity-change", quantityChangeEvent);
                        _logger.LogInformation("[Rental] Published quantity INCREASE event for cancelled rental {RentalId}", rental.Id);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to publish quantity increase event for rental {RentalId}", rental.Id);
                    }
                }

                // Publish refund-created event to Payment service
                try
                {
                    var refundCreatedEvent = new
                    {
                        id = Guid.NewGuid().ToString(),
                        rentalId = rental.Id.ToString(),
                        userId = rental.UserId.ToString(),
                        penaltyAmount = 0.0,
                        damageAmount = 0.0,
                        overtimeAmount = 0.0,
                        collateral = 0.0,
                        deposit = rental.Deposit.GetValueOrDefault()
                    };
                    await _natsPublisher.PublishAsync("journey.events.refund-created", refundCreatedEvent);
                    _logger.LogInformation("[Rental] Published refund-created event for rental {RentalId}", rental.Id);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to publish refund-created event for rental {RentalId}", rental.Id);
                }

                // TODO: Integrate with payment service to process refund

                // Publish rental.cancelled event to NATS
                try
                {
                    var rentalCancelledEvent = new RentalCancelledEvent
                    {
                        rentalId = rental.Id.ToString(),
                        userId = rental.UserId.ToString(),
                        refundAmount = refundAmount,
                        refundPercent = (int)refundPercent,
                        reason = "User cancelled rental",
                        cancelledAt = DateTime.UtcNow
                    };
                    await _natsPublisher.PublishAsync("journey.events.rental.cancelled", rentalCancelledEvent);
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

                // Add ReviewId if exists
                if (rental.ReviewId.HasValue)
                {
                    response.ReviewId = rental.ReviewId.Value.ToString();
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

        /* EXTENSIONS */

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

                // Calculate additional days between current EndDate and new EndDate
                int additionalDays = (int)(newEnd - rental.EndDate).TotalDays;
                if (additionalDays <= 0)
                {
                    throw new RpcException(new Status(StatusCode.InvalidArgument, "New end date must be after current end date"));
                }

                // Calculate extension total price using same formula as rental
                // TotalPrice = (RentalFee - Discount) × AdditionalDays × 1.1 (VAT)
                double discountAmount = RentalCalculationHelper.CalculateDiscountAmount(
                    rental.RentalFee,
                    rental.DiscountPercent,
                    rental.MaxDiscount
                );
                double extensionTotalPrice = RentalCalculationHelper.CalculateExtensionTotalPrice(
                    rental.RentalFee,
                    discountAmount,
                    additionalDays
                );

                // Save current EndDate to ActualEndDate before extension
                if (!rental.ActualEndDate.HasValue)
                {
                    rental.ActualEndDate = rental.EndDate;
                }

                var createdDto = new CreateRentalExtensionRequestDto
                {
                    RentalId = rental.Id,
                    NewEndDate = newEnd,
                    AdditionalDays = additionalDays,
                    TotalPrice = extensionTotalPrice,
                    RequestedBy = Guid.TryParse(request.RequestedBy, out var uid) ? uid : null,
                    Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes
                };

                var extensionCreated = await _repository.CreateExtensionAsync(createdDto);

                // Update the rental's end date to reflect the extension
                rental.EndDate = newEnd;
                await _repository.UpdateAsync(rental.Id, new UpdateRentalRequestDto { EndDate = newEnd });

                // Publish rental extension event to NATS for payment service
                if (additionalDays > 0)
                {
                    try
                    {
                        var extensionEvent = new RentalExtensionCreatedEvent
                        {
                            id = Guid.NewGuid().ToString(),
                            userId = rental.UserId.ToString(),
                            type = "EXTENSION",
                            rentalId = rental.Id.ToString(),
                            totalAmount = extensionTotalPrice
                        };
                        await _natsPublisher.PublishAsync("journey.events.payment-extension", extensionEvent);
                        _logger.LogInformation("[Rental] Published payment-extension event for rental {RentalId} with totalPrice {ExtensionTotalPrice}", rental.Id, extensionTotalPrice);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "[Rental] Failed to publish payment-extension event for rental {RentalId}", rental.Id);
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
                        AdditionalDays = e.AdditionalDays ?? 0,
                        RequestedBy = e.RequestedBy?.ToString() ?? string.Empty,
                        CreatedAt = e.CreatedAt?.ToString("O") ?? string.Empty,
                        Notes = e.Notes ?? string.Empty,
                        Status = e.Status.ToString()
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
