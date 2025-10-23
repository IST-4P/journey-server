import {
  CancelBookingRequestDTO,
  CreateBookingRequestDTO,
  CreateCheckInOutRequestDTO,
  CreateExtensionRequestDTO,
  CreateHistoryRequestDTO,
  GetBookingRequestDTO,
  GetCheckInOutRequestDTO,
  GetExtensionRequestDTO,
  GetHistoryRequestDTO,
  GetManyBookingsRequestDTO,
  GetManyCheckInOutsRequestDTO,
  GetManyExtensionsRequestDTO,
  GetManyHistoriesRequestDTO,
  UpdateStatusExtensionRequestDTO,
  VerifyCheckInOutRequestDTO,
} from '@domain/booking';
import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { BookingService } from './booking.service';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  getManyBookings(@Query() query: GetManyBookingsRequestDTO) {
    return this.bookingService.getManyBookings(query);
  }

  @Get(':id')
  getBooking(@Param() params: GetBookingRequestDTO) {
    return this.bookingService.getBooking(params);
  }

  @Post()
  createBooking(@Body() body: CreateBookingRequestDTO) {
    return this.bookingService.createBooking({
      ...body,
      startTime: body.startTime.toISOString(),
      endTime: body.endTime.toISOString(),
      notes: body.notes || undefined,
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
  createCheckInOut(@Body() body: CreateCheckInOutRequestDTO) {
    return this.bookingService.createCheckInOut({
      ...body,
      address: body.address || undefined,
      damageNotes: body.damageNotes || undefined,
    });
  }

  @Put('verify/:id')
  verifyCheckInOut(
    @Body() body: Omit<VerifyCheckInOutRequestDTO, 'id'>,
    @Param('id') id: string
  ) {
    return this.bookingService.verifyCheckInOut({
      id,
      verified: body.verified,
      verifiedAt: body.verifiedAt?.toISOString() || '',
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

  @Put('status/:id')
  updateStatusExtension(
    @Body() body: UpdateStatusExtensionRequestDTO,
    @Param('id') id: string
  ) {
    return this.bookingService.updateStatusExtension({
      id,
      status: body.status,
      rejectionReason: body.rejectionReason || undefined,
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

  @Post()
  createHistory(@Body() body: CreateHistoryRequestDTO) {
    return this.bookingService.createHistory({
      ...body,
      notes: body.notes || undefined,
    });
  }
}
