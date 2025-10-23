import { Module } from '@nestjs/common';
import { NatsClient } from './nats.client';
import { StreamSetupService } from './stream-setup.service';

@Module({
  controllers: [],
  providers: [NatsClient, StreamSetupService],
  exports: [NatsClient],
})
export class NatsModule {}
