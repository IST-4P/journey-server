import { Module } from '@nestjs/common';
import { ChatGrpcController } from './chat-grpc.controller';
import { ChatRepository } from './chat.repo';
import { ChatService } from './chat.service';

@Module({
  controllers: [ChatGrpcController],
  providers: [ChatService, ChatRepository],
})
export class ChatModule {}
