import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, JSONCodec, NatsConnection } from 'nats';

@Injectable()
export class NatsClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NatsClient.name);
  private connection: NatsConnection | null = null;
  private connectionPromise: Promise<NatsConnection> | null = null;
  private jsonCodec = JSONCodec();

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.ensureConnection();
  }

  private async ensureConnection(): Promise<NatsConnection> {
    if (this.connection) {
      return this.connection;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = (async () => {
      try {
        const servers = this.configService.getOrThrow<string>('NATS_URL');
        this.logger.log(`Connecting to NATS: ${servers}`);

        const conn = await connect({
          servers: servers.split(','),
          maxReconnectAttempts: -1,
          reconnectTimeWait: 1000,
        });

        this.connection = conn;
        this.logger.log('✅ Connected to NATS successfully');
        return conn;
      } catch (error) {
        this.logger.error('❌ Failed to connect to NATS:', error);
        this.connectionPromise = null;
        throw error;
      }
    })();

    return this.connectionPromise;
  }

  async publish<T = any>(subject: string, data: T): Promise<void> {
    const connection = await this.ensureConnection();
    const encoded = this.jsonCodec.encode(data);
    connection.publish(subject, encoded);
  }

  async subscribe<T = any>(
    subject: string,
    callback: (data: T) => Promise<void>
  ): Promise<void> {
    const connection = await this.ensureConnection();
    const sub = connection.subscribe(subject);

    this.logger.log(`📥 Subscribed to subject: ${subject}`);

    (async () => {
      for await (const msg of sub) {
        try {
          const data = this.jsonCodec.decode(msg.data) as T;
          await callback(data);
        } catch (error) {
          this.logger.error(`Error processing message on ${subject}:`, error);
        }
      }
    })();
  }

  async getConnection(): Promise<NatsConnection> {
    return this.ensureConnection();
  }

  async onModuleDestroy() {
    if (this.connection) {
      this.logger.log('Closing NATS connection...');
      await this.connection.drain();
      await this.connection.close();
      this.connection = null;
      this.logger.log('✅ NATS connection closed');
    }
  }
}
