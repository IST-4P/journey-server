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
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GrpcExceptionFilter(), new HttpExceptionFilter());
  app.enableCors({
    origin: true,
    credentials: true,
  });
  await init(app);
}

bootstrap();
