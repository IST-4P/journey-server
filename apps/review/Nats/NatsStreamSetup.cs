using NATS.Client.Core;
using NATS.Client.JetStream;
using NATS.Client.JetStream.Models;

namespace review.Nats
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

                // Create JOURNEY_EVENTS stream with all subjects from all services
                var streamConfig = new StreamConfig(
                    name: "JOURNEY_EVENTS",
                    subjects: new[] {
                        // Review events
                        "journey.events.review.created",
                        "journey.events.review.updated",
                        "journey.events.review.deleted"
                    }
                )
                {
                    Storage = StreamConfigStorage.File,
                    Retention = StreamConfigRetention.Limits,
                    MaxAge = TimeSpan.FromDays(30),
                    MaxMsgs = 1000000,
                    MaxBytes = 1073741824, // 1GB
                    NumReplicas = 2
                };

                try
                {
                    await js.CreateStreamAsync(streamConfig);
                    _logger.LogInformation("[Review] JOURNEY_EVENTS stream created successfully");
                }
                catch (NatsJSApiException ex) when (ex.Error.Code == 400)
                {
                    // Stream already exists, update it
                    await js.UpdateStreamAsync(streamConfig);
                    _logger.LogInformation("[Review] JOURNEY_EVENTS stream updated successfully");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[Review] Failed to setup NATS streams");
                throw;
            }
        }
    }
}
