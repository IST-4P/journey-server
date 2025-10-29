import {
  CreateRefundRequest,
  GetManyRefundsRequest,
  GetManyRefundsResponse,
  GetRefundRequest,
  GetRefundResponse,
  UpdateRefundStatusRequest,
} from '@domain/payment';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { RefundService } from './refund.service';

@Controller()
export class RefundGrpcController {
  constructor(private readonly refundService: RefundService) {}

  @GrpcMethod('PaymentService', 'GetManyRefunds')
  getManyRefunds(data: GetManyRefundsRequest): Promise<GetManyRefundsResponse> {
    return this.refundService.getManyRefunds(data);
  }

  @GrpcMethod('PaymentService', 'GetRefund')
  getRefund(data: GetRefundRequest): Promise<GetRefundResponse> {
    return this.refundService.getRefund(data);
  }

  @GrpcMethod('PaymentService', 'CreateRefund')
  createRefund(data: CreateRefundRequest): Promise<GetRefundResponse> {
    return this.refundService.createRefund(data);
  }

  @GrpcMethod('PaymentService', 'UpdateRefundStatus')
  updateRefundStatus(
    data: UpdateRefundStatusRequest
  ): Promise<GetRefundResponse> {
    return this.refundService.updateRefundStatus(data);
  }
}
