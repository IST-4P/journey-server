import { Logger, OnModuleInit } from '@nestjs/common';
import { AckPolicy, ConsumerConfig, DeliverPolicy } from 'nats';
import { NatsClient } from './nats.client';

export interface NatsConsumerConfig {
  streamName: string;
  consumerName: string;
  filterSubject?: string;
  ackPolicy?: AckPolicy;
  deliverPolicy?: DeliverPolicy;
  maxDeliver?: number;
  ackWait?: number; // milliseconds
}

export abstract class NatsConsumer<T> implements OnModuleInit {
  protected readonly logger = new Logger(this.config.consumerName);

  constructor(
    private readonly natsClient: NatsClient,
    private readonly config: NatsConsumerConfig
  ) {}

  async onModuleInit() {
    const consumerConfig: Partial<ConsumerConfig> = {
      durable_name: this.config.consumerName,
      ack_policy: this.config.ackPolicy || AckPolicy.Explicit,
      deliver_policy: this.config.deliverPolicy || DeliverPolicy.All,
      filter_subject: this.config.filterSubject,
      max_deliver: this.config.maxDeliver || 5,
      ack_wait: this.config.ackWait
        ? this.config.ackWait * 1_000_000
        : 30_000_000_000,
    };

    try {
      // Tạo consumer (sẽ kiểm tra stream tồn tại bên trong)
      await this.natsClient.createConsumer(
        this.config.streamName,
        consumerConfig
      );

      // Subscribe
      await this.natsClient.subscribe<T>(
        this.config.streamName,
        consumerConfig,
        this.listener.bind(this)
      );

      this.logger.log(`✅ Consumer ${this.config.consumerName} ready`);
    } catch (error) {
      this.logger.error(
        `Failed to setup consumer ${this.config.consumerName}:`,
        error
      );
      throw error;
    }
  }

  private async listener(data: T) {
    try {
      await this.onMessage(data);
    } catch (error) {
      this.logger.error('Error in onMessage:', error);
      throw error; // Throw để trigger NAK
    }
  }

  protected abstract onMessage(message: T): Promise<void>;
}
