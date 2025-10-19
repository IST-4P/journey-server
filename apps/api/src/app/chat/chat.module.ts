import { ChatProto } from '@hacmieu-journey/grpc';
import { PulsarModule } from '@hacmieu-journey/pulsar';
import { WebSocketModule } from '@hacmieu-journey/websocket';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ChatConsumer } from './chat.consumer';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  imports: [
    PulsarModule,
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
    ]),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatConsumer,
    ChatGateway,
    {
      provide: 'CHAT_SERVICE',
      useExisting: ChatService,
    },
  ],
})
export class ChatModule {}
