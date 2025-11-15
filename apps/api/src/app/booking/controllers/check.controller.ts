import {
  CreateCheckInOutRequestDTO,
  GetCheckInOutRequestDTO,
  GetManyCheckInOutsRequestDTO,
} from '@domain/booking';
import { ActiveUser } from '@hacmieu-journey/nestjs';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { BookingService } from '../booking.service';

@Controller('check')
export class CheckInOutController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  getManyCheckInOuts(
    @Query() query: Omit<GetManyCheckInOutsRequestDTO, 'userId'>,
    @ActiveUser('userId') userId: string
  ) {
    return this.bookingService.getManyCheckInOuts({ ...query, userId });
  }

  @Get(':id')
  getCheckInOut(
    @Param() params: Omit<GetCheckInOutRequestDTO, 'userId'>,
    @ActiveUser('userId') userId: string
  ) {
    return this.bookingService.getCheckInOut({ ...params, userId });
  }

  @Post('check-in')
  checkIn(
    @Body() body: Omit<CreateCheckInOutRequestDTO, 'userId'>,
    @ActiveUser('userId') userId: string
  ) {
    return this.bookingService.checkIn({
      ...body,
      checkDate: String(new Date()),
      userId,
    });
  }

  @Post('check-out')
  checkOut(
    @Body() body: Omit<CreateCheckInOutRequestDTO, 'userId'>,
    @ActiveUser('userId') userId: string
  ) {
    return this.bookingService.checkOut({
      ...body,
      checkDate: String(new Date()),
      userId,
    });
  }
}
