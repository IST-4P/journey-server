using rental.Data;
using rental.Repository;
using rental.Service;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddGrpc();
builder.Services.AddAutoMapper(typeof(Program));
builder.Services.AddScoped<RentalRepository>();

builder.Services.AddDbContext<RentalDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();
app.MapGrpcService<RentalGrpcService>();
app.MapGet("/", () => "Rental gRPC Service running...");
app.Run();
