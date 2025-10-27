import {
  CancelBookingRequestDTO,
  CreateBookingRequestDTO,
  CreateCheckInOutRequestDTO,
  CreateExtensionRequestDTO,
  GetBookingRequestDTO,
  GetCheckInOutRequestDTO,
  GetExtensionRequestDTO,
  GetHistoryRequestDTO,
  GetManyBookingsRequestDTO,
  GetManyCheckInOutsRequestDTO,
  GetManyExtensionsRequestDTO,
  GetManyHistoriesRequestDTO,
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
  getBooking(@Param() params: GetBookingRequestDTO) {
    return this.bookingService.getBooking(params);
  }

  @Post()
  createBooking(
    @Body() body: CreateBookingRequestDTO,
    @ActiveUser('userId') id: string
  ) {
    body.userId = id;
    return this.bookingService.createBooking({
      ...body,
      startTime: body.startTime.toISOString(),
      endTime: body.endTime.toISOString(),
    });
  }

  @Put('cancel/:id')
  cancelBooking(
    @Body() body: CancelBookingRequestDTO,
    @Param('id') id: string
  ) {
    return this.bookingService.cancelBooking({
      id,
      cancelReason: body.cancelReason || '',
    });
  }
}

@Controller('check-in-out')
export class CheckInOutController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  getManyCheckInOuts(@Query() query: GetManyCheckInOutsRequestDTO) {
    return this.bookingService.getManyCheckInOuts(query);
  }

  @Get(':id')
  getCheckInOut(@Param() params: GetCheckInOutRequestDTO) {
    return this.bookingService.getCheckInOut(params);
  }

  @Post()
  checkIn(
    @Body() body: CreateCheckInOutRequestDTO,
    @ActiveUser('userId') userId: string
  ) {
    return this.bookingService.checkIn({
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
  getManyExtensions(@Query() query: GetManyExtensionsRequestDTO) {
    return this.bookingService.getManyExtensions(query);
  }

  @Get(':id')
  getExtension(@Param() params: GetExtensionRequestDTO) {
    return this.bookingService.getExtension(params);
  }

  @Post()
  createExtension(@Body() body: CreateExtensionRequestDTO) {
    return this.bookingService.createExtension({
      ...body,
      originalEndTime: body.originalEndTime.toISOString(),
      newEndTime: body.newEndTime.toISOString(),
      notes: body.notes || undefined,
    });
  }
}

@Controller('history')
export class HistoryController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  getManyHistories(@Query() query: GetManyHistoriesRequestDTO) {
    return this.bookingService.getManyHistories(query);
  }

  @Get(':id')
  getHistory(@Param() params: GetHistoryRequestDTO) {
    return this.bookingService.getHistory(params);
  }
}
