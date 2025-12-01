using Microsoft.EntityFrameworkCore;

namespace rental.Data
{
    public class RentalDbContext : DbContext
    {
        public RentalDbContext(DbContextOptions<RentalDbContext> options) : base(options) { }
        public DbSet<Model.Entities.Rental> Rentals { get; set; }
        public DbSet<Model.Entities.RentalExtension> RentalExtensions { get; set; }
        public DbSet<Model.Entities.RentalHistory> RentalHistories { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Model.Entities.Rental>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();

                entity.Property(e => e.Status)
                .HasConversion<string>();

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


            modelBuilder.Entity<Model.Entities.RentalExtension>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();

            });

            modelBuilder.Entity<Model.Entities.RentalHistory>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                entity.Property(e => e.RentalId).IsRequired();
                entity.Property(e => e.OldStatus).HasConversion<string>(); 
                entity.Property(e => e.NewStatus).HasConversion<string>();
                entity.Property(e => e.ChangedAt).IsRequired();
            });
        }
    }




}
