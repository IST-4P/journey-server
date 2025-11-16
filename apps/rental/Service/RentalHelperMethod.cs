using rental.Model.Dto;
using Rental;
using RentalEntity = rental.Model.Entities.Rental;
using rental.Model.Entities;
using System.Text.Json;

namespace rental.Service
{
    public partial class RentalGrpcService
    {

        private async Task<AdminRental> MapToAdminRental(RentalEntity rental)
        {
            var dto = await MapToAdminRentalDto(rental);

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

            var response = new AdminRental
            {
                Id = dto.Id.ToString(),
                UserId = dto.UserId.ToString(),
                UserName = userName,
                UserEmail = userEmail,
                TotalPrice = dto.TotalPrice,
                MaxDiscount = dto.MaxDiscount,
                DiscountPercent = dto.DiscountPercent,
                Status = dto.Status,
                StartDate = dto.StartDate.ToString("O"),
                EndDate = dto.EndDate.ToString("O"),
                CreatedAt = dto.CreatedAt.ToString("O")
            };


            return response;
        }

        private async Task<AdminRentalDto> MapToAdminRentalDto(RentalEntity rental)
        {
            var items = DeserializeItemsSafe(rental.Items);

            return new AdminRentalDto
            {
                Id = rental.Id,
                UserId = rental.UserId,
                TotalPrice = rental.TotalPrice,
                MaxDiscount = rental.MaxDiscount,
                DiscountPercent = rental.DiscountPercent,
                Status = rental.Status.ToString(),
                StartDate = rental.StartDate,
                EndDate = rental.EndDate,
                CreatedAt = rental.CreatedAt
            };
        }

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

        private async Task<UserRentalDto> MapToUserRentalDto(RentalEntity rental)
        {
            return new UserRentalDto
            {
                Id = rental.Id,
                TotalPrice = rental.TotalPrice,
                Status = rental.Status.ToString(),
                StartDate = rental.StartDate,
                EndDate = rental.EndDate,
                CreatedAt = rental.CreatedAt,
                ReviewId = rental.ReviewId
            };
        }
        
        private async Task<UserRental> MapToUserRental(RentalEntity rental)
        {
            var dto = await MapToUserRentalDto(rental);

            var response = new UserRental
            {
                Id = dto.Id.ToString(),
                TotalPrice = dto.TotalPrice,
                Status = dto.Status,
                StartDate = dto.StartDate.ToString("O"),
                EndDate = dto.EndDate.ToString("O"),
                CreatedAt = dto.CreatedAt.ToString("O"),
                DiscountPercent = rental.DiscountPercent
            };

            // Add ReviewId if exists
            if (dto.ReviewId.HasValue)
            {
                response.ReviewId = dto.ReviewId.Value.ToString();
            }

            return response;
        }
    }
}