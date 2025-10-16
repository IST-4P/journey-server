/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import {
  GrpcExceptionFilter,
  HttpExceptionFilter,
  init,
} from '@hacmieu-journey/nestjs';
import { WebsocketAdapter } from '@hacmieu-journey/websocket';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GrpcExceptionFilter(), new HttpExceptionFilter());

  const websocketAdapter = new WebsocketAdapter(app);
  await websocketAdapter.connectToRedis();
  app.useWebSocketAdapter(websocketAdapter);

  await init(app);
}

bootstrap();
