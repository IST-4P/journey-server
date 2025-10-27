using Microsoft.EntityFrameworkCore;
using ReviewModel = review.Model.Review;
using ReviewType = review.Model.ReviewType;

namespace review.Data
{
    public class ReviewDbContext : DbContext
    {
        public ReviewDbContext(DbContextOptions<ReviewDbContext> options) : base(options) { }

        public DbSet<ReviewModel> Reviews { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ReviewModel>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.Content)
                    .IsRequired()
                    .HasMaxLength(2000);

                entity.Property(e => e.Rating)
                    .IsRequired();

                entity.Property(e => e.UserId)
                    .IsRequired();

                entity.Property(e => e.Type)
                    .IsRequired()
                    .HasConversion<int>();

                // Store images as JSON
                entity.Property(e => e.Images)
                    .HasColumnType("jsonb");

                entity.Property(e => e.CreatedAt)
                    .IsRequired();

                entity.Property(e => e.UpdatedAt)
                    .IsRequired();

                entity.Property(e => e.UpdateCount)
                    .HasDefaultValue(0);

                // Indexes for performance
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.VehicleId);
                entity.HasIndex(e => e.DeviceId);
                entity.HasIndex(e => e.ComboId);
                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.CreatedAt);
            });
        }
    }
}
