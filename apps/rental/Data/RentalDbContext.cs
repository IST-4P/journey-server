using Microsoft.EntityFrameworkCore;
using rental.Model.Entities;

namespace rental.Data
{
    public class RentalDbContext : DbContext
    {
        public RentalDbContext(DbContextOptions<RentalDbContext> options) : base(options) { }
        public DbSet<rental.Model.Entities.Rental> Rentals { get; set; }
        public DbSet<rental.Model.Entities.RentalExtension> RentalExtensions { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<rental.Model.Entities.Rental>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();

                // Relationship
                entity.HasOne(e => e.Rentals)
                      .WithMany()
                      .HasForeignKey(e => e.RentalExtensionId)
                      .OnDelete(DeleteBehavior.SetNull);
            });


            modelBuilder.Entity<rental.Model.Entities.RentalExtension>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                
            });
        }
    }




}
