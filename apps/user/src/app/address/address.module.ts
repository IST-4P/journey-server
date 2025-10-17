import { PulsarModule } from '@hacmieu-journey/pulsar';
import { Module } from '@nestjs/common';
import { AddressGrpcController } from './address-grpc.controller';
import { AddressRepository } from './address.repo';
import { AddressService } from './address.service';

@Module({
  imports: [PulsarModule],
  providers: [AddressService, AddressRepository],
  controllers: [AddressGrpcController],
})
export class AddressModule {}
