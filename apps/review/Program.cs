using Microsoft.EntityFrameworkCore;
using review.Data;
using review.Interface;
using review.Repository;
using review.Services;
using DotNetEnv;
using System.Text.RegularExpressions;

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

// Add DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? string.Empty;
connectionString = connectionString
    .Replace("${DB_HOST}", Environment.GetEnvironmentVariable("DB_HOST") ?? "localhost")
    .Replace("${DB_PORT}", Environment.GetEnvironmentVariable("DB_PORT") ?? "5432")
    .Replace("${DB_NAME_COMPLAINT}", Environment.GetEnvironmentVariable("DB_NAME_COMPLAINT") ?? "journey-complaint")
    .Replace("${DB_USERNAME}", Environment.GetEnvironmentVariable("DB_USERNAME") ?? "postgres")
    .Replace("${DB_PASSWORD}", Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "");

// Log DB connection info without leaking secrets
var maskedConnectionString = Regex.Replace(connectionString, "(?i)(Password|Pwd)=[^;]*", "$1=****");
Console.WriteLine($"[ComplaintService] DB: {maskedConnectionString}");


builder.Services.AddDbContext<ReviewDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddScoped<IReviewRepository, ReviewRepository>();

builder.Services.AddScoped<IReviewService, ReviewService>();

var deviceServiceUrl = Environment.GetEnvironmentVariable("DEVICE_GRPC_URL") ?? "http://localhost:5006";

builder.Services.AddGrpcClient<Device.DeviceService.DeviceServiceClient>(options =>
{
    options.Address = new Uri(deviceServiceUrl);
});


builder.Logging.ClearProviders();
builder.Logging.AddConsole();

var app = builder.Build();

var grpcUrl = Environment.GetEnvironmentVariable("REVIEW_GRPC_SERVICE_URL") ?? "0.0.0.0:5010";
app.MapGrpcService<ReviewGrpcService>();
app.MapGet("/", () => "Review gRPC Service running...");

app.Run();
