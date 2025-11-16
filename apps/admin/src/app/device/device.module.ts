import { DeviceProto } from '@hacmieu-journey/grpc';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { CategoryController } from './category.controller';
import { ComboController, DeviceController } from './device.controller';
import { DeviceService } from './device.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
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
    ]),
  ],
  controllers: [DeviceController, ComboController, CategoryController],
  providers: [
    DeviceService,
    {
      provide: 'DEVICE_SERVICE',
      useExisting: DeviceService,
    },
  ],
})
export class DeviceModule {}
