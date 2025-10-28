using Microsoft.EntityFrameworkCore;
using ComplaintService.Model;

namespace ComplaintService.Data
{
    public class ComplaintDbContext : DbContext
    {
        public ComplaintDbContext(DbContextOptions<ComplaintDbContext> options)
            : base(options)
        {
        }

        public DbSet<Complaint> Complaints { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Complaint>(entity =>
            {
                entity.ToTable("complaints");

                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id)
                    .HasColumnName("id")
                    .IsRequired();

                entity.Property(e => e.UserId)
                    .HasColumnName("user_id")
                    .IsRequired();

                entity.Property(e => e.RentalId)
                    .HasColumnName("rental_id")
                    .IsRequired();

                entity.Property(e => e.DeviceId)
                    .HasColumnName("device_id");

                entity.Property(e => e.VehicleId)
                    .HasColumnName("vehicle_id");

                entity.Property(e => e.ComboId)
                    .HasColumnName("combo_id");

                entity.Property(e => e.Type)
                    .HasColumnName("type")
                    .HasConversion<int>()
                    .IsRequired();

                entity.Property(e => e.Title)
                    .HasColumnName("title")
                    .HasMaxLength(255)
                    .IsRequired();

                entity.Property(e => e.Content)
                    .HasColumnName("content")
                    .IsRequired();

                entity.Property(e => e.EvidenceImages)
                    .HasColumnName("evidence_images")
                    .HasColumnType("jsonb");

                entity.Property(e => e.Status)
                    .HasColumnName("status")
                    .HasConversion<int>()
                    .IsRequired();

                entity.Property(e => e.AdminResponse)
                    .HasColumnName("admin_response");

                entity.Property(e => e.AdminId)
                    .HasColumnName("admin_id");

                entity.Property(e => e.CreatedAt)
                    .HasColumnName("created_at")
                    .IsRequired();

                entity.Property(e => e.UpdatedAt)
                    .HasColumnName("updated_at")
                    .IsRequired();

                entity.Property(e => e.ResolvedAt)
                    .HasColumnName("resolved_at");

                // Indexes
                entity.HasIndex(e => e.UserId)
                    .HasDatabaseName("idx_complaints_user_id");

                entity.HasIndex(e => e.RentalId)
                    .HasDatabaseName("idx_complaints_rental_id");

                entity.HasIndex(e => e.Status)
                    .HasDatabaseName("idx_complaints_status");

                entity.HasIndex(e => e.CreatedAt)
                    .HasDatabaseName("idx_complaints_created_at");
            });
        }
    }
}