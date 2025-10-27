using rental.Data;
using rental.Repository;
using rental.Service;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;
using Grpc.Net.Client;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables
DotNetEnv.Env.Load();
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5007, listenOptions =>
    {
        listenOptions.Protocols = Microsoft.AspNetCore.Server.Kestrel.Core.HttpProtocols.Http2;
    });
});


builder.Services.AddGrpc();
builder.Services.AddAutoMapper(typeof(Program));
builder.Services.AddScoped<RentalRepository>();

// Build database connection string by expanding placeholders from environment variables
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? string.Empty;
connectionString = connectionString
    .Replace("${DB_HOST}", Environment.GetEnvironmentVariable("DB_HOST") ?? "localhost")
    .Replace("${DB_PORT}", Environment.GetEnvironmentVariable("DB_PORT") ?? "5432")
    .Replace("${DB_NAME_RENTAL}", Environment.GetEnvironmentVariable("DB_NAME_RENTAL") ?? "journey-rental")
    .Replace("${DB_USERNAME}", Environment.GetEnvironmentVariable("DB_USERNAME") ?? "postgres")
    .Replace("${DB_PASSWORD}", Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "");

// Log DB connection info without leaking secrets
var maskedConnectionString = Regex.Replace(connectionString, "(?i)(Password|Pwd)=[^;]*", "$1=****");
Console.WriteLine($"[RentalService] DB: {maskedConnectionString}");

builder.Services.AddDbContext<RentalDbContext>(options =>
    options.UseNpgsql(connectionString));

// Configure gRPC clients (prefer environment variables, fall back to sensible defaults)
var userServiceUrl = Environment.GetEnvironmentVariable("USER_GRPC_URL") ?? "http://localhost:5002";
var deviceServiceUrl = Environment.GetEnvironmentVariable("DEVICE_GRPC_URL") ?? "http://localhost:5006";

builder.Services.AddGrpcClient<User.UserService.UserServiceClient>(options =>
{
    options.Address = new Uri(userServiceUrl);
});

builder.Services.AddGrpcClient<Device.DeviceService.DeviceServiceClient>(options =>
{
    options.Address = new Uri(deviceServiceUrl);
});


var app = builder.Build();



var grpcUrl = Environment.GetEnvironmentVariable("RENTAL_GRPC_SERVICE_URL") ?? "0.0.0.0:5007";
Console.WriteLine($"Rental gRPC Service listening on: {grpcUrl}");
app.MapGrpcService<RentalGrpcService>();
app.MapGet("/", () => "Rental gRPC Service running...");
app.Run();
