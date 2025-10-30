import { RentalProto } from '@hacmieu-journey/grpc';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class RentalService implements OnModuleInit {
  private rentalService!: RentalProto.RentalServiceClient;

  constructor(
    @Inject(RentalProto.RENTAL_PACKAGE_NAME) private client: ClientGrpc
  ) {}

  onModuleInit() {
    this.rentalService =
      this.client.getService<RentalProto.RentalServiceClient>(
        RentalProto.RENTAL_SERVICE_NAME
      );
  }

  getMyRentals(
    data: RentalProto.GetMyRentalsRequest
  ): Promise<RentalProto.GetMyRentalsResponse> {
    return lastValueFrom(this.rentalService.getMyRentals(data));
  }

  getRentalById(
    data: RentalProto.GetRentalByIdRequest
  ): Promise<RentalProto.RentalResponse> {
    return lastValueFrom(this.rentalService.getRentalById(data));
  }

  createRental(
    data: RentalProto.CreateRentalRequest
  ): Promise<RentalProto.RentalResponse> {
    return lastValueFrom(this.rentalService.createRental(data));
  }

  cancelRental(
    data: RentalProto.CancelRentalRequest
  ): Promise<RentalProto.CancelRentalResponse> {
    return lastValueFrom(this.rentalService.cancelRental(data));
  }

  getRentalExtensions(
    data: RentalProto.GetRentalExtensionsRequest
  ): Promise<RentalProto.GetRentalExtensionsResponse> {
    return lastValueFrom(this.rentalService.getRentalExtensions(data));
  }

  createRentalExtension(
    data: RentalProto.CreateRentalExtensionRequest
  ): Promise<RentalProto.RentalResponse> {
    return lastValueFrom(this.rentalService.createRentalExtension(data));
  }
}
