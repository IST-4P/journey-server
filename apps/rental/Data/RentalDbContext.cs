using Microsoft.EntityFrameworkCore;
using RentalEntity = rental.Model.Entities.Rental;

namespace rental.Data
{
    public class RentalDbContext : DbContext
    {
        public RentalDbContext(DbContextOptions<RentalDbContext> options) : base(options) { }
        public DbSet<RentalEntity> Rentals { get; set; }
    }
}
