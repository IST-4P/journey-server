import { Module } from '@nestjs/common';
import { AddressGrpcController } from './address-grpc.controller';
import { AddressRepository } from './address.repo';
import { AddressService } from './address.service';

@Module({
  imports: [],
  providers: [AddressService, AddressRepository],
  controllers: [AddressGrpcController],
})
export class AddressModule {}
