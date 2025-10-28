using AutoMapper;
using ComplaintService.Model;
using ComplaintService.Repository;
using Grpc.Core;

namespace ComplaintService.Services
{
    public class ComplaintGrpcService : ComplaintProto.ComplaintService.ComplaintServiceBase
    {
        private readonly IComplaintRepository _repository;
        private readonly IMapper _mapper;
        private readonly ILogger<ComplaintGrpcService> _logger;

        public ComplaintGrpcService(
            IComplaintRepository repository,
            IMapper mapper,
            ILogger<ComplaintGrpcService> logger)
        {
            _repository = repository;
            _mapper = mapper;
            _logger = logger;
        }

        public override async Task<ComplaintProto.ComplaintResponse> CreateComplaint(
            ComplaintProto.CreateComplaintRequest request,
            ServerCallContext context)
        {
            try
            {
                _logger.LogInformation("Creating complaint for user: {UserId}", request.UserId);

                var createDto = _mapper.Map<CreateComplaintDto>(request);
                var complaint = _mapper.Map<Model.Complaint>(createDto);

                var created = await _repository.CreateAsync(complaint);
                var protoComplaint = _mapper.Map<ComplaintProto.Complaint>(created);

                return new ComplaintProto.ComplaintResponse
                {
                    Success = true,
                    Message = "Complaint created successfully",
                    Complaint = protoComplaint
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating complaint");
                return new ComplaintProto.ComplaintResponse
                {
                    Success = false,
                    Message = $"Error creating complaint: {ex.Message}"
                };
            }
        }

        public override async Task<ComplaintProto.ComplaintResponse> GetComplaintById(
            ComplaintProto.GetComplaintByIdRequest request,
            ServerCallContext context)
        {
            try
            {
                var id = Guid.Parse(request.Id);
                var complaint = await _repository.GetByIdAsync(id);

                if (complaint == null)
                {
                    return new ComplaintProto.ComplaintResponse
                    {
                        Success = false,
                        Message = "Complaint not found"
                    };
                }

                var protoComplaint = _mapper.Map<ComplaintProto.Complaint>(complaint);

                return new ComplaintProto.ComplaintResponse
                {
                    Success = true,
                    Message = "Complaint retrieved successfully",
                    Complaint = protoComplaint
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting complaint by id: {Id}", request.Id);
                return new ComplaintProto.ComplaintResponse
                {
                    Success = false,
                    Message = $"Error retrieving complaint: {ex.Message}"
                };
            }
        }

        public override async Task<ComplaintProto.ComplaintsResponse> GetComplaintsByUser(
            ComplaintProto.GetComplaintsByUserRequest request,
            ServerCallContext context)
        {
            try
            {
                var userId = Guid.Parse(request.UserId);
                var page = request.Page > 0 ? request.Page : 1;
                var pageSize = request.PageSize > 0 ? request.PageSize : 20;

                var complaints = await _repository.GetByUserIdAsync(userId, page, pageSize);
                var protoComplaints = complaints.Select(c => _mapper.Map<ComplaintProto.ComplaintSummary>(c)).ToList();

                var totalCount = await _repository.GetTotalCountAsync();

                return new ComplaintProto.ComplaintsResponse
                {
                    Success = true,
                    Message = "Complaints retrieved successfully",
                    Complaints = { protoComplaints },
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting complaints by user: {UserId}", request.UserId);
                return new ComplaintProto.ComplaintsResponse
                {
                    Success = false,
                    Message = $"Error retrieving complaints: {ex.Message}"
                };
            }
        }

        public override async Task<ComplaintProto.ComplaintsResponse> GetComplaintsByRental(
            ComplaintProto.GetComplaintsByRentalRequest request,
            ServerCallContext context)
        {
            try
            {
                var rentalId = Guid.Parse(request.RentalId);
                var complaints = await _repository.GetByRentalIdAsync(rentalId);
                var protoComplaints = complaints.Select(c => _mapper.Map<ComplaintProto.ComplaintSummary>(c)).ToList();

                return new ComplaintProto.ComplaintsResponse
                {
                    Success = true,
                    Message = "Complaints retrieved successfully",
                    Complaints = { protoComplaints },
                    TotalCount = complaints.Count,
                    Page = 1,
                    PageSize = complaints.Count
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting complaints by rental: {RentalId}", request.RentalId);
                return new ComplaintProto.ComplaintsResponse
                {
                    Success = false,
                    Message = $"Error retrieving complaints: {ex.Message}"
                };
            }
        }

        public override async Task<ComplaintProto.ComplaintsResponse> GetAllComplaints(
            ComplaintProto.GetAllComplaintsRequest request,
            ServerCallContext context)
        {
            try
            {
                var status = request.Status != ComplaintProto.ComplaintStatus.Unspecified
                    ? (ComplaintStatus)request.Status
                    : (ComplaintStatus?)null;

                var type = request.Type != ComplaintProto.ComplaintType.Unspecified
                    ? (ComplaintType)request.Type
                    : (ComplaintType?)null;

                var page = request.Page > 0 ? request.Page : 1;
                var pageSize = request.PageSize > 0 ? request.PageSize : 20;

                var (complaints, totalCount) = await _repository.GetAllAsync(status, type, page, pageSize);

                // Map to ComplaintSummary (không có content)
                var protoComplaints = complaints.Select(c => _mapper.Map<ComplaintProto.ComplaintSummary>(c)).ToList();

                return new ComplaintProto.ComplaintsResponse
                {
                    Success = true,
                    Message = "Complaints retrieved successfully",
                    Complaints = { protoComplaints },
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all complaints");
                return new ComplaintProto.ComplaintsResponse
                {
                    Success = false,
                    Message = $"Error retrieving complaints: {ex.Message}"
                };
            }
        }

        public override async Task<ComplaintProto.ComplaintResponse> UpdateComplaintStatus(
            ComplaintProto.UpdateComplaintStatusRequest request,
            ServerCallContext context)
        {
            try
            {
                var id = Guid.Parse(request.Id);
                var complaint = await _repository.GetByIdAsync(id);

                if (complaint == null)
                {
                    return new ComplaintProto.ComplaintResponse
                    {
                        Success = false,
                        Message = "Complaint not found"
                    };
                }

                // Update status and admin info
                complaint.Status = (ComplaintStatus)request.Status;
                complaint.AdminResponse = request.AdminResponse;

                if (!string.IsNullOrEmpty(request.AdminId))
                {
                    complaint.AdminId = Guid.Parse(request.AdminId);
                }

                if (complaint.Status == ComplaintStatus.Resolved || complaint.Status == ComplaintStatus.Rejected)
                {
                    complaint.ResolvedAt = DateTime.UtcNow;
                }
                var updated = await _repository.UpdateAsync(complaint);
                var protoComplaint = _mapper.Map<ComplaintProto.Complaint>(updated);

                return new ComplaintProto.ComplaintResponse
                {
                    Success = true,
                    Message = "Complaint status updated successfully",
                    Complaint = protoComplaint
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating complaint status: {Id}", request.Id);
                return new ComplaintProto.ComplaintResponse
                {
                    Success = false,
                    Message = $"Error updating complaint: {ex.Message}"
                };
            }
        }

        public override async Task<ComplaintProto.DeleteComplaintResponse> DeleteComplaint(
            ComplaintProto.DeleteComplaintRequest request,
            ServerCallContext context)
        {
            try
            {
                var id = Guid.Parse(request.Id);
                var success = await _repository.DeleteAsync(id);

                return new ComplaintProto.DeleteComplaintResponse
                {
                    Success = success,
                    Message = success ? "Complaint deleted successfully" : "Complaint not found"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting complaint: {Id}", request.Id);
                return new ComplaintProto.DeleteComplaintResponse
                {
                    Success = false,
                    Message = $"Error deleting complaint: {ex.Message}"
                };
            }
        }
    }
}
