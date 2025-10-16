using device.Data;
using device.Repository;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using device.Service;
using device.Interface;
using DotNetEnv;

namespace device
{
    public class Program
    {
        public static void Main(string[] args)
        {
            Env.Load();

            var builder = WebApplication.CreateBuilder(args);

            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
                });

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "Device API", Version = "v1" });
            });

            builder.Services.AddDbContext<DeviceDbContext>(options =>
                options.UseNpgsql(connectionString));

            builder.Services.AddAutoMapper(typeof(Program));
            builder.Services.AddScoped<IDeviceRepository, DeviceRepository>();
            builder.Services.AddScoped<IDeviceService, DeviceService>();

            var app = builder.Build();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.MapControllers();
            app.Run();
        }
    }
}