using Microsoft.EntityFrameworkCore;
using DotNetEnv;
using device.Model.Entities;

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

        public DbSet<Device> Devices { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                Env.Load(); 

                var host = Environment.GetEnvironmentVariable("DB_HOST") ?? "localhost";
                var port = Environment.GetEnvironmentVariable("DB_PORT") ?? "5432";
                var db = Environment.GetEnvironmentVariable("DB_NAME") ?? "DeviceDB";
                var user = Environment.GetEnvironmentVariable("DB_USERNAME") ?? "postgres";
                var pass = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "123456";

                var connectionString =
                    $"Host={host};Port={port};Database={db};Username={user};Password={pass};SSL Mode=Require;Trust Server Certificate=true";

                optionsBuilder.UseNpgsql(connectionString);
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Device>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
            });
        }
    }
}
