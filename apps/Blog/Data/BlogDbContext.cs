using Blog.Models;
using Microsoft.EntityFrameworkCore;

namespace Blog.Data
{
    public class BlogDbContext : DbContext
    {
        public BlogDbContext(DbContextOptions<BlogDbContext> options) : base(options)
        {
        }

        public DbSet<Blog.Models.Blog> Blogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Blog entity
            modelBuilder.Entity<Blog.Models.Blog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(500);
                entity.Property(e => e.Content).IsRequired(); // Content sẽ chứa HTML
                entity.Property(e => e.Region).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Thumnail).HasMaxLength(1000);

                // Index for better performance
                entity.HasIndex(e => e.Region);
                entity.HasIndex(e => e.CreateAt);
            });
        }
    }
}