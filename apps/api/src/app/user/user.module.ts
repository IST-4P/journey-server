import { UserProto } from '@hacmieu-journey/grpc';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { UserController } from './user.controller';
import { UserService } from './user.service';

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
    ]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: 'USER_SERVICE',
      useExisting: UserService,
    },
  ],
})
export class UserModule {}
