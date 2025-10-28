using System;
using System.ComponentModel.DataAnnotations;
using rental.Model.Entities;

namespace rental.Model.Dto
{
    // Request DTOs for User (Create)
    public class CreateRentalRequestDto
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        public List<RentalItemData> Items { get; set; } = new();

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }
    }

    // Request DTO for Admin (Update)
    public class UpdateRentalRequestDto
    {
        public string? Status { get; set; } // Pending, Approved, Rejected, Completed, Cancelled
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    // Filter/Query DTO
    public class RentalQueryDto
    {
        public Guid? UserId { get; set; }
        public string? Status { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortBy { get; set; } = "CreatedAt";
        public string? SortDirection { get; set; } = "desc";
    }

    // Paged result
    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasNextPage => Page < TotalPages;
        public bool HasPreviousPage => Page > 1;
    }
}
