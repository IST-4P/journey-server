using Microsoft.EntityFrameworkCore;
using rental.Model.Entities;

namespace rental.Data
{
    public class RentalDbContext : DbContext
    {
        public RentalDbContext(DbContextOptions<RentalDbContext> options) : base(options) { }
        public DbSet<rental.Model.Entities.Rental> Rentals { get; set; }
        public DbSet<rental.Model.Entities.RentalExtension> RentalExtensions { get; set; }
        public DbSet<rental.Model.Entities.RentalHistory> RentalHistories { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<rental.Model.Entities.Rental>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();

                // Relationship with RentalExtension
                entity.HasOne(e => e.Rentals)
                      .WithMany()
                      .HasForeignKey(e => e.RentalExtensionId)
                      .OnDelete(DeleteBehavior.SetNull);

                // Relationship with RentalHistory
                entity.HasMany(e => e.History)
                      .WithOne(h => h.Rental)
                      .HasForeignKey(h => h.RentalId)
                      .OnDelete(DeleteBehavior.Cascade);
            });


            modelBuilder.Entity<rental.Model.Entities.RentalExtension>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();

            });

            modelBuilder.Entity<rental.Model.Entities.RentalHistory>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                entity.Property(e => e.RentalId).IsRequired();
                entity.Property(e => e.OldStatus).IsRequired();
                entity.Property(e => e.NewStatus).IsRequired();
                entity.Property(e => e.ChangedAt).IsRequired();
            });
        }
    }




}
