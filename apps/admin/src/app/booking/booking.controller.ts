import {
  GetBookingRequestDTO,
  GetCheckInOutRequestDTO,
  GetExtensionRequestDTO,
  GetHistoryRequestDTO,
  GetManyBookingsRequestDTO,
  GetManyCheckInOutsRequestDTO,
  GetManyExtensionsRequestDTO,
  GetManyHistoriesRequestDTO,
  UpdateCheckOutRequestDTO,
  UpdateExtensionRequestDTO,
  VerifyCheckInOutRequestDTO,
} from '@domain/booking';
import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
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
}

@Controller('check')
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

  @Put('checkout/:id')
  updateCheckOut(
    @Body() body: UpdateCheckOutRequestDTO,
    @Param('id') id: string
  ) {
    return this.bookingService.updateCheckOut({
      ...body,
      id,
    });
  }

  @Put('verify/:id')
  verifyCheckInOut(@Param() params: VerifyCheckInOutRequestDTO) {
    return this.bookingService.verifyCheckInOut({
      id: params.id,
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

  @Put('approve/:id')
  approveExtension(@Param() params: UpdateExtensionRequestDTO) {
    return this.bookingService.approveExtension(params);
  }

  @Put('reject/:id')
  rejectExtension(@Param() params: UpdateExtensionRequestDTO) {
    return this.bookingService.rejectExtension(params);
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
