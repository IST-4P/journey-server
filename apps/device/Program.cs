using device.Data;
using device.Repository;
using device.Service;
using Microsoft.EntityFrameworkCore;
using device.Interface;

DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5006, listenOptions =>
    {
        listenOptions.Protocols = Microsoft.AspNetCore.Server.Kestrel.Core.HttpProtocols.Http2;
    });
});
// Load connection string
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
connectionString = connectionString
    .Replace("${DB_HOST}", Environment.GetEnvironmentVariable("DB_HOST") ?? "localhost")
    .Replace("${DB_PORT}", Environment.GetEnvironmentVariable("DB_PORT") ?? "5432")
    .Replace("${DB_NAME}", Environment.GetEnvironmentVariable("DB_NAME") ?? "journey-device")
    .Replace("${DB_USERNAME}", Environment.GetEnvironmentVariable("DB_USERNAME") ?? "postgres")
    .Replace("${DB_PASSWORD}", Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "");

Console.WriteLine($"[DeviceService] DB: {connectionString}");

builder.Services.AddGrpc();

builder.Services.AddAutoMapper(typeof(Program));

builder.Services.AddDbContext<DeviceDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddScoped<IDeviceRepository, DeviceRepository>();
builder.Services.AddScoped<IComboRepository, ComboRepository>();

var app = builder.Build();
// Configure gRPC endpoint
var grpcUrl = Environment.GetEnvironmentVariable("DEVICE_GRPC_SERVICE_URL") ?? "0.0.0.0:5006";
Console.WriteLine($"Device gRPC Service listening on: {grpcUrl}");

// Map gRPC service
app.MapGrpcService<DeviceGrpcService>();

app.MapGet("/", () => "Device gRPC Service running...");
app.Run();
