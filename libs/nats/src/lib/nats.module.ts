import { Module } from '@nestjs/common';
import { NatsClient } from './nats.client';

@Module({
  controllers: [],
  providers: [NatsClient],
  exports: [NatsClient],
})
export class NatsModule {}
