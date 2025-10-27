import {
  CreateHistoryRequest,
  GetHistoryRequest,
  GetHistoryResponse,
  GetManyHistoriesRequest,
  GetManyHistoriesResponse,
} from '@domain/booking';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { HistoryService } from './history.service';

@Controller()
export class HistoryGrpcController {
  constructor(private readonly historyService: HistoryService) {}

  @GrpcMethod('BookingService', 'GetManyHistories')
  getManyHistories(
    data: GetManyHistoriesRequest
  ): Promise<GetManyHistoriesResponse> {
    return this.historyService.getManyHistories(data);
  }

  @GrpcMethod('BookingService', 'GetHistory')
  getHistory(data: GetHistoryRequest): Promise<GetHistoryResponse> {
    return this.historyService.getHistory(data);
  }

  @GrpcMethod('BookingService', 'CreateHistory')
  createHistory(data: CreateHistoryRequest): Promise<GetHistoryResponse> {
    return this.historyService.createHistory(data);
  }
}
