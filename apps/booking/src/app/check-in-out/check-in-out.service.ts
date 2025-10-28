import {
  CreateCheckInOutRequest,
  GetCheckInOutRequest,
  GetManyCheckInOutsRequest,
  UpdateCheckOutRequest,
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

  async checkIn(data: CreateCheckInOutRequest) {
    return this.checkInOutRepository.checkIn(data);
  }

  async checkOut(data: CreateCheckInOutRequest) {
    return this.checkInOutRepository.checkOut(data);
  }

  async updateCheckOut(data: UpdateCheckOutRequest) {
    const checkOut = await this.checkInOutRepository.getCheckInOut(data);
    if (!checkOut) {
      throw CheckInOutNotFoundException;
    }
    return this.checkInOutRepository.updateCheckOut(data);
  }

  async verifyCheckInOut(data: VerifyCheckInOutRequest) {
    return this.checkInOutRepository.verifyCheckInOut(data);
  }
}
