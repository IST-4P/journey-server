import {
  GetHistoryRequestDTO,
  GetManyHistoriesRequestDTO,
} from '@domain/booking';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { BookingService } from '../booking.service';

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
