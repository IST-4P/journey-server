import {
  CreateCheckInOutRequest,
  GetCheckInOutRequest,
  GetCheckInOutResponse,
  GetManyCheckInOutsRequest,
  GetManyCheckInOutsResponse,
  VerifyCheckInOutRequest,
} from '@domain/booking';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CheckInOutService } from './check-in-out.service';

@Controller()
export class CheckInOutGrpcController {
  constructor(private readonly checkInOutService: CheckInOutService) {}

  @GrpcMethod('BookingService', 'GetManyCheckInOuts')
  getManyCheckInOuts(
    data: GetManyCheckInOutsRequest
  ): Promise<GetManyCheckInOutsResponse> {
    return this.checkInOutService.getManyCheckInOuts(data);
  }

  @GrpcMethod('BookingService', 'GetCheckInOut')
  getCheckInOut(data: GetCheckInOutRequest): Promise<GetCheckInOutResponse> {
    return this.checkInOutService.getCheckInOut(data);
  }

  @GrpcMethod('BookingService', 'CreateCheckInOut')
  createCheckInOut(
    data: CreateCheckInOutRequest
  ): Promise<GetCheckInOutResponse> {
    return this.checkInOutService.createCheckInOut(data);
  }

  @GrpcMethod('BookingService', 'VerifyCheckInOut')
  verifyCheckInOut(
    data: VerifyCheckInOutRequest
  ): Promise<GetCheckInOutResponse> {
    return this.checkInOutService.verifyCheckInOut(data);
  }
}
