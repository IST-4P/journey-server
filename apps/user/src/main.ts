/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { UserProto } from '@hacmieu-journey/grpc';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.use(cookieParser());

  const port = app.get(ConfigService).getOrThrow('PORT');
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );

  app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      url: app.get(ConfigService).getOrThrow('USER_GRPC_SERVICE_URL'),
      package: UserProto.USER_PACKAGE_NAME,
      protoPath: join(__dirname, '../../libs/grpc/proto/user.proto'),
    },
  });
  await app.startAllMicroservices();
}

bootstrap();
