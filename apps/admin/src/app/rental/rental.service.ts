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

  getRentalById(
    data: RentalProto.GetRentalByIdRequest
  ): Promise<RentalProto.RentalResponse> {
    return lastValueFrom(this.rentalService.getRentalById(data));
  }

  getAllRentals(
    data: RentalProto.GetAllRentalsRequest
  ): Promise<RentalProto.GetAllRentalsAdminResponse> {
    return lastValueFrom(this.rentalService.getAllRentals(data));
  }

  updateRental(
    data: RentalProto.UpdateRentalRequest
  ): Promise<RentalProto.RentalResponse> {
    return lastValueFrom(this.rentalService.updateRental(data));
  }

  deleteRental(
    data: RentalProto.DeleteRentalRequest
  ): Promise<RentalProto.DeleteRentalResponse> {
    return lastValueFrom(this.rentalService.deleteRental(data));
  }

  getRentalExtensions(
    data: RentalProto.GetRentalExtensionsRequest
  ): Promise<RentalProto.GetRentalExtensionsResponse> {
    return lastValueFrom(this.rentalService.getRentalExtensions(data));
  }
}
