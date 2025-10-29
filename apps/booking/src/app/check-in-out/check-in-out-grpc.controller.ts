import {
  CreateCheckInOutRequest,
  GetCheckInOutRequest,
  GetCheckInOutResponse,
  GetManyCheckInOutsRequest,
  GetManyCheckInOutsResponse,
  UpdateCheckOutRequest,
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

  @GrpcMethod('BookingService', 'CheckIn')
  createCheckIn(data: CreateCheckInOutRequest): Promise<GetCheckInOutResponse> {
    return this.checkInOutService.checkIn(data);
  }

  @GrpcMethod('BookingService', 'CheckOut')
  createCheckOut(
    data: CreateCheckInOutRequest
  ): Promise<GetCheckInOutResponse> {
    return this.checkInOutService.checkOut(data);
  }

  @GrpcMethod('BookingService', 'UpdateCheckOut')
  updateCheckOut(data: UpdateCheckOutRequest): Promise<GetCheckInOutResponse> {
    return this.checkInOutService.updateCheckOut(data);
  }

  @GrpcMethod('BookingService', 'VerifyCheckInOut')
  verifyCheckInOut(
    data: VerifyCheckInOutRequest
  ): Promise<GetCheckInOutResponse> {
    return this.checkInOutService.verifyCheckInOut(data);
  }
}
