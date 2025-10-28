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

                // Create DEVICE stream
                var deviceStreamConfig = new StreamConfig(
                    name: "DEVICE",
                    subjects: new[] { "device.created", "device.updated", "device.deleted" }
                )
                {
                    Storage = StreamConfigStorage.File,
                    Retention = StreamConfigRetention.Workqueue,
                    MaxAge = TimeSpan.FromDays(30)
                };

                try
                {
                    await js.CreateStreamAsync(deviceStreamConfig);
                    _logger.LogInformation("[Device] DEVICE stream created successfully");
                }
                catch (NatsJSApiException ex) when (ex.Error.Code == 400)
                {
                    await js.UpdateStreamAsync(deviceStreamConfig);
                    _logger.LogInformation("[Device] DEVICE stream updated successfully");
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
