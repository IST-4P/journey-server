import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscardPolicy, RetentionPolicy, StorageType } from 'nats';
import { NatsClient } from './nats.client';

/**
 * Service để setup các Stream khi application khởi động
 * Chạy đầu tiên trước các consumer
 */
@Injectable()
export class StreamSetupService implements OnModuleInit {
  private readonly logger = new Logger(StreamSetupService.name);

  constructor(private readonly natsClient: NatsClient) {}

  async onModuleInit() {
    this.logger.log('🚀 Setting up NATS streams...');
    await this.setupStreams();
    this.logger.log('✅ All streams setup completed');
  }

  private async setupStreams() {
    // Setup stream cho Journey Events
    await this.natsClient.createOrUpdateStream({
      name: 'JOURNEY_EVENTS',
      subjects: ['journey.events.>'],
      retention: RetentionPolicy.Limits,
      storage: StorageType.File,
      max_age: 7 * 24 * 60 * 60 * 1_000_000_000, // 7 ngày
      max_bytes: 1024 * 1024 * 1024, // 1GB
      max_msgs: 1_000_000,
      discard: DiscardPolicy.Old,
      duplicate_window: 2 * 60 * 1_000_000_000, // 2 phút
    });

    // Thêm các streams khác nếu cần
    // await this.natsClient.createOrUpdateStream({ ... });
  }
}
