import {
  CancelBookingRequestDTO,
  CreateBookingRequestDTO,
  CreateCheckInOutRequestDTO,
  CreateExtensionRequestDTO,
  GetBookingRequestDTO,
  GetCheckInOutRequestDTO,
  GetExtensionRequestDTO,
  GetManyBookingsRequestDTO,
  GetManyCheckInOutsRequestDTO,
  GetManyExtensionsRequestDTO,
} from '@domain/booking';
import { ActiveUser } from '@hacmieu-journey/nestjs';
import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { BookingService } from './booking.service';

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
    @Param() params: GetBookingRequestDTO,
    @ActiveUser('userId') userId: string
  ) {
    return this.bookingService.getBooking({ ...params, userId });
  }

  @Post()
  createBooking(
    @Body() body: Omit<CreateBookingRequestDTO, 'userId'>,
    @ActiveUser('userId') userId: string
  ) {
    return this.bookingService.createBooking({
      ...body,
      startTime: body.startTime.toISOString(),
      endTime: body.endTime.toISOString(),
      userId,
    });
  }

  @Put('cancel/:id')
  cancelBooking(
    @Body() body: Omit<CancelBookingRequestDTO, 'id' | 'userId'>,
    @Param('id') id: string,
    @ActiveUser('userId') userId: string
  ) {
    return this.bookingService.cancelBooking({
      id,
      cancelReason: body.cancelReason || '',
      userId,
    });
  }
}

@Controller('check')
export class CheckInOutController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  getManyCheckInOuts(
    @Query() query: GetManyCheckInOutsRequestDTO,
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
      checkDate: body.checkDate.toISOString(),
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
      checkDate: body.checkDate.toISOString(),
      userId,
    });
  }
}

@Controller('extension')
export class ExtensionController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  getManyExtensions(
    @Query() query: GetManyExtensionsRequestDTO,
    @ActiveUser('userId') userId: string
  ) {
    return this.bookingService.getManyExtensions({
      ...query,
      requestedBy: userId,
    });
  }

  @Get(':id')
  getExtension(
    @Param() params: GetExtensionRequestDTO,
    @ActiveUser('userId') userId: string
  ) {
    return this.bookingService.getExtension({ ...params, requestedBy: userId });
  }

  @Post()
  createExtension(
    @Body() body: CreateExtensionRequestDTO,
    @ActiveUser('userId') userId: string
  ) {
    return this.bookingService.createExtension({
      ...body,
      originalEndTime: body.originalEndTime.toISOString(),
      newEndTime: body.newEndTime.toISOString(),
      notes: body.notes || undefined,
      requestedBy: userId,
    });
  }
}
