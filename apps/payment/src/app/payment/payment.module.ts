import { NatsModule } from '@hacmieu-journey/nats';
import { Module } from '@nestjs/common';
import { PaymentConsumer } from './payment.consumer';
import { PaymentRepository } from './payment.repo';
import { PaymentService } from './payment.service';

@Module({
  imports: [NatsModule],
  providers: [PaymentRepository, PaymentService, PaymentConsumer],
})
export class PaymentModule {}
