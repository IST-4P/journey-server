import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  connect,
  ConsumerConfig,
  JetStreamClient,
  JetStreamManager,
  JSONCodec,
  NatsConnection,
  StreamConfig,
} from 'nats';

@Injectable()
export class NatsClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NatsClient.name);
  private connection: NatsConnection | null = null;
  private jetstream: JetStreamClient | null = null;
  private jsm: JetStreamManager | null = null;
  private readonly jsonCodec = JSONCodec();
  private initPromise: Promise<void> | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initialize();
  }

  /**
   * Khởi tạo kết nối NATS và JetStream (chỉ chạy 1 lần)
   */
  private async initialize(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        // 1. Kết nối NATS
        const servers = this.configService.getOrThrow<string>('NATS_URL');
        this.logger.log(`Connecting to NATS: ${servers}`);

        this.connection = await connect({
          servers: servers.split(','),
          maxReconnectAttempts: -1,
          reconnectTimeWait: 1000,
        });
        this.logger.log('✅ Connected to NATS');

        // 2. Khởi tạo JetStream
        this.jetstream = this.connection.jetstream();
        this.jsm = await this.connection.jetstreamManager();
        this.logger.log('✅ JetStream initialized');
      } catch (error) {
        this.logger.error('❌ Failed to initialize NATS:', error);
        this.initPromise = null;
        throw error;
      }
    })();

    return this.initPromise;
  }

  /**
   * Đảm bảo NATS đã được khởi tạo
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.connection || !this.jetstream || !this.jsm) {
      await this.initialize();
    }
  }

  /**
   * Tạo hoặc cập nhật Stream
   */
  async createOrUpdateStream(config: Partial<StreamConfig>): Promise<void> {
    await this.ensureInitialized();

    try {
      // Kiểm tra stream đã tồn tại chưa
      await this.jsm!.streams.info(config.name!);
      // Đã tồn tại -> update
      await this.jsm!.streams.update(config.name!, config);
      this.logger.log(`✅ Stream updated: ${config.name}`);
    } catch (error: any) {
      // Chưa tồn tại -> tạo mới
      if (error.api_error?.err_code === 10059) {
        await this.jsm!.streams.add(config);
        this.logger.log(`✅ Stream created: ${config.name}`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Kiểm tra stream có tồn tại không
   */
  async streamExists(streamName: string): Promise<boolean> {
    await this.ensureInitialized();

    try {
      await this.jsm!.streams.info(streamName);
      return true;
    } catch (error: any) {
      if (error.api_error?.err_code === 10059) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Tạo Consumer
   */
  async createConsumer(
    streamName: string,
    config: Partial<ConsumerConfig>
  ): Promise<void> {
    await this.ensureInitialized();

    // Kiểm tra stream tồn tại
    const exists = await this.streamExists(streamName);
    if (!exists) {
      throw new Error(`Stream "${streamName}" not found. Create stream first.`);
    }

    try {
      await this.jsm!.consumers.add(streamName, config);
      this.logger.log(
        `✅ Consumer created: ${
          config.durable_name || config.name
        } on ${streamName}`
      );
    } catch (error: any) {
      // Consumer đã tồn tại -> bỏ qua
      if (error.api_error?.err_code === 10148) {
        this.logger.debug(
          `Consumer ${config.durable_name || config.name} already exists`
        );
        return;
      }
      throw error;
    }
  }

  /**
   * Subscribe vào stream
   */
  async subscribe<T = any>(
    streamName: string,
    consumerConfig: Partial<ConsumerConfig>,
    callback: (data: T) => Promise<void>
  ): Promise<void> {
    await this.ensureInitialized();

    // Kiểm tra stream tồn tại
    const exists = await this.streamExists(streamName);
    if (!exists) {
      throw new Error(`Stream "${streamName}" not found. Create stream first.`);
    }

    const consumerName = consumerConfig.durable_name || consumerConfig.name!;
    const consumer = await this.jetstream!.consumers.get(
      streamName,
      consumerName
    );

    this.logger.log(`📥 Subscribed: ${streamName} -> ${consumerName}`);

    const messages = await consumer.consume();

    // Xử lý messages trong background
    (async () => {
      for await (const msg of messages) {
        try {
          const data = this.jsonCodec.decode(msg.data) as T;
          await callback(data);
          msg.ack();
        } catch (error) {
          this.logger.error(`Error processing message:`, error);
          msg.nak();
        }
      }
    })();
  }

  /**
   * Publish message
   */
  async publish<T = any>(subject: string, data: T): Promise<void> {
    await this.ensureInitialized();

    const encoded = this.jsonCodec.encode(data);
    const ack = await this.jetstream!.publish(subject, encoded);

    this.logger.debug(`📤 Published to ${subject}, seq: ${ack.seq}`);
  }

  async onModuleDestroy() {
    if (this.connection) {
      this.logger.log('Closing NATS connection...');
      await this.connection.drain();
      await this.connection.close();
      this.connection = null;
      this.jetstream = null;
      this.jsm = null;
      this.logger.log('✅ NATS connection closed');
    }
  }
}
