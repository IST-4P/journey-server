import {
  CreateCheckInOutRequest,
  GetCheckInOutRequest,
  GetManyCheckInOutsRequest,
  VerifyCheckInOutRequest,
} from '@domain/booking';
import { Injectable } from '@nestjs/common';
import { CheckInOutNotFoundException } from './check-in-out.error';
import { CheckInOutRepository } from './check-in-out.repo';

@Injectable()
export class CheckInOutService {
  constructor(private readonly checkInOutRepository: CheckInOutRepository) {}

  async getManyCheckInOuts(data: GetManyCheckInOutsRequest) {
    const checkInOuts = await this.checkInOutRepository.getManyCheckInOuts(
      data
    );
    if (checkInOuts.checkInOuts.length === 0) {
      throw CheckInOutNotFoundException;
    }
    return checkInOuts;
  }

  async getCheckInOut(data: GetCheckInOutRequest) {
    const checkInOut = await this.checkInOutRepository.getCheckInOut(data);
    if (!checkInOut) {
      throw CheckInOutNotFoundException;
    }
    return checkInOut;
  }

  createCheckInOut(data: CreateCheckInOutRequest) {
    return this.checkInOutRepository.createCheckInOut(data);
  }

  verifyCheckInOut(data: VerifyCheckInOutRequest) {
    return this.checkInOutRepository.verifyCheckInOut(data);
  }
}
