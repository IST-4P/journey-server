import {
  CANCEL_PAYMENT_JOB_NAME,
  generateCancelPaymentJobId,
  PAYMENT_QUEUE_NAME,
} from '@hacmieu-journey/nestjs';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class PaymentProducer {
  constructor(@InjectQueue(PAYMENT_QUEUE_NAME) private paymentQueue: Queue) {
    // paymentQueue.getJobs().then((job) => console.log(job))
  }

  async cancelPaymentJob(paymentId: string) {
    console.log('add queue');
    await this.paymentQueue.add(
      CANCEL_PAYMENT_JOB_NAME,
      { paymentId },
      {
        delay: 1000 * 60 * 15, // 15 minutes
        jobId: generateCancelPaymentJobId(paymentId),
        removeOnComplete: true,
        removeOnFail: true,
      }
    );
  }

  removeJob(paymentId: string) {
    console.log('remove queue');
    return this.paymentQueue.remove(generateCancelPaymentJobId(paymentId));
  }
}
