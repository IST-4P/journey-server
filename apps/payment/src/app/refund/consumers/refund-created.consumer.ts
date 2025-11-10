import { NatsClient, NatsConsumer } from '@hacmieu-journey/nats';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { AckPolicy, DeliverPolicy } from 'nats';
import { RefundRepository } from '../refund.repo';

interface RefundCreatedEvent {
  id: string;
  bookingId?: string;
  rentalId?: string;
  userId: string;
  penaltyAmount: number;
  damageAmount: number;
  overtimeAmount: number;
  collateral: number;
  deposit: number;
}

@Injectable()
export class RefundCreatedConsumer
  extends NatsConsumer<RefundCreatedEvent>
  implements OnModuleInit
{
  constructor(
    natsClient: NatsClient,
    private readonly refundRepository: RefundRepository
  ) {
    super(natsClient, {
      streamName: 'JOURNEY_EVENTS',
      consumerName: 'payment-service-refund-created',
      filterSubject: 'journey.events.refund-created',
      ackPolicy: AckPolicy.Explicit, // Phải ack thủ công
      deliverPolicy: DeliverPolicy.All, // Nhận tất cả message (kể cả cũ)
      maxDeliver: 3, // Retry tối đa 3 lần
      ackWait: 30000, // Timeout 30s
    });
  }

  protected async onMessage(event: RefundCreatedEvent): Promise<void> {
    const {
      collateral,
      deposit,
      penaltyAmount,
      damageAmount,
      overtimeAmount,
      ...restEvent
    } = event;

    await this.refundRepository.createRefund({
      ...restEvent,
      bookingId: event.bookingId ? event.bookingId : null,
      rentalId: event.rentalId ? event.rentalId : null,
      principal: collateral + deposit,
      amount:
        collateral + deposit - (penaltyAmount + damageAmount + overtimeAmount),
      penaltyAmount,
      damageAmount,
      overtimeAmount,
    });
  }
}
