using device.Data;
using device.Repository;
using device.Service;
using device.Nats;
using device.Nats.Consumers;
using Microsoft.EntityFrameworkCore;
using device.Interface;
using NATS.Client.Core;

DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5006, listenOptions =>
    {
        listenOptions.Protocols = Microsoft.AspNetCore.Server.Kestrel.Core.HttpProtocols.Http2;
    });
});

// Add NATS
var natsUrl = Environment.GetEnvironmentVariable("NATS_URL") ?? "nats://localhost:4222";
Console.WriteLine($"[DeviceService] Connecting to NATS at: {natsUrl}");

builder.Services.AddSingleton(sp =>
{
    var opts = new NatsOpts { Url = natsUrl };
    return new NatsConnection(opts);
});

builder.Services.AddSingleton<NatsPublisher>();
builder.Services.AddSingleton<NatsStreamSetup>();
builder.Services.AddHostedService<ReviewEventConsumer>();

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

// Setup NATS streams
try
{
    var natsSetup = app.Services.GetRequiredService<NatsStreamSetup>();
    await natsSetup.SetupStreamsAsync();
    Console.WriteLine("[DeviceService] NATS streams setup completed");
}
catch (Exception ex)
{
    Console.WriteLine($"[DeviceService] Failed to setup NATS streams: {ex.Message}");
}

// Configure gRPC endpoint
var grpcUrl = Environment.GetEnvironmentVariable("DEVICE_GRPC_SERVICE_URL") ?? "0.0.0.0:5006";
Console.WriteLine($"Device gRPC Service listening on: {grpcUrl}");

// Map gRPC service
app.MapGrpcService<DeviceGrpcService>();

app.MapGet("/", () => "Device gRPC Service running...");
app.Run();