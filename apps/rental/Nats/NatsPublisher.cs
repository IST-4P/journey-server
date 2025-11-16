using NATS.Client.Core;
using NATS.Client.JetStream;
using System.Text.Json;

namespace rental.Nats
{
    public class NatsPublisher
    {
        private readonly NatsConnection _natsConnection;
        private readonly INatsJSContext _jetStreamContext;
        private readonly ILogger<NatsPublisher> _logger;

        public NatsPublisher(NatsConnection natsConnection, ILogger<NatsPublisher> logger)
        {
            _natsConnection = natsConnection;
            _jetStreamContext = new NatsJSContext(_natsConnection);
            _logger = logger;
        }

        public async Task PublishAsync<T>(string subject, T data) where T : class
        {
            try
            {
                var json = JsonSerializer.Serialize(data);
                var bytes = System.Text.Encoding.UTF8.GetBytes(json);

                await _jetStreamContext.PublishAsync(subject, bytes);

                _logger.LogInformation($"[Rental] Published message to {subject}: {json}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"[Rental] Failed to publish message to {subject}");
                throw;
            }
        }
    }
}
