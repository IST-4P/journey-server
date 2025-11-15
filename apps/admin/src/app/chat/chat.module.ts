import { ChatProto } from '@hacmieu-journey/grpc';
import { NatsModule } from '@hacmieu-journey/nats';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ChatController, ComplaintController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [
    NatsModule,
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
  controllers: [ChatController, ComplaintController],
  providers: [
    ChatService,
    {
      provide: 'CHAT_SERVICE',
      useExisting: ChatService,
    },
  ],
})
export class ChatModule {}
