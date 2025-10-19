import { BlogProto } from '@hacmieu-journey/grpc';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
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
    ]),
  ],
  controllers: [BlogController],
  providers: [
    BlogService,
    {
      provide: 'BLOG_SERVICE',
      useExisting: BlogService,
    },
  ],
})
export class BlogModule {}
