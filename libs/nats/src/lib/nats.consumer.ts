import { Logger, OnModuleInit } from '@nestjs/common';
import { NatsClient } from './nats.client';

export abstract class NatsConsumer<T> implements OnModuleInit {
  protected readonly logger = new Logger(this.subject);

  constructor(
    private readonly natsClient: NatsClient,
    private readonly subject: string
  ) {}

  async onModuleInit() {
    await this.natsClient.subscribe<T>(this.subject, this.listener.bind(this));
  }

  private async listener(data: T) {
    try {
      await this.onMessage(data);
    } catch (error) {
      this.logger.error(error);
    }
  }

  protected abstract onMessage(message: T): Promise<void>;
}
