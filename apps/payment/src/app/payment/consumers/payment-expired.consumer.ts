import { PaymentStatusValues } from '@domain/payment';
import { NatsClient, NatsConsumer } from '@hacmieu-journey/nats';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { AckPolicy, DeliverPolicy } from 'nats';
import { PaymentRepository } from '../payment.repo';

interface PaymentExpiredEvent {
  id: string;
}

@Injectable()
export class PaymentExpiredConsumer
  extends NatsConsumer<PaymentExpiredEvent>
  implements OnModuleInit
{
  constructor(
    natsClient: NatsClient,
    private readonly paymentRepository: PaymentRepository
  ) {
    super(natsClient, {
      streamName: 'JOURNEY_EVENTS',
      consumerName: 'payment-service-payment-expired',
      filterSubject: 'journey.events.payment-expired',
      ackPolicy: AckPolicy.Explicit, // Phải ack thủ công
      deliverPolicy: DeliverPolicy.All, // Nhận tất cả message (kể cả cũ)
      maxDeliver: 3, // Retry tối đa 3 lần
      ackWait: 30000, // Timeout 30s
    });
  }

  protected async onMessage(event: PaymentExpiredEvent): Promise<void> {
    console.log('Payment Expired: ', event.id);
    return this.paymentRepository.updatePaymentStatus({
      id: event.id,
      status: PaymentStatusValues.FAILED,
    });
  }
}
