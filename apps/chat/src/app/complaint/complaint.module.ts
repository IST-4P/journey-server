import { Module } from '@nestjs/common';
import { ComplaintGrpcController } from './complaint-grpc.controller';
import { ComplaintRepository } from './complaint.repo';
import { ComplaintService } from './complaint.service';

@Module({
  controllers: [ComplaintGrpcController],
  providers: [ComplaintService, ComplaintRepository],
})
export class ComplaintModule {}
