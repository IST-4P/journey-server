using Grpc.Core;
using rental.Model.Dto;
using Rental;
using rental.Model.Entities;
using System.Text.Json;
using Google.Protobuf;


namespace rental.Service
{
    public partial class RentalGrpcService
    {
        // Extensions: Create rental extension
        public override async Task<RentalResponse> CreateRentalExtension(CreateRentalExtensionRequest request, ServerCallContext context)
        {
            try
            {
                var rentalId = Guid.Parse(request.RentalId);
                var rental = await _repository.GetByIdAsync(rentalId);
                if (rental is null)
                {
                    throw new RpcException(new Status(StatusCode.NotFound, "Error.RentalNotFound"));
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

                // Return the created extension with all details
                var extensionResponse = new RentalResponse
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

                var items = JsonSerializer.Deserialize<List<RentalItemData>>(rental.Items) ?? new List<RentalItemData>();
                var itemDetails = await BuildItemDetails(items);
                foreach (var item in itemDetails)
                {
                    extensionResponse.Items.Add(item);
                }

                _logger.LogInformation("[Rental] Created extension {ExtensionId} for rental {RentalId} with totalPrice {TotalPrice}", extensionCreated.Id, rental.Id, extensionTotalPrice);

                return extensionResponse;
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
                        TotalPrice = e.TotalPrice ?? 0,
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

        // Extensions: Update extension status (Admin only)
        public override async Task<UpdateExtensionStatusResponse> UpdateExtensionStatus(UpdateExtensionStatusRequest request, ServerCallContext context)
        {
            try
            {
                var extensionId = Guid.Parse(request.ExtensionId);
                var extension = await _repository.GetExtensionByIdAsync(extensionId);

                if (extension is null)
                {
                    throw new RpcException(new Status(StatusCode.NotFound, "Extension not found"));
                }

                if (!Enum.TryParse<ExtensionStatus>(request.Status, true, out var newStatus))
                {
                    throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid status"));
                }

                // Update extension status
                await _repository.UpdateExtensionStatusAsync(extensionId, newStatus, request.AdminNotes);
                extension.Status = newStatus;

                // If APPROVED, publish payment event to NATS
                if (newStatus == ExtensionStatus.APPROVED && extension.RentalId.HasValue)
                {
                    var rental = await _repository.GetByIdAsync(extension.RentalId.Value);
                    if (rental != null)
                    {
                        try
                        {
                            var extensionEvent = new RentalExtensionCreatedEvent
                            {
                                id = extensionId.ToString(),
                                userId = rental.UserId.ToString(),
                                type = "EXTENSION",
                                rentalId = rental.Id.ToString(),
                                totalAmount = extension.TotalPrice ?? 0
                            };
                            await _natsPublisher.PublishAsync("journey.events.payment-extension", extensionEvent);
                            _logger.LogInformation("[Rental] Published payment-extension event for extension {ExtensionId} with totalPrice {TotalPrice}",
                                extensionId, extension.TotalPrice);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "[Rental] Failed to publish payment-extension event for extension {ExtensionId}", extensionId);
                        }
                    }
                }

                var response = new UpdateExtensionStatusResponse
                {
                    Success = true,
                    Message = $"Extension status updated to {newStatus}",
                    Extension = new RentalExtensionMessage
                    {
                        Id = extension.Id.ToString(),
                        RentalId = extension.RentalId?.ToString() ?? string.Empty,
                        NewEndDate = extension.NewEndDate?.ToString("O") ?? string.Empty,
                        AdditionalDays = extension.AdditionalDays ?? 0,
                        TotalPrice = extension.TotalPrice ?? 0,
                        RequestedBy = extension.RequestedBy?.ToString() ?? string.Empty,
                        CreatedAt = extension.CreatedAt?.ToString("O") ?? string.Empty,
                        Notes = extension.Notes ?? string.Empty,
                        Status = extension.Status.ToString()
                    }
                };

                return response;
            }
            catch (RpcException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating extension status");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }