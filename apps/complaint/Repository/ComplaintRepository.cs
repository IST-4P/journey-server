using ComplaintService.Data;
using ComplaintService.Model;
using Microsoft.EntityFrameworkCore;

namespace ComplaintService.Repository
{
    public class ComplaintRepository : IComplaintRepository
    {
        private readonly ComplaintDbContext _context;

        public ComplaintRepository(ComplaintDbContext context)
        {
            _context = context;
        }

        public async Task<ComplaintService.Model.Complaint> CreateAsync(ComplaintService.Model.Complaint complaint)
        {
            complaint.CreatedAt = DateTime.UtcNow;
            complaint.UpdatedAt = DateTime.UtcNow;

            await _context.Complaints.AddAsync(complaint);
            await _context.SaveChangesAsync();

            return complaint;
        }

        public async Task<ComplaintService.Model.Complaint?> GetByIdAsync(Guid id)
        {
            return await _context.Complaints
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<List<ComplaintService.Model.Complaint>> GetByUserIdAsync(Guid userId, int page = 1, int pageSize = 20)
        {
            return await _context.Complaints
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<List<ComplaintService.Model.Complaint>> GetByRentalIdAsync(Guid rentalId)
        {
            return await _context.Complaints
                .Where(c => c.RentalId == rentalId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<(List<ComplaintService.Model.Complaint> complaints, int totalCount)> GetAllAsync(
            ComplaintStatus? status = null,
            ComplaintType? type = null,
            int page = 1,
            int pageSize = 20)
        {
            var query = _context.Complaints.AsQueryable();

            if (status.HasValue && status.Value != ComplaintStatus.Unspecified)
            {
                query = query.Where(c => c.Status == status.Value);
            }

            if (type.HasValue && type.Value != ComplaintType.Unspecified)
            {
                query = query.Where(c => c.Type == type.Value);
            }

            var totalCount = await query.CountAsync();

            var complaints = await query
                .OrderByDescending(c => c.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (complaints, totalCount);
        }

        public async Task<ComplaintService.Model.Complaint> UpdateAsync(ComplaintService.Model.Complaint complaint)
        {
            complaint.UpdatedAt = DateTime.UtcNow;

            _context.Complaints.Update(complaint);
            await _context.SaveChangesAsync();

            return complaint;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var complaint = await GetByIdAsync(id);
            if (complaint == null)
            {
                return false;
            }

            _context.Complaints.Remove(complaint);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<int> GetTotalCountAsync(ComplaintStatus? status = null, ComplaintType? type = null)
        {
            var query = _context.Complaints.AsQueryable();

            if (status.HasValue && status.Value != ComplaintStatus.Unspecified)
            {
                query = query.Where(c => c.Status == status.Value);
            }

            if (type.HasValue && type.Value != ComplaintType.Unspecified)
            {
                query = query.Where(c => c.Type == type.Value);
            }

            return await query.CountAsync();
        }
    }
}
