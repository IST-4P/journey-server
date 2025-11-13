import {
  CreateRefundRequest,
  GetManyRefundsRequest,
  GetRefundRequest,
  UpdateRefundStatusRequest,
} from '@domain/payment';
import { Injectable } from '@nestjs/common';
import { GetRefundAdminRequest } from 'libs/grpc/src/lib/types/proto/payment';
import { RefundNotFoundException } from './refund.error';
import { RefundRepository } from './refund.repo';

@Injectable()
export class RefundService {
  constructor(private readonly refundRepository: RefundRepository) {}

  async getManyRefunds(data: GetManyRefundsRequest) {
    const refunds = await this.refundRepository.getManyRefunds(data);
    if (refunds.refunds.length === 0) {
      throw RefundNotFoundException;
    }
    return refunds;
  }

  async getRefund(data: GetRefundRequest) {
    const refund = await this.refundRepository.getRefund(data);
    if (!refund) {
      throw RefundNotFoundException;
    }
    return refund;
  }

  async getRefundAdmin(data: GetRefundAdminRequest) {
    const refund = await this.refundRepository.getRefundAdmin(data);
    if (!refund) {
      throw RefundNotFoundException;
    }
    return refund;
  }

  async createRefund(data: CreateRefundRequest) {
    return this.refundRepository.createRefund(data);
  }

  async updateRefundStatus(data: UpdateRefundStatusRequest) {
    const refund = await this.refundRepository.getRefund({ id: data.id });
    if (!refund) {
      throw RefundNotFoundException;
    }
    return this.refundRepository.updateRefundStatus(data);
  }
}
