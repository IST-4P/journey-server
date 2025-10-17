using device.Data;
using device.Repository;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using device.Service;
using device.Interface;
using DotNetEnv;
using AuthGrpc;
using device.Configuration;
using device.Grpc.Clients;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Security.Claims;

AppContext.SetSwitch("System.Net.Http.SocketsHttpHandler.Http2UnencryptedSupport", true); // allow h2c if using http

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

            builder.Services.AddAuthentication("Bearer")
                .AddJwtBearer("Bearer", options =>
                {
                    options.Authority = "hacmieu-postgresql-caophi565caophi-d37b.e.aivencloud.com"; // URL Auth Service
                    options.Audience = "journey-device"; // tên service này đăng ký trong Auth
                    options.RequireHttpsMetadata = false;
                });

            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy("AdminOnly", policy => policy.RequireRole("ADMIN"));
                options.AddPolicy("UserOrAdmin", policy => policy.RequireRole("USER", "ADMIN"));
            });

            // Bind options
            builder.Services.Configure<AuthGrpcOptions>(builder.Configuration.GetSection("AuthGrpc"));

            // gRPC Auth client
            builder.Services.AddGrpcClient<Auth.AuthClient>((sp, o) =>
            {
                var cfg = builder.Configuration.GetSection("AuthGrpc").Get<AuthGrpcOptions>()!;
                o.Address = new Uri(cfg.Address);
            });
            builder.Services.AddScoped<IAuthGrpcClient, AuthGrpcClient>();

            var app = builder.Build();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }



            app.UseAuthentication();
            app.UseAuthorization();
            app.UseGrpcAuthentication();
            app.UseHttpsRedirection();
            app.MapControllers();
            app.Run();
        }
    }
}