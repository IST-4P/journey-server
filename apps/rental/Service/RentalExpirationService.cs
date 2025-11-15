using Microsoft.EntityFrameworkCore;
using rental.Data;
using rental.Model.Entities;

namespace rental.Service
{
    public class RentalExpirationService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<RentalExpirationService> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(1); // Check every 1 minute
        private readonly TimeSpan _expirationTime = TimeSpan.FromMinutes(15); // Expire after 15 minutes

        public RentalExpirationService(
            IServiceScopeFactory scopeFactory,
            ILogger<RentalExpirationService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("[RentalExpirationService] Starting rental expiration check service");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CheckExpiredRentalsAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[RentalExpirationService] Error checking expired rentals");
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }
        }

        private async Task CheckExpiredRentalsAsync(CancellationToken cancellationToken)
        {
            using var scope = _scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<RentalDbContext>();

            // Find all PENDING rentals that are older than 15 minutes
            var expirationThreshold = DateTime.UtcNow.Subtract(_expirationTime);

            var expiredRentals = await dbContext.Rentals
                .Where(r => r.Status == RentalStatus.PENDING && r.CreatedAt < expirationThreshold)
                .ToListAsync(cancellationToken);

            if (expiredRentals.Any())
            {
                _logger.LogInformation($"[RentalExpirationService] Found {expiredRentals.Count} expired rentals");

                foreach (var rental in expiredRentals)
                {
                    try
                    {
                        // Create history record
                        var history = new RentalHistory
                        {
                            RentalId = rental.Id,
                            OldStatus = rental.Status,
                            NewStatus = RentalStatus.EXPIRED,
                            ChangedAt = DateTime.UtcNow,
                            Notes = "Automatically expired - no payment within 15 minutes"
                        };

                        rental.Status = RentalStatus.EXPIRED;
                        dbContext.RentalHistories.Add(history);

                        _logger.LogInformation(
                            $"[RentalExpirationService] Expired rental {rental.Id} for user {rental.UserId}"
                        );
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"[RentalExpirationService] Error expiring rental {rental.Id}");
                    }
                }

                await dbContext.SaveChangesAsync(cancellationToken);
            }
        }
    }
}
