import { Module } from '@nestjs/common';
import { BookingGrpcController } from './booking-grpc.controller';
import { BookingRepository } from './booking.repo';
import { BookingService } from './booking.service';

@Module({
  controllers: [BookingGrpcController],
  providers: [BookingService, BookingRepository],
})
export class BookingModule {}
