import { NatsModule } from '@hacmieu-journey/nats';
import { Module } from '@nestjs/common';
import { RefundCreatedConsumer } from './consumers';
import { RefundGrpcController } from './refund-grpc.controller';
import { RefundRepository } from './refund.repo';
import { RefundService } from './refund.service';

@Module({
  imports: [NatsModule],
  controllers: [RefundGrpcController],
  providers: [RefundRepository, RefundService, RefundCreatedConsumer],
})
export class RefundModule {}
