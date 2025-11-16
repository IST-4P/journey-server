using Grpc.Core;
using rental.Model.Dto;
using Rental;
using rental.Model.Entities;


namespace rental.Service
{
    public partial class RentalGrpcService
    {

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
                            var rentalUpdatedEvent = new RentalUpdatedEvent
                            {
                                rentalId = updated.Id.ToString(),
                                status = newStatus.ToString(),
                                updatedAt = DateTime.UtcNow
                            };
                            await _natsPublisher.PublishAsync("journey.events.rental.updated", rentalUpdatedEvent);

                            // Publish rental.received event if status changed to RECEIVED
                            if (newStatus == RentalStatus.RECEIVED)
                            {
                                var rentalReceivedEvent = new RentalReceivedEvent
                                {
                                    RentalId = updated.Id.ToString(),
                                    UserId = updated.UserId.ToString(),
                                    RemainingAmountPaid = updated.RemainingAmount ?? 0,
                                    ReceivedAt = DateTime.UtcNow
                                };
                                await _natsPublisher.PublishAsync("journey.events.rental.received", rentalReceivedEvent);
                            }
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
                                var rentalCompletedEvent = new RentalCompletedEvent
                                {
                                    rentalId = updated.Id.ToString(),
                                    userId = updated.UserId.ToString(),
                                    completedAt = DateTime.UtcNow
                                };
                                await _natsPublisher.PublishAsync("journey.events.rental.completed", rentalCompletedEvent);
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

    }
}