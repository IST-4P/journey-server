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

                // Create RENTAL stream
                var rentalStreamConfig = new StreamConfig(
                    name: "RENTAL",
                    subjects: new[] { "rental.created", "rental.updated", "rental.completed", "rental.cancelled" }
                )
                {
                    Storage = StreamConfigStorage.File,
                    Retention = StreamConfigRetention.Workqueue,
                    MaxAge = TimeSpan.FromDays(30)
                };

                try
                {
                    await js.CreateStreamAsync(rentalStreamConfig);
                    _logger.LogInformation("[Rental] RENTAL stream created successfully");
                }
                catch (NatsJSApiException ex) when (ex.Error.Code == 400)
                {
                    await js.UpdateStreamAsync(rentalStreamConfig);
                    _logger.LogInformation("[Rental] RENTAL stream updated successfully");
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
