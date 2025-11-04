import { RentalProto } from '@hacmieu-journey/grpc';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ExtensionController, RentalController } from './rental.controller';
import { RentalService } from './rental.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
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
  controllers: [RentalController, ExtensionController],
  providers: [
    RentalService,
    {
      provide: 'RENTAL_SERVICE',
      useExisting: RentalService,
    },
  ],
})
export class RentalModule {}
