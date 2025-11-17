import { ChatProto, UserProto } from '@hacmieu-journey/grpc';
import { NatsModule } from '@hacmieu-journey/nats';
import { WebSocketModule } from '@hacmieu-journey/websocket';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import {
  ChatController,
  ComplaintController,
  ComplaintMessageController,
} from './chat.controller';
import { ChatService } from './chat.service';
import { ChatListGateway } from './websocket';

@Module({
  imports: [
    NatsModule,
    WebSocketModule,
    ClientsModule.registerAsync([
      {
        name: ChatProto.CHAT_PACKAGE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url:
              configService.getOrThrow('CHAT_GRPC_SERVICE_URL') ||
              'localhost:5003',
            package: ChatProto.CHAT_PACKAGE_NAME,
            protoPath: join(__dirname, '../../libs/grpc/proto/chat.proto'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: UserProto.USER_PACKAGE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url:
              configService.getOrThrow('USER_GRPC_SERVICE_URL') ||
              'localhost:5001',
            package: UserProto.USER_PACKAGE_NAME,
            protoPath: join(__dirname, '../../libs/grpc/proto/user.proto'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [
    ChatController,
    ComplaintController,
    ComplaintMessageController,
  ],
  providers: [
    ChatService,
    ChatListGateway,
    {
      provide: 'CHAT_SERVICE',
      useExisting: ChatService,
    },
  ],
})
export class ChatModule {}
