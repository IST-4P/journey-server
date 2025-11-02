using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Blog.Validators;
using Blog.DTOs;

namespace Blog.Models
{
    public class Blog
    {
        [Key]
        public Guid Id { set; get; }

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

        [FileExtensions(Extensions = "jpg,jpeg,png", ErrorMessage = "Thumbnail must be a valid image file (jpg, jpeg, png)")]
        public required string Thumbnail { get; set; }

        [Required(ErrorMessage = "Tag is required")]
        [StringLength(100, ErrorMessage = "Tag cannot exceed 100 characters")]
        public required string Tag { get; set; }

        public DateTime CreateAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdateAt { get; set; } = DateTime.UtcNow;

        // Removed invalid self-conversion operator
    }
}