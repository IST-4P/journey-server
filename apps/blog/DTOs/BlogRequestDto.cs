using System;
using System.ComponentModel.DataAnnotations;
using Blog.Validators;

namespace Blog.DTOs
{
    public class AddBlogRequestDto
    {
        [Required(ErrorMessage = "Title is required")]
        [StringLength(500, ErrorMessage = "Title cannot exceed 500 characters")]
        public required string Title { get; set; }

        [Required(ErrorMessage = "Type is required")]
        [StringLength(1000, ErrorMessage = "Type cannot exceed 1000 characters")]
        public required string Type { get; set; }

        [Required(ErrorMessage = "Content is required")]
        [HtmlContent(ErrorMessage = "Content must be valid HTML")]
        public required string Content { get; set; }

        [Required(ErrorMessage = "Region is required")]
        [StringLength(100, ErrorMessage = "Region cannot exceed 100 characters")]
        public required string Region { get; set; }

        [Url(ErrorMessage = "Thumbnail must be a valid URL")]
        public required string Thumbnail { get; set; }
    }

    public class UpdateBlogRequestDto
    {
        [StringLength(500, ErrorMessage = "Title cannot exceed 500 characters")]
        public string? Title { get; set; }

        [StringLength(1000, ErrorMessage = "Type cannot exceed 1000 characters")]
        public string? Type { get; set; }

        [HtmlContent(ErrorMessage = "Content must be valid HTML")]
        public string? Content { get; set; }

        [StringLength(100, ErrorMessage = "Region cannot exceed 100 characters")]
        public string? Region { get; set; }

        [Url(ErrorMessage = "Thumbnail must be a valid URL")]
        public string? Thumbnail { get; set; }
    }

    public class BlogFilterDto
    {
        public string? Region { get; set; }
        public string? SearchTerm { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortBy { get; set; } = "CreatedAt"; // Title, CreatedAt, UpdatedAt
        public string? SortDirection { get; set; } = "desc"; // asc, desc
    }
}
