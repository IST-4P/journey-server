import {
  CreatePaymentRequest,
  GetManyPaymentsRequest,
  GetPaymentRequest,
  UpdateStatusPaymentRequest,
  WebhookPaymentRequest,
} from '@domain/payment';
import { Injectable } from '@nestjs/common';
import { PaymentNotFoundException } from './payment.error';
import { PaymentRepository } from './payment.repo';

@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async getManyPayments(data: GetManyPaymentsRequest) {
    const payments = await this.paymentRepository.getManyPayments(data);
    if (payments.payments.length === 0) {
      throw PaymentNotFoundException;
    }
    return payments;
  }

  async getPayment(data: GetPaymentRequest) {
    const payment = await this.paymentRepository.getPayment(data);
    if (!payment) {
      throw PaymentNotFoundException;
    }
    return payment;
  }

  async createPayment(data: CreatePaymentRequest) {
    return this.paymentRepository.createPayment(data);
  }

  async updateStatusPayment(data: UpdateStatusPaymentRequest) {
    const payment = await this.paymentRepository.getPayment({ id: data.id });
    if (!payment) {
      throw PaymentNotFoundException;
    }
    return this.paymentRepository.updatePaymentStatus(data);
  }

  async receiver(data: WebhookPaymentRequest) {
    await this.paymentRepository.receiver(data);
    return {
      message: 'Message.ReceivedSuccessfully',
    };
  }
}
