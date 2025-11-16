using NATS.Client.Core;
using NATS.Client.JetStream;
using NATS.Client.JetStream.Models;
using System.Text.Json;

namespace rental.Nats.Base
{
    /// <summary>
    /// Base class for all NATS JetStream consumers
    /// Provides common functionality for consumer setup, message processing, and error handling
    /// </summary>
    public abstract class NatsConsumerBase<TEvent> : BackgroundService where TEvent : class
    {
        protected readonly NatsConnection NatsConnection;
        protected readonly IServiceProvider ServiceProvider;
        protected readonly ILogger Logger;

        protected NatsConsumerBase(
            NatsConnection natsConnection,
            IServiceProvider serviceProvider,
            ILogger logger)
        {
            NatsConnection = natsConnection;
            ServiceProvider = serviceProvider;
            Logger = logger;
        }

        /// <summary>
        /// Consumer name - must be unique per service
        /// </summary>
        protected abstract string ConsumerName { get; }

        /// <summary>
        /// Subject to filter messages
        /// </summary>
        protected abstract string FilterSubject { get; }

        /// <summary>
        /// Stream name - default is JOURNEY_EVENTS
        /// </summary>
        protected virtual string StreamName => "JOURNEY_EVENTS";

        /// <summary>
        /// Maximum delivery attempts before message is considered failed
        /// </summary>
        protected virtual int MaxDeliver => 3;

        /// <summary>
        /// Time to wait for acknowledgment before redelivery
        /// </summary>
        protected virtual TimeSpan AckWait => TimeSpan.FromSeconds(30);

        /// <summary>
        /// Delivery policy - All for workqueue streams
        /// </summary>
        protected virtual ConsumerConfigDeliverPolicy DeliverPolicy => ConsumerConfigDeliverPolicy.All;

        /// <summary>
        /// Handle the received event
        /// </summary>
        protected abstract Task HandleEventAsync(TEvent eventData, CancellationToken cancellationToken);

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            Logger.LogInformation("[Rental] Starting {ConsumerName}...", ConsumerName);

            try
            {
                var js = new NatsJSContext(NatsConnection);

                var consumerConfig = new ConsumerConfig(ConsumerName)
                {
                    DurableName = ConsumerName,
                    AckPolicy = ConsumerConfigAckPolicy.Explicit,
                    DeliverPolicy = DeliverPolicy,
                    FilterSubject = FilterSubject,
                    MaxDeliver = MaxDeliver,
                    AckWait = AckWait
                };

                INatsJSConsumer consumer;
                try
                {
                    consumer = await js.CreateOrUpdateConsumerAsync(StreamName, consumerConfig, stoppingToken);
                    Logger.LogInformation("[Rental] Consumer '{ConsumerName}' created/updated successfully", ConsumerName);
                }
                catch (Exception ex)
                {
                    Logger.LogError(ex, "[Rental] Failed to create consumer '{ConsumerName}'", ConsumerName);
                    return;
                }

                await foreach (var msg in consumer.ConsumeAsync<byte[]>(cancellationToken: stoppingToken))
                {
                    try
                    {
                        var data = msg.Data;
                        if (data == null || data.Length == 0)
                        {
                            await msg.AckAsync(cancellationToken: stoppingToken);
                            continue;
                        }

                        var json = System.Text.Encoding.UTF8.GetString(data);
                        var eventData = JsonSerializer.Deserialize<TEvent>(json, new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true
                        });

                        if (eventData != null)
                        {
                            await HandleEventAsync(eventData, stoppingToken);
                        }

                        await msg.AckAsync(cancellationToken: stoppingToken);
                    }
                    catch (Exception ex)
                    {
                        Logger.LogError(ex, "[Rental] Error processing message in {ConsumerName}", ConsumerName);
                        await msg.NakAsync(delay: TimeSpan.FromSeconds(5), cancellationToken: stoppingToken);
                    }
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "[Rental] {ConsumerName} failed", ConsumerName);
            }
        }
    }
}
