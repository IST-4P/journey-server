/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { ChatProto } from '@hacmieu-journey/grpc';
import { init } from '@hacmieu-journey/nestjs';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await init(app);

  app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      url: app.get(ConfigService).getOrThrow('CHAT_GRPC_SERVICE_URL'),
      package: ChatProto.CHAT_PACKAGE_NAME,
      protoPath: join(__dirname, '../../libs/grpc/proto/chat.proto'),
    },
  });
  await app.startAllMicroservices();
}

bootstrap();
