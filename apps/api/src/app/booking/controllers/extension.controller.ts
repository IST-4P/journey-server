import {
  CreateExtensionRequestDTO,
  GetExtensionRequestDTO,
  GetManyExtensionsRequestDTO,
} from '@domain/booking';
import { ActiveUser } from '@hacmieu-journey/nestjs';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { BookingService } from '../booking.service';

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
