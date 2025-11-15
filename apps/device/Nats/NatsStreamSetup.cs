using NATS.Client.Core;
using NATS.Client.JetStream;
using NATS.Client.JetStream.Models;

namespace device.Nats
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

                // Create JOURNEY_EVENTS stream with device subjects
                var streamConfig = new StreamConfig(
                    name: "JOURNEY_EVENTS",
                subjects: new[] {
                    "journey.events.device.created",
                    "journey.events.device.updated",
                    "journey.events.device.deleted",
                    "journey.events.device.rented",
                    "journey.events.device.reserved",
                    "journey.events.device.active",
                    "journey.events.payment-extension",
                    "journey.events.rental-quantity-change",
                    "journey.events.debug.device",
                    "journey.events.debug.rental",
                    "journey.events.debug.review" }
                )
                {
                    Storage = StreamConfigStorage.File,
                    Retention = StreamConfigRetention.Limits,
                    MaxAge = TimeSpan.FromDays(30)
                };

                try
                {
                    await js.CreateStreamAsync(streamConfig);
                    _logger.LogInformation("[Device] JOURNEY_EVENTS stream created successfully");
                }
                catch (NatsJSApiException ex) when (ex.Error.Code == 400)
                {
                    await js.UpdateStreamAsync(streamConfig);
                    _logger.LogInformation("[Device] JOURNEY_EVENTS stream updated successfully");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[Device] Failed to setup NATS streams");
                throw;
            }
        }
    }
}
