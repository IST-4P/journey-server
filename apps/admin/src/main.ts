/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import {
  GrpcExceptionFilter,
  HttpExceptionFilter,
  init,
} from '@hacmieu-journey/nestjs';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { patchNestJsSwagger } from 'nestjs-zod';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GrpcExceptionFilter(), new HttpExceptionFilter());
  app.enableCors({
    origin: true,
    credentials: true,
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
  await init(app);
}

bootstrap();
