import {
  BlogProto,
  BookingProto,
  DeviceProto,
  PaymentProto,
  RentalProto,
  UserProto,
  VehicleProto,
} from '@hacmieu-journey/grpc';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: UserProto.USER_PACKAGE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url:
              configService.getOrThrow('USER_GRPC_SERVICE_URL') ||
              'localhost:5001',
            package: UserProto.USER_PACKAGE_NAME,
            protoPath: join(__dirname, '../../libs/grpc/proto/user.proto'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: BookingProto.BOOKING_PACKAGE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url:
              configService.getOrThrow('BOOKING_GRPC_SERVICE_URL') ||
              'localhost:5008',
            package: BookingProto.BOOKING_PACKAGE_NAME,
            protoPath: join(__dirname, '../../libs/grpc/proto/booking.proto'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: VehicleProto.VEHICLE_PACKAGE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url:
              configService.getOrThrow('VEHICLE_GRPC_SERVICE_URL') ||
              'localhost:5004',
            package: VehicleProto.VEHICLE_PACKAGE_NAME,
            protoPath: join(__dirname, '../../libs/grpc/proto/vehicle.proto'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: PaymentProto.PAYMENT_PACKAGE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url:
              configService.getOrThrow('PAYMENT_GRPC_SERVICE_URL') ||
              'localhost:5009',
            package: PaymentProto.PAYMENT_PACKAGE_NAME,
            protoPath: join(__dirname, '../../libs/grpc/proto/payment.proto'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: BlogProto.BLOG_PACKAGE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url:
              configService.getOrThrow('BLOG_GRPC_SERVICE_URL') ||
              'localhost:5005',
            package: BlogProto.BLOG_PACKAGE_NAME,
            protoPath: join(__dirname, '../../libs/grpc/proto/blog.proto'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: DeviceProto.DEVICE_PACKAGE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url:
              configService.getOrThrow('DEVICE_GRPC_SERVICE_URL') ||
              'localhost:5006',
            package: DeviceProto.DEVICE_PACKAGE_NAME,
            protoPath: join(__dirname, '../../libs/grpc/proto/device.proto'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: RentalProto.RENTAL_PACKAGE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url:
              configService.getOrThrow('RENTAL_GRPC_SERVICE_URL') ||
              'localhost:5007',
            package: RentalProto.RENTAL_PACKAGE_NAME,
            protoPath: join(__dirname, '../../libs/grpc/proto/rental.proto'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [SystemController],
  providers: [
    SystemService,
    {
      provide: 'SYSTEM_SERVICE',
      useExisting: SystemService,
    },
  ],
})
export class SystemModule {}
