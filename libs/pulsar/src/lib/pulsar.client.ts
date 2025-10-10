import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Consumer, Message, Producer } from 'pulsar-client';

@Injectable()
export class PulsarClient implements OnModuleDestroy {
  private readonly client = new Client({
    serviceUrl: this.configService.getOrThrow<string>('PULSAR_SERVICE_URL'),
  });
  private readonly producers: Producer[] = [];
  private readonly consumers: Consumer[] = [];

  constructor(private readonly configService: ConfigService) {}

  async createProducer(topic: string) {
    const producer = await this.client.createProducer({
      topic,
    });
    this.producers.push(producer);
    return producer;
  }

  async createConsumer(
    topic: string,
    serviceName: string,
    listener: (message: Message) => void
  ) {
    // 'persistent://journey/events/user-registered' → 'user-registered'
    const topicName = topic.split('/').pop() || 'unknown-topic';

    // Generate subscription name: {service-name}-{topic-name}
    const subscriptionName = `${serviceName}-${topicName}`;

    const consumer = await this.client.subscribe({
      subscriptionType: 'Shared',
      topic,
      subscription: subscriptionName,
      listener,
    });

    this.consumers.push(consumer);
    return consumer;
  }

  async onModuleDestroy() {
    for (const producer of this.producers) {
      await producer.close();
    }
    for (const consumer of this.consumers) {
      await consumer.close();
    }
    await this.client.close();
  }
}
