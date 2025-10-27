import { NatsModule } from '@hacmieu-journey/nats';
import { Module } from '@nestjs/common';
import { CheckInOutGrpcController } from './check-in-out-grpc.controller';
import { CheckInOutRepository } from './check-in-out.repo';
import { CheckInOutService } from './check-in-out.service';

@Module({
  imports: [NatsModule],
  controllers: [CheckInOutGrpcController],
  providers: [CheckInOutService, CheckInOutRepository],
})
export class CheckInOutModule {}
