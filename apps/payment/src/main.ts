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

  // app.connectMicroservice<GrpcOptions>({
  //   transport: Transport.GRPC,
  //   options: {
  //     url: app.get(ConfigService).getOrThrow('BOOKING_GRPC_SERVICE_URL'),
  //     package: BookingProto.BOOKING_PACKAGE_NAME,
  //     protoPath: join(__dirname, '../../libs/grpc/proto/booking.proto'),
  //   },
  // });
  // await app.startAllMicroservices();
}

bootstrap();
