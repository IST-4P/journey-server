import { NatsClient } from '@hacmieu-journey/nats';
import {
  CANCEL_PAYMENT_JOB_NAME,
  PAYMENT_QUEUE_NAME,
} from '@hacmieu-journey/nestjs';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor(PAYMENT_QUEUE_NAME)
export class PaymentQueue extends WorkerHost {
  constructor(private readonly natsClient: NatsClient) {
    super();
  }
  async process(job: Job<{ paymentId: number }, any, string>): Promise<any> {
    switch (job.name) {
      case CANCEL_PAYMENT_JOB_NAME: {
        const { paymentId } = job.data;
        await this.natsClient.publish('journey.events.booking-expired', {
          id: paymentId,
        });
        return {};
      }
      default: {
        break;
      }
    }
  }
}
