using Blog.Data;
using Blog.Repository;
using Blog.Services;
using Microsoft.EntityFrameworkCore;

// Load .env file if exists (for local development)
DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Get connection string - prefer environment variable (for Kubernetes), fallback to appsettings.json with env substitution
var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");

if (string.IsNullOrEmpty(connectionString))
{
    // Fallback to appsettings.json with environment variable substitution
    connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

    if (!string.IsNullOrEmpty(connectionString))
    {
        connectionString = connectionString
            .Replace("${DB_HOST}", Environment.GetEnvironmentVariable("DB_HOST") ?? "localhost")
            .Replace("${DB_PORT}", Environment.GetEnvironmentVariable("DB_PORT") ?? "5432")
            .Replace("${DB_NAME}", Environment.GetEnvironmentVariable("DB_NAME") ?? "journey-blog")
            .Replace("${DB_USERNAME}", Environment.GetEnvironmentVariable("DB_USERNAME") ?? "postgres")
            .Replace("${DB_PASSWORD}", Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "");
    }
}

if (string.IsNullOrEmpty(connectionString))
{
    throw new InvalidOperationException("Database connection string not found. Set either ConnectionStrings__DefaultConnection environment variable or configure DefaultConnection in appsettings.json");
}

Console.WriteLine($"Database Connection: {connectionString.Split("Password=")[0]}Password=***");

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
