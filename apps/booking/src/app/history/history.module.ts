import { Module } from '@nestjs/common';
import { HistoryGrpcController } from './history-grpc.controller';
import { HistoryRepository } from './history.repo';
import { HistoryService } from './history.service';

@Module({
  controllers: [HistoryGrpcController],
  providers: [HistoryService, HistoryRepository],
})
export class HistoryModule {}
