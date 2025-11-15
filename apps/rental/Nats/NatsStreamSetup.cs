using NATS.Client.Core;
using NATS.Client.JetStream;
using NATS.Client.JetStream.Models;

namespace rental.Nats
{
    public class NatsStreamSetup
    {
        private readonly NatsConnection _natsConnection;
        private readonly ILogger<NatsStreamSetup> _logger;

        public NatsStreamSetup(NatsConnection natsConnection, ILogger<NatsStreamSetup> logger)
        {
            _natsConnection = natsConnection;
            _logger = logger;
        }

        public async Task SetupStreamsAsync()
        {
            try
            {
                var js = new NatsJSContext(_natsConnection);

                // Create JOURNEY_EVENTS stream with rental subjects
                var streamConfig = new StreamConfig(
                    name: "JOURNEY_EVENTS",
                    subjects: new[] {
                    "journey.events.rental.created",
                    "journey.events.rental.updated",
                    "journey.events.rental.received",
                    "journey.events.rental.completed",
                    "journey.events.rental.cancelled",
                    "journey.events.payment-created",
                    "journey.events.rental-paid" }
                )
                {
                    Storage = StreamConfigStorage.File,
                    Retention = StreamConfigRetention.Workqueue,
                    MaxAge = TimeSpan.FromDays(30)
                };

                try
                {
                    await js.CreateStreamAsync(streamConfig);
                    _logger.LogInformation("[Rental] JOURNEY_EVENTS stream created successfully");
                }
                catch (NatsJSApiException ex) when (ex.Error.Code == 400)
                {
                    await js.UpdateStreamAsync(streamConfig);
                    _logger.LogInformation("[Rental] JOURNEY_EVENTS stream updated successfully");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[Rental] Failed to setup NATS streams");
                throw;
            }
        }
    }
}
