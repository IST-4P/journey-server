using Blog.Models;
using Blog.Data;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Blog.DTOs;



namespace Blog.Repository
{
    public interface IBlogRepository
    {
        Task<List<BlogSummaryAdminDto>> GetBlogsAsync();
        Task<PagedResult<BlogDetailDto>> GetBlogsWithFilterAsync(BlogFilterDto filter);
        Task<BlogDetailDto?> GetBlogByIdAsync(Guid id);
        Task<Blog.Models.Blog> AddBlogAsync(AddBlogRequestDto blog);
        Task<Blog.Models.Blog?> UpdateBlogAsync(Guid id, UpdateBlogRequestDto blog);
        Task<bool> DeleteBlogAsync(Guid id);
    }

    public class BlogRepository : IBlogRepository
    {
        private readonly BlogDbContext _context;

        public BlogRepository(BlogDbContext context)
        {
            _context = context;
        }

        public async Task<List<BlogSummaryAdminDto>> GetBlogsAsync()
        {
            return await _context.Blogs
                .Select(b => new BlogSummaryAdminDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    Type = b.Type,
                    Region = b.Region,
                    Thumbnail = b.Thumbnail,
                    Tag = b.Tag,
                    Summary = b.Summary,
                    AuthorId = b.AuthorId,
                    CreatedAt = b.CreateAt,
                    UpdatedAt = b.UpdateAt
                })
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<PagedResult<BlogDetailDto>> GetBlogsWithFilterAsync(BlogFilterDto filter)
        {
            var query = _context.Blogs.AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(filter.Region))
            {
                query = query.Where(b => b.Region.ToLower().Contains(filter.Region.ToLower()));
            }

            if (!string.IsNullOrEmpty(filter.SearchTerm))
            {
                query = query.Where(b =>
                    b.Title.ToLower().Contains(filter.SearchTerm.ToLower()) ||
                    b.Content.ToLower().Contains(filter.SearchTerm.ToLower()));
            }

            if (filter.FromDate.HasValue)
            {
                query = query.Where(b => b.CreateAt >= filter.FromDate.Value);
            }

            if (filter.ToDate.HasValue)
            {
                query = query.Where(b => b.CreateAt <= filter.ToDate.Value);
            }

            // Apply sorting
            query = filter.SortBy?.ToLower() switch
            {

                "type" => filter.SortDirection?.ToLower() == "asc"
                    ? query.OrderBy(b => b.Type)
                    : query.OrderByDescending(b => b.Type),
                "title" => filter.SortDirection?.ToLower() == "asc"
                    ? query.OrderBy(b => b.Title)
                    : query.OrderByDescending(b => b.Title),
                "updateat" => filter.SortDirection?.ToLower() == "asc"
                    ? query.OrderBy(b => b.UpdateAt)
                    : query.OrderByDescending(b => b.UpdateAt),
                _ => filter.SortDirection?.ToLower() == "asc"
                    ? query.OrderBy(b => b.CreateAt)
                    : query.OrderByDescending(b => b.CreateAt)
            };

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply pagination
            var items = await query
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(b => new BlogDetailDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    Type = b.Type,
                    Content = b.Content,
                    Region = b.Region,
                    Tag = b.Tag,
                    AuthorId = b.AuthorId,
                    Thumbnail = b.Thumbnail,
                    Summary = b.Summary,
                    CreatedAt = b.CreateAt,
                    UpdatedAt = b.UpdateAt
                })
                .ToListAsync();

            return new PagedResult<BlogDetailDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = filter.Page,
                PageSize = filter.PageSize
            };
        }

        public async Task<BlogDetailDto?> GetBlogByIdAsync(Guid id)
        {
            return await _context.Blogs
                .Where(x => x.Id == id)
                .Select(b => new BlogDetailDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    Type = b.Type,
                    Content = b.Content,
                    Region = b.Region,
                    AuthorId = b.AuthorId,
                    Tag = b.Tag,
                    Thumbnail = b.Thumbnail,
                    CreatedAt = b.CreateAt,
                    UpdatedAt = b.UpdateAt,
                    Summary = b.Summary
                })
                .FirstOrDefaultAsync();
        }

        public async Task<Blog.Models.Blog> AddBlogAsync(AddBlogRequestDto blog)
        {
            var newBlog = new Blog.Models.Blog
            {
                Id = Guid.NewGuid(),
                Title = blog.Title,
                Type = blog.Type,
                Content = blog.Content,
                Region = blog.Region,
                Tag = blog.Tag,
                AuthorId = blog.AuthorId,
                Summary = blog.Summary,
                Thumbnail = blog.Thumbnail
            };

            await _context.Blogs.AddAsync(newBlog);
            await _context.SaveChangesAsync();
            return newBlog;
        }

        public async Task<Blog.Models.Blog?> UpdateBlogAsync(Guid id, UpdateBlogRequestDto blog)
        {
            var existingBlog = await _context.Blogs.FirstOrDefaultAsync(x => x.Id == id);
            if (existingBlog == null)
            {
                return null;
            }

            existingBlog.Title = blog.Title ?? existingBlog.Title;
            existingBlog.Type = blog.Type ?? existingBlog.Type;
            existingBlog.Content = blog.Content ?? existingBlog.Content;
            existingBlog.Region = blog.Region ?? existingBlog.Region;
            existingBlog.Thumbnail = blog.Thumbnail ?? existingBlog.Thumbnail;
            existingBlog.Tag = blog.Tag ?? existingBlog.Tag;
            existingBlog.AuthorId = blog.AuthorId ?? existingBlog.AuthorId;
            existingBlog.Summary = blog.Summary ?? existingBlog.Summary;
            existingBlog.UpdateAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return existingBlog;
        }

        public async Task<bool> DeleteBlogAsync(Guid id)
        {
            var existingBlog = await _context.Blogs.FirstOrDefaultAsync(x => x.Id == id);
            if (existingBlog == null)
            {
                return false;
            }

            _context.Blogs.Remove(existingBlog);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}