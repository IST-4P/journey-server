using Microsoft.EntityFrameworkCore;
using DotNetEnv;

namespace device.Data
{
    public class DeviceDbContext : DbContext
    {
        public DeviceDbContext(DbContextOptions<DeviceDbContext> options) : base(options)
        {
        }
        public DeviceDbContext()
        {
        }

        public DbSet<device.Model.Entities.Device> Devices { get; set; }
        public DbSet<device.Model.Entities.Category> Categories { get; set; }
        public DbSet<device.Model.Entities.Combo> Combos { get; set; }
        public DbSet<device.Model.Entities.ComboDevice> ComboDevices { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<device.Model.Entities.Device>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
            });
        }
    }
}
