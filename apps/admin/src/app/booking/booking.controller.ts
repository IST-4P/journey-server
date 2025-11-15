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
  UpdateStatusBookingRequestDTO,
  UpdateStatusExtensionRequestDTO,
  VerifyCheckInOutRequestDTO,
} from '@domain/booking';
import { Auth, AuthType } from '@hacmieu-journey/nestjs';
import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { BookingService } from './booking.service';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  @Auth([AuthType.Admin])
  getManyBookings(@Query() query: GetManyBookingsRequestDTO) {
    return this.bookingService.getManyBookings(query);
  }

  @Get('information')
  @Auth([AuthType.Admin])
  getInformationBooking() {
    return this.bookingService.getInformationBooking();
  }

  @Get(':id')
  @Auth([AuthType.Admin])
  getBooking(@Param() params: Omit<GetBookingRequestDTO, 'userId'>) {
    return this.bookingService.getBooking(params);
  }

  @Put('status')
  @Auth([AuthType.Admin])
  updateStatusBooking(@Body() body: UpdateStatusBookingRequestDTO) {
    return this.bookingService.updateStatusBooking(body);
  }
}

@Controller('check')
export class CheckInOutController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  @Auth([AuthType.Admin])
  getManyCheckInOuts(@Query() query: GetManyCheckInOutsRequestDTO) {
    return this.bookingService.getManyCheckInOuts(query);
  }

  @Get(':id')
  @Auth([AuthType.Admin])
  getCheckInOut(@Param() params: GetCheckInOutRequestDTO) {
    return this.bookingService.getCheckInOut(params);
  }

  @Put('checkout/:id')
  @Auth([AuthType.Admin])
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
  @Auth([AuthType.Admin])
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
  @Auth([AuthType.Admin])
  getManyExtensions(@Query() query: GetManyExtensionsRequestDTO) {
    return this.bookingService.getManyExtensions(query);
  }

  @Get(':id')
  @Auth([AuthType.Admin])
  getExtension(@Param() params: Omit<GetExtensionRequestDTO, 'requestedBy'>) {
    return this.bookingService.getExtension(params);
  }

  @Put('approve')
  @Auth([AuthType.Admin])
  approveExtension(@Body() body: UpdateStatusExtensionRequestDTO) {
    return this.bookingService.approveExtension(body);
  }

  @Put('reject')
  @Auth([AuthType.Admin])
  rejectExtension(@Body() body: UpdateStatusExtensionRequestDTO) {
    return this.bookingService.rejectExtension(body);
  }

  @Put(':id')
  @Auth([AuthType.Admin])
  updateExtension(
    @Body() body: Omit<UpdateExtensionRequestDTO, 'id'>,
    @Param('id') id: string
  ) {
    return this.bookingService.updateExtension({
      ...body,
      newEndTime: body.newEndTime.toISOString(),
      id,
    });
  }
}

@Controller('history')
export class HistoryController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  @Auth([AuthType.Admin])
  getManyHistories(@Query() query: GetManyHistoriesRequestDTO) {
    return this.bookingService.getManyHistories(query);
  }

  @Get(':id')
  @Auth([AuthType.Admin])
  getHistory(@Param() params: GetHistoryRequestDTO) {
    return this.bookingService.getHistory(params);
  }
}
