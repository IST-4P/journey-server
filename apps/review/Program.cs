using Microsoft.EntityFrameworkCore;
using review.Data;
using review.Interface;
using review.Repository;
using review.Services;
using review.Nats;
using DotNetEnv;
using System.Text.RegularExpressions;
using NATS.Client.Core;
using Npgsql;

// Load environment variables
Env.Load();

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5010, listenOptions =>
    {
        listenOptions.Protocols = Microsoft.AspNetCore.Server.Kestrel.Core.HttpProtocols.Http2;
    });
});

// Add services to the container
builder.Services.AddGrpc();

// Add AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// Add NATS
var natsUrl = Environment.GetEnvironmentVariable("NATS_URL") ?? "nats://localhost:4222";
Console.WriteLine($"[ReviewService] Connecting to NATS at: {natsUrl}");

builder.Services.AddSingleton(sp =>
{
    var opts = new NatsOpts { Url = natsUrl };
    return new NatsConnection(opts);
});

builder.Services.AddSingleton<NatsPublisher>();
builder.Services.AddSingleton<NatsStreamSetup>();

// gRPC clients
var deviceServiceUrl = Environment.GetEnvironmentVariable("DEVICE_GRPC_SERVICE_URL_NET") ?? "http://localhost:5006";
builder.Services.AddGrpcClient<Device.DeviceService.DeviceServiceClient>(o =>
{
    o.Address = new Uri(deviceServiceUrl);
});
var rentalServiceUrl = Environment.GetEnvironmentVariable("RENTAL_GRPC_SERVICE_URL_NET") ?? "http://localhost:5007";
builder.Services.AddGrpcClient<Rental.RentalService.RentalServiceClient>(o =>
{
    o.Address = new Uri(rentalServiceUrl);
});
var vehicleServiceUrl = Environment.GetEnvironmentVariable("VEHICLE_GRPC_SERVICE_URL_NET") ?? "http://localhost:5008";
builder.Services.AddGrpcClient<Vehicle.VehicleService.VehicleServiceClient>(o =>
{
    o.Address = new Uri(vehicleServiceUrl);
});

var bookingServiceUrl = Environment.GetEnvironmentVariable("BOOKING_GRPC_SERVICE_URL_NET") ?? "http://localhost:5009";
builder.Services.AddGrpcClient<Booking.BookingService.BookingServiceClient>(o =>
{
    o.Address = new Uri(bookingServiceUrl);
});

// Add DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? string.Empty;
connectionString = connectionString
    .Replace("${DB_HOST}", Environment.GetEnvironmentVariable("DB_HOST") ?? "localhost")
    .Replace("${DB_PORT}", Environment.GetEnvironmentVariable("DB_PORT") ?? "5432")
    .Replace("${DB_NAME_REVIEW}", Environment.GetEnvironmentVariable("DB_NAME_REVIEW") ?? "journey-review")
    .Replace("${DB_USERNAME}", Environment.GetEnvironmentVariable("DB_USERNAME") ?? "postgres")
    .Replace("${DB_PASSWORD}", Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "");

// Log DB connection info without leaking secrets
var maskedConnectionString = Regex.Replace(connectionString, "(?i)(Password|Pwd)=[^;]*", "$1=****");
Console.WriteLine($"[ReviewService] DB: {maskedConnectionString}");


builder.Services.AddDbContext<ReviewDbContext>(options =>
{
    var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
    dataSourceBuilder.EnableDynamicJson();
    var dataSource = dataSourceBuilder.Build();

    options.UseNpgsql(dataSource);
});


builder.Services.AddScoped<IReviewRepository, ReviewRepository>();

builder.Services.AddScoped<IReviewService, ReviewService>();

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

var app = builder.Build();

// Setup NATS streams
try
{
    var natsSetup = app.Services.GetRequiredService<NatsStreamSetup>();
    await natsSetup.SetupStreamsAsync();
    Console.WriteLine("[ReviewService] NATS streams setup completed");
}
catch (Exception ex)
{
    Console.WriteLine($"[ReviewService] Failed to setup NATS streams: {ex.Message}");
}

var grpcUrl = Environment.GetEnvironmentVariable("REVIEW_GRPC_SERVICE_URL") ?? "0.0.0.0:5010";
app.MapGrpcService<ReviewGrpcService>();
app.MapGet("/", () => "Review gRPC Service running...");



app.Run();
