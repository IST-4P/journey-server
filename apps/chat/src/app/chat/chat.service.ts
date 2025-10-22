import { CreateChatRequest, GetChatsRequest } from '@domain/chat';
import { Injectable } from '@nestjs/common';
import { ChatRepository } from './chat.repo';

@Injectable()
export class ChatService {
  constructor(private readonly chatRepository: ChatRepository) {}

  async getChats(data: GetChatsRequest) {
    const chats = await this.chatRepository.getChats(data);
    return { chats };
  }

  createChat(data: CreateChatRequest) {
    return this.chatRepository.createChat(data);
  }
}
