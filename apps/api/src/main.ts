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
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { patchNestJsSwagger } from 'nestjs-zod';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GrpcExceptionFilter(), new HttpExceptionFilter());
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5500',
      'http://127.0.0.1:5500',
      'https://journey.hacmieu.xyz',
      /^https?:\/\/.*\.hacmieu\.xyz$/, // Allow all subdomains
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  });
  patchNestJsSwagger();
  const config = new DocumentBuilder()
    .setTitle('API example')
    .setDescription('The API description')
    .setVersion('1.0')
    .addCookieAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const websocketAdapter = new WebsocketAdapter(app);
  await websocketAdapter.connectToRedis();
  app.useWebSocketAdapter(websocketAdapter);

  await init(app);
}

bootstrap();
