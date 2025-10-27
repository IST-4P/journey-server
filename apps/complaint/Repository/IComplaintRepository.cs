using ComplaintService.Model;

namespace ComplaintService.Repository
{
    public interface IComplaintRepository
    {
        Task<Complaint> CreateAsync(Complaint complaint);
        Task<Complaint?> GetByIdAsync(Guid id);
        Task<List<Complaint>> GetByUserIdAsync(Guid userId, int page = 1, int pageSize = 20);
        Task<List<Complaint>> GetByRentalIdAsync(Guid rentalId);
        Task<(List<Complaint> complaints, int totalCount)> GetAllAsync(
            ComplaintStatus? status = null,
            ComplaintType? type = null,
            int page = 1,
            int pageSize = 20);
        Task<Complaint> UpdateAsync(Complaint complaint);
        Task<bool> DeleteAsync(Guid id);
        Task<int> GetTotalCountAsync(ComplaintStatus? status = null, ComplaintType? type = null);
    }
}
