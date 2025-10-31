import { ReviewProto } from '@hacmieu-journey/grpc';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: ReviewProto.REVIEW_PACKAGE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url:
              configService.getOrThrow('REVIEW_GRPC_SERVICE_URL') ||
              'localhost:5010',
            package: ReviewProto.REVIEW_PACKAGE_NAME,
            protoPath: join(__dirname, '../../libs/grpc/proto/review.proto'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [ReviewController],
  providers: [
    ReviewService,
    {
      provide: 'REVIEW_SERVICE',
      useExisting: ReviewService,
    },
  ],
})
export class ReviewModule {}
