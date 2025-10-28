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

                // BookingId and RentalId are nullable - at least one must be provided
                entity.Property(e => e.BookingId)
                    .IsRequired(false);

                entity.Property(e => e.RentalId)
                    .IsRequired(false);

                // Indexes for performance
                entity.HasIndex(e => e.BookingId).IsUnique().HasFilter("\"BookingId\" IS NOT NULL"); // Mỗi booking chỉ có 1 review
                entity.HasIndex(e => e.RentalId).IsUnique().HasFilter("\"RentalId\" IS NOT NULL"); // Mỗi rental chỉ có 1 review
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
