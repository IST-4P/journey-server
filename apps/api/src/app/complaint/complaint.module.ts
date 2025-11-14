import { ChatProto } from '@hacmieu-journey/grpc';
import { NatsModule } from '@hacmieu-journey/nats';
import { WebSocketModule } from '@hacmieu-journey/websocket';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ComplaintController } from './complaint.controller';
import { ComplaintGateway } from './complaint.gateway';
import { ComplaintService } from './complaint.service';

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
    ]),
  ],
  controllers: [ComplaintController],
  providers: [
    ComplaintService,
    ComplaintGateway,
    {
      provide: 'CHAT_SERVICE',
      useExisting: ComplaintService,
    },
  ],
})
export class ComplaintModule {}
