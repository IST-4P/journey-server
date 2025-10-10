/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { init } from '@hacmieu-journey/nestjs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await init(app);
}

bootstrap();
