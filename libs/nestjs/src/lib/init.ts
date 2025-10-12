import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { ResponseInterceptor } from './response.interceptor';

export async function init(app: INestApplication) {
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.use(cookieParser());

  // Apply global response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  const port = app.get(ConfigService).getOrThrow('PORT');
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}
