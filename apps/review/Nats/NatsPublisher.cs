using NATS.Client.Core;
using NATS.Client.JetStream;
using NATS.Client.JetStream.Models;
using System.Text.Json;

namespace review.Nats
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

                _logger.LogInformation($"Published message to {subject}: {json}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to publish message to {subject}");
                throw;
            }
        }
    }
}
