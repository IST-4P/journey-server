import { Injectable } from '@nestjs/common';
import { CreateChatRequestType, GetChatsRequestType } from './chat.model';
import { ChatRepository } from './chat.repo';

@Injectable()
export class ChatService {
  constructor(private readonly chatRepository: ChatRepository) {}

  async getChats(data: GetChatsRequestType) {
    const chats = await this.chatRepository.getChats(data);
    return { chats };
  }

  createChat(data: CreateChatRequestType) {
    return this.chatRepository.createChat(data);
  }
}
