import { NatsModule } from '@hacmieu-journey/nats';
import { PAYMENT_QUEUE_NAME } from '@hacmieu-journey/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { PaymentGrpcController } from './payment-grpc.controller';
import { PaymentConsumer } from './payment.consumer';
import { PaymentProducer } from './payment.producer';
import { PaymentQueue } from './payment.queue';
import { PaymentRepository } from './payment.repo';
import { PaymentService } from './payment.service';

@Module({
  imports: [
    NatsModule,
    BullModule.registerQueue({
      name: PAYMENT_QUEUE_NAME,
    }),
  ],
  controllers: [PaymentGrpcController],
  providers: [
    PaymentRepository,
    PaymentService,
    PaymentConsumer,
    PaymentProducer,
    PaymentQueue,
  ],
})
export class PaymentModule {}
