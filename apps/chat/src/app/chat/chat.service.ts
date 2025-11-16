import {
  CreateChatRequest,
  GetChatsRequest,
  GetManyConversationsRequest,
} from '@domain/chat';
import { Injectable } from '@nestjs/common';
import {
  ChatsNotFoundException,
  ConversationsNotFoundException,
} from './chat.error';
import { ChatRepository } from './chat.repo';

@Injectable()
export class ChatService {
  constructor(private readonly chatRepository: ChatRepository) {}

  async getChats(data: GetChatsRequest) {
    const chats = await this.chatRepository.getChats(data);
    if (chats.chats.length === 0) {
      throw ChatsNotFoundException;
    }
    return chats;
  }

  createChat(data: CreateChatRequest) {
    return this.chatRepository.createChat(data);
  }

  async getManyConversations(data: GetManyConversationsRequest) {
    const conversations = await this.chatRepository.getManyConversations(data);
    if (conversations.conversations.length === 0) {
      throw ConversationsNotFoundException;
    }
    return conversations;
  }
}
