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

                // Create REVIEW stream
                var streamConfig = new StreamConfig(
                    name: "REVIEW",
                    subjects: new[] { "review.created", "review.updated", "review.deleted" }
                )
                {
                    Storage = StreamConfigStorage.File,
                    Retention = StreamConfigRetention.Workqueue,
                    MaxAge = TimeSpan.FromDays(30)
                };

                try
                {
                    await js.CreateStreamAsync(streamConfig);
                    _logger.LogInformation("REVIEW stream created successfully");
                }
                catch (NatsJSApiException ex) when (ex.Error.Code == 400)
                {
                    // Stream already exists, update it
                    await js.UpdateStreamAsync(streamConfig);
                    _logger.LogInformation("REVIEW stream updated successfully");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to setup NATS streams");
                throw;
            }
        }
    }
}
