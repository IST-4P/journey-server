import { NatsModule } from '@hacmieu-journey/nats';
import { Module } from '@nestjs/common';
import { BookingGrpcController } from './booking-grpc.controller';
import { BookingRepository } from './booking.repo';
import { BookingService } from './booking.service';
import { BookingPaidConsumer } from './consumers';

@Module({
  imports: [NatsModule],
  controllers: [BookingGrpcController],
  providers: [BookingRepository, BookingService, BookingPaidConsumer],
})
export class BookingModule {}
