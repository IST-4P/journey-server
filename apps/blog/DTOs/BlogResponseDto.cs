using System;

namespace Blog.DTOs
{
    // Response đầy đủ cho GetById - dành cho cả Admin và User
    public class BlogDetailDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Region { get; set; } = string.Empty;
        public string Thumbnail { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string AuthorId { get; set; } = string.Empty;
        public string Tag { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    // Response cho Admin - GetAll/GetMany - CÓ ID, KHÔNG có Content
    public class BlogSummaryAdminDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Region { get; set; } = string.Empty;
        public string Thumbnail { get; set; } = string.Empty;
        public string Tag { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string AuthorId { get; set; } = string.Empty;    
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    // Response cho User - GetAll/GetMany - KHÔNG có ID, KHÔNG có Content
    public class BlogSummaryUserDto
    {
        public string Title { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Region { get; set; } = string.Empty;
        public string Thumbnail { get; set; } = string.Empty;
        public string Tag { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    // Paged result generic
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
