import {
  CreateHistoryRequest,
  GetHistoryRequest,
  GetManyHistoriesRequest,
} from '@domain/booking';
import { Injectable } from '@nestjs/common';
import { HistoryNotFoundException } from './history.error';
import { HistoryRepository } from './history.repo';

@Injectable()
export class HistoryService {
  constructor(private readonly historyRepository: HistoryRepository) {}

  async getManyHistories(data: GetManyHistoriesRequest) {
    const histories = await this.historyRepository.getManyHistories(data);
    if (histories.histories.length === 0) {
      throw HistoryNotFoundException;
    }
    return histories;
  }

  async getHistory(data: GetHistoryRequest) {
    const booking = await this.historyRepository.getHistory(data);
    if (!booking) {
      throw HistoryNotFoundException;
    }
    return booking;
  }

  createHistory(data: CreateHistoryRequest) {
    return this.historyRepository.createHistory(data);
  }
}
