import {
  CancelBookingRequestDTO,
  CreateBookingRequestDTO,
  GetBookingRequestDTO,
  GetManyBookingsRequestDTO,
} from '@domain/booking';
import { ActiveUser } from '@hacmieu-journey/nestjs';
import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { BookingService } from '../booking.service';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  getManyBookings(
    @Query() query: GetManyBookingsRequestDTO,
    @ActiveUser('userId') userId: string
  ) {
    return this.bookingService.getManyBookings({ ...query, userId });
  }

  @Get(':id')
  getBooking(
    @Param() params: Omit<GetBookingRequestDTO, 'userId'>,
    @ActiveUser('userId') userId: string
  ) {
    return this.bookingService.getBooking({ ...params, userId });
  }

  @Post()
  createBooking(
    @Body()
    body: Omit<
      CreateBookingRequestDTO,
      'vehicleName' | 'vehicleFeeDay' | 'vehicleFeeHour' | 'userId'
    >,
    @ActiveUser('userId') userId: string
  ) {
    return this.bookingService.createBooking({
      ...body,
      startTime: String(body.startTime),
      endTime: String(body.endTime),
      userId,
      vehicleFeeHour: 0,
      vehicleFeeDay: 0,
      vehicleName: '',
    });
  }

  @Put('cancel')
  cancelBooking(
    @Body() body: Omit<CancelBookingRequestDTO, 'userId'>,
    @ActiveUser('userId') userId: string
  ) {
    return this.bookingService.cancelBooking({
      ...body,
      userId,
    });
  }
}
