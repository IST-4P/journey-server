using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Blog.Validators;

namespace Blog.Models
{
    public class Blog
    {
        [Key]
        public Guid Id { set; get; }

        [Required(ErrorMessage = "Title is required")]
        [StringLength(500, ErrorMessage = "Title cannot exceed 500 characters")]
        public required string Title { get; set; }

        [Required(ErrorMessage = "Content is required")]
        [HtmlContent(ErrorMessage = "Content must be valid HTML")]
        public required string Content { get; set; }

        [Required(ErrorMessage = "Region is required")]
        [StringLength(100, ErrorMessage = "Region cannot exceed 100 characters")]
        public required string Region { get; set; }

        [Url(ErrorMessage = "Thumbnail must be a valid URL")]
        public required string Thumbnail { get; set; }

        public DateTime CreateAt { get; set; }
        public DateTime UpdateAt { get; set; }
    }

    public class BlogDto
    {
        public Guid Id { set; get; }
        public required string Title { get; set; }
        public required string Content { get; set; }
        public required string Region { get; set; }
        public required string Thumbnail { get; set; }
    }

    public class AddBlogRequestDto
    {
        [Required(ErrorMessage = "Title is required")]
        [StringLength(500, ErrorMessage = "Title cannot exceed 500 characters")]
        public required string Title { get; set; }

        [Required(ErrorMessage = "Content is required")]
        [HtmlContent(ErrorMessage = "Content must be valid HTML")]
        public required string Content { get; set; }

        [Required(ErrorMessage = "Region is required")]
        [StringLength(100, ErrorMessage = "Region cannot exceed 100 characters")]
        public required string Region { get; set; }

        [Url(ErrorMessage = "Thumbnail must be a valid URL")]
        public required string Thumbnail { get; set; }
    }

    public class UpdateBlogRequetsDto
    {
        [Required(ErrorMessage = "Title is required")]
        [StringLength(500, ErrorMessage = "Title cannot exceed 500 characters")]
        public required string Title { get; set; }

        [Required(ErrorMessage = "Content is required")]
        [HtmlContent(ErrorMessage = "Content must be valid HTML")]
        public required string Content { get; set; }

        [Required(ErrorMessage = "Region is required")]
        [StringLength(100, ErrorMessage = "Region cannot exceed 100 characters")]
        public required string Region { get; set; }

        [Url(ErrorMessage = "Thumbnail must be a valid URL")]
        public required string Thumbnail { get; set; }
    }

    public class BlogFilterDto
    {
        public string? Region { get; set; }
        public string? SearchTerm { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortBy { get; set; } = "CreateAt"; // Title, CreateAt, UpdateAt
        public string? SortDirection { get; set; } = "desc"; // asc, desc
    }

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

    public class BlogListResponse
    {
        public List<BlogDto> Blogs { get; set; } = new();
        public int Page { get; set; }
        public int Limit { get; set; }
        public int TotalItems { get; set; }
        public int TotalPages { get; set; }
    }

    public class ApiResponse
    {
        public string Message { get; set; } = string.Empty;
    }

    public class ApiErrorResponse
    {
        public string Message { get; set; } = string.Empty;
        public int StatusCode { get; set; }
    }

}