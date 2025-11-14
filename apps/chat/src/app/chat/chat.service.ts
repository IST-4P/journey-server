import {
  CreateChatRequest,
  GetChatsRequest,
  GetManyConversationsRequest,
} from '@domain/chat';
import { Injectable } from '@nestjs/common';
import { ChatRepository } from './chat.repo';

@Injectable()
export class ChatService {
  constructor(private readonly chatRepository: ChatRepository) {}

  async getChats(data: GetChatsRequest) {
    return this.chatRepository.getChats(data);
  }

  createChat(data: CreateChatRequest) {
    return this.chatRepository.createChat(data);
  }

  async getManyConversations(data: GetManyConversationsRequest) {
    return this.chatRepository.getManyConversations(data);
  }
}
