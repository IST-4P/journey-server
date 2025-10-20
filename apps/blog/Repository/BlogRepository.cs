using Blog.Models;
using Blog.Data;
using AutoMapper;
using Microsoft.EntityFrameworkCore;



namespace Blog.Repository
{
    public interface IBlogRepository
    {
        Task<List<Blog.Models.Blog>> GetBlogsAsync();
        Task<PagedResult<Blog.Models.Blog>> GetBlogsWithFilterAsync(BlogFilterDto filter);
        Task<Blog.Models.Blog?> GetBlogByIdAsync(Guid id);
        Task<Blog.Models.Blog> AddBlogAsync(Blog.Models.Blog blog);
        Task<Blog.Models.Blog?> UpdateBlogAsync(Guid id, Blog.Models.Blog blog);
        Task<bool> DeleteBlogAsync(Guid id);
    }

    public class BlogRepository : IBlogRepository
    {
        private readonly BlogDbContext _context;

        public BlogRepository(BlogDbContext context)
        {
            _context = context;
        }

        public async Task<List<Blog.Models.Blog>> GetBlogsAsync()
        {
            return await _context.Blogs
                .OrderByDescending(b => b.CreateAt)
                .ToListAsync();
        }

        public async Task<PagedResult<Blog.Models.Blog>> GetBlogsWithFilterAsync(BlogFilterDto filter)
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
                .ToListAsync();

            return new PagedResult<Blog.Models.Blog>
            {
                Items = items,
                TotalCount = totalCount,
                Page = filter.Page,
                PageSize = filter.PageSize
            };
        }

        public async Task<Blog.Models.Blog?> GetBlogByIdAsync(Guid id)
        {
            return await _context.Blogs.FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<Blog.Models.Blog> AddBlogAsync(Blog.Models.Blog blog)
        {
            blog.Id = Guid.NewGuid();
            blog.CreateAt = DateTime.UtcNow;
            blog.UpdateAt = DateTime.UtcNow;

            await _context.Blogs.AddAsync(blog);
            await _context.SaveChangesAsync();
            return blog;
        }

        public async Task<Blog.Models.Blog?> UpdateBlogAsync(Guid id, Blog.Models.Blog blog)
        {
            var existingBlog = await _context.Blogs.FirstOrDefaultAsync(x => x.Id == id);
            if (existingBlog == null)
            {
                return null;
            }

            existingBlog.Title = blog.Title;
            existingBlog.Type = blog.Type;
            existingBlog.Content = blog.Content;
            existingBlog.Region = blog.Region;
            existingBlog.Thumbnail = blog.Thumbnail;
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