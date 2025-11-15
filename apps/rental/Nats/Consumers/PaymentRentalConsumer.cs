using NATS.Client.Core;
using NATS.Client.JetStream;
using NATS.Client.JetStream.Models;
using rental.Nats.Events;
using rental.Repository;
using rental.Model.Entities;
using System.Text.Json;

namespace rental.Nats.Consumers
{
    /// <summary>
    /// Consumer to handle payment confirmation events for rentals
    /// Listens to journey.events.rental-paid subject (from payment service)
    /// Updates rental status when deposit payment is confirmed
    /// </summary>
    public class PaymentRentalConsumer : BackgroundService
    {
        private readonly NatsConnection _natsConnection;
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<PaymentRentalConsumer> _logger;

        public PaymentRentalConsumer(
            NatsConnection natsConnection,
            IServiceProvider serviceProvider,
            ILogger<PaymentRentalConsumer> logger)
        {
            _natsConnection = natsConnection;
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("[Rental] Starting PaymentRentalConsumer...");

            try
            {
                var js = new NatsJSContext(_natsConnection);

                // Create consumer configuration
                var consumerConfig = new ConsumerConfig("rental-service-rental-paid")
                {
                    DurableName = "rental-service-rental-paid",
                    AckPolicy = ConsumerConfigAckPolicy.Explicit,
                    DeliverPolicy = ConsumerConfigDeliverPolicy.All,
                    FilterSubject = "journey.events.rental-paid",
                    MaxDeliver = 3,
                    AckWait = TimeSpan.FromSeconds(30)
                };

                try
                {
                    await js.CreateOrUpdateConsumerAsync("JOURNEY_EVENTS", consumerConfig, stoppingToken);
                    _logger.LogInformation("[Rental] Consumer 'rental-service-rental-paid' created/updated successfully");
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "[Rental] Consumer might already exist or stream not ready");
                }

                // Get consumer and subscribe to messages
                var consumer = await js.GetConsumerAsync("JOURNEY_EVENTS", "rental-service-rental-paid", stoppingToken);

                await foreach (var msg in consumer.ConsumeAsync<string>(cancellationToken: stoppingToken))
                {
                    try
                    {
                        var json = msg.Data;
                        if (string.IsNullOrEmpty(json))
                        {
                            await msg.AckAsync(cancellationToken: stoppingToken);
                            continue;
                        }

                        var paymentEvent = JsonSerializer.Deserialize<RentalCreatedEvent>(json);

                        if (paymentEvent != null && !string.IsNullOrEmpty(paymentEvent.RentalId))
                        {
                            _logger.LogInformation(
                                "[Rental] Received rental-paid event for RentalId: {RentalId}, Amount: {Amount}",
                                paymentEvent.RentalId, paymentEvent.Deposit);

                            await HandlePaymentReceivedAsync(paymentEvent, stoppingToken);
                        }

                        await msg.AckAsync(cancellationToken: stoppingToken);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "[Rental] Error processing rental-paid event");
                        await msg.NakAsync(delay: TimeSpan.FromSeconds(5), cancellationToken: stoppingToken);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[Rental] PaymentRentalConsumer failed");
            }
        }

        private async Task HandlePaymentReceivedAsync(RentalCreatedEvent paymentEvent, CancellationToken cancellationToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var rentalRepository = scope.ServiceProvider.GetRequiredService<RentalRepository>();

            if (!Guid.TryParse(paymentEvent.RentalId, out var rentalId))
            {
                _logger.LogWarning("[Rental] Invalid RentalId: {RentalId}", paymentEvent.RentalId);
                return;
            }

            var rental = await rentalRepository.GetByIdAsync(rentalId);
            if (rental == null)
            {
                _logger.LogWarning("[Rental] Rental not found: {RentalId}", rentalId);
                return;
            }

            // Update rental status based on payment type
            if (rental.Status == RentalStatus.PENDING)
            {
                // Deposit payment received
                _logger.LogInformation(
                    "[Rental] Updating rental {RentalId} status to DEPOSIT_PAID",
                    rentalId);

                await rentalRepository.UpdateAsync(rentalId, new Model.Dto.UpdateRentalRequestDto
                {
                    Status = RentalStatus.DEPOSIT_PAID.ToString()
                });
            }
            else
            {
                _logger.LogInformation(
                    "[Rental] Rental {RentalId} is already in status {Status}, skipping update",
                    rentalId, rental.Status);
            }
        }
    }
}
