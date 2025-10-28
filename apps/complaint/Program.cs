using ComplaintService.Data;
using ComplaintService.Repository;
using ComplaintService.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

// Load environment variables
DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Configure Kestrel for gRPC
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5009, listenOptions =>
    {
        listenOptions.Protocols = Microsoft.AspNetCore.Server.Kestrel.Core.HttpProtocols.Http2;
    });
});

// Build database connection string by expanding placeholders from environment variables
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

// Add services to the container
builder.Services.AddGrpc();
builder.Services.AddAutoMapper(typeof(Program).Assembly);

// Register DbContext
builder.Services.AddDbContext<ComplaintDbContext>(options =>
    options.UseNpgsql(connectionString));

// Register repositories
builder.Services.AddScoped<IComplaintRepository, ComplaintRepository>();

var app = builder.Build();

// Configure the HTTP request pipeline
var grpcUrl = Environment.GetEnvironmentVariable("COMPLAINT_GRPC_SERVICE_URL") ?? "0.0.0.0:5009";
Console.WriteLine($"Complaint gRPC Service listening on: {grpcUrl}");

app.MapGrpcService<ComplaintGrpcService>();
app.MapGet("/", () => "Complaint gRPC Service running...");

app.Run();
