using Blog.Data;
using Blog.Repository;
using Blog.Services;
using Microsoft.EntityFrameworkCore;

// Load .env file if exists
DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Đọc connection string từ appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Thay thế các biến môi trường trong connection string
if (!string.IsNullOrEmpty(connectionString))
{
    connectionString = connectionString
        .Replace("${DB_HOST}", Environment.GetEnvironmentVariable("DB_HOST") ?? "localhost")
        .Replace("${DB_PORT}", Environment.GetEnvironmentVariable("DB_PORT") ?? "5432")
        .Replace("${DB_NAME}", Environment.GetEnvironmentVariable("DB_NAME") ?? "journey-blog")
        .Replace("${DB_USERNAME}", Environment.GetEnvironmentVariable("DB_USERNAME") ?? "postgres")
        .Replace("${DB_PASSWORD}", Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "");

    Console.WriteLine($"Database Connection: {connectionString.Split("Password=")[0]}Password=***");
}
else
{
    throw new InvalidOperationException("Connection string not found in configuration");
}

// Add gRPC services
builder.Services.AddGrpc();

// Add DbContext
builder.Services.AddDbContext<BlogDbContext>(options =>
    options.UseNpgsql(connectionString));

// Add AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// Add Repository
builder.Services.AddScoped<IBlogRepository, BlogRepository>();

var app = builder.Build();

// Configure gRPC endpoint
var grpcUrl = Environment.GetEnvironmentVariable("BLOG_GRPC_SERVICE_URL") ?? "0.0.0.0:5005";
Console.WriteLine($"Blog gRPC Service listening on: {grpcUrl}");

// Map gRPC service
app.MapGrpcService<BlogGrpcService>();

// Health check endpoint (optional)
app.MapGet("/health", () => Results.Ok(new { status = "healthy", service = "blog-grpc" }));

app.Run();
