using Grpc.Core;
using AutoMapper;
using rental.Repository;
using rental.Model.Dto;
using Rental;
using RentalEntity = rental.Model.Entities.Rental;

namespace rental.Service
{
    public class RentalGrpcService : global::Rental.RentalService.RentalServiceBase
    {
        private readonly RentalRepository _repository;
        private readonly IMapper _mapper;
        private readonly ILogger<RentalGrpcService> _logger;

        public RentalGrpcService(RentalRepository repository, IMapper mapper, ILogger<RentalGrpcService> logger)
        {
            _repository = repository;
            _mapper = mapper;
            _logger = logger;
        }

        // User: Create rental
        public override async Task<RentalResponse> CreateRental(CreateRentalRequest request, ServerCallContext context)
        {
            try
            {
                var createDto = new CreateRentalRequestDto
                {
                    UserId = Guid.Parse(request.UserId),
                    TargetId = Guid.Parse(request.TargetId),
                    IsCombo = request.IsCombo,
                    StartDate = DateTime.Parse(request.StartDate),
                    EndDate = DateTime.Parse(request.EndDate)
                };

                var rental = _mapper.Map<RentalEntity>(createDto);
                rental.Id = Guid.NewGuid();
                rental.Status = "Pending";
                rental.CreatedAt = DateTime.UtcNow;

                var created = await _repository.CreateAsync(rental);

                return new RentalResponse
                {
                    Id = created.Id.ToString(),
                    UserId = created.UserId.ToString(),
                    TargetId = created.TargetId.ToString(),
                    IsCombo = created.IsCombo,
                    Status = created.Status,
                    StartDate = created.StartDate.ToString("O"),
                    EndDate = created.EndDate.ToString("O"),
                    CreatedAt = created.CreatedAt.ToString("O")
                };
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
                    response.Rentals.Add(MapToUserRental(rental));
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

                return new RentalResponse
                {
                    Id = rental.Id.ToString(),
                    UserId = rental.UserId.ToString(),
                    TargetId = rental.TargetId.ToString(),
                    IsCombo = rental.IsCombo,
                    Status = rental.Status,
                    StartDate = rental.StartDate.ToString("O"),
                    EndDate = rental.EndDate.ToString("O"),
                    CreatedAt = rental.CreatedAt.ToString("O")
                };
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
                    response.Rentals.Add(MapToAdminRental(rental));
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
                var updateDto = new UpdateRentalRequestDto
                {
                    Status = string.IsNullOrEmpty(request.Status) ? null : request.Status,
                    StartDate = !string.IsNullOrEmpty(request.StartDate) ? DateTime.Parse(request.StartDate) : null,
                    EndDate = !string.IsNullOrEmpty(request.EndDate) ? DateTime.Parse(request.EndDate) : null
                };

                var rentalId = Guid.Parse(request.RentalId);
                var updated = await _repository.UpdateAsync(rentalId, updateDto);

                if (updated is null)
                {
                    throw new RpcException(new Status(StatusCode.NotFound, "Rental not found"));
                }

                return new RentalResponse
                {
                    Id = updated.Id.ToString(),
                    UserId = updated.UserId.ToString(),
                    TargetId = updated.TargetId.ToString(),
                    IsCombo = updated.IsCombo,
                    Status = updated.Status,
                    StartDate = updated.StartDate.ToString("O"),
                    EndDate = updated.EndDate.ToString("O"),
                    CreatedAt = updated.CreatedAt.ToString("O")
                };
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
                    Message = "Rental deleted successfully"
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
        private UserRental MapToUserRental(RentalEntity rental)
        {
            return new UserRental
            {
                Id = rental.Id.ToString(),
                TargetId = rental.TargetId.ToString(),
                IsCombo = rental.IsCombo,
                Status = rental.Status,
                StartDate = rental.StartDate.ToString("O"),
                EndDate = rental.EndDate.ToString("O"),
                CreatedAt = rental.CreatedAt.ToString("O")
            };
        }

        private AdminRental MapToAdminRental(RentalEntity rental)
        {
            return new AdminRental
            {
                Id = rental.Id.ToString(),
                UserId = rental.UserId.ToString(),
                TargetId = rental.TargetId.ToString(),
                IsCombo = rental.IsCombo,
                Status = rental.Status,
                StartDate = rental.StartDate.ToString("O"),
                EndDate = rental.EndDate.ToString("O"),
                CreatedAt = rental.CreatedAt.ToString("O")
            };
        }
    }
}
