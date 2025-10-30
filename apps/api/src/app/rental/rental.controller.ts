import {
  CancelRentalRequestDTO,
  CreateRentalExtensionRequestDTO,
  CreateRentalRequestDTO,
  GetMyRentalsRequestDTO,
  GetRentalByIdRequestDTO,
  GetRentalExtensionsRequestDTO,
} from '@domain/rental';
import { ActiveUser } from '@hacmieu-journey/nestjs';
import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { RentalService } from './rental.service';

@Controller('rental')
export class RentalController {
  // private readonly logger = new Logger(RentalController.name);

  constructor(private readonly rentalService: RentalService) {}

  @Get()
  getManyRentals(
    @Query() query: GetMyRentalsRequestDTO,
    @ActiveUser('userId') userId: string
  ) {
    return this.rentalService.getMyRentals({
      ...query,
      userId,
    });
  }

  @Get(':id')
  getRentalById(@Param() query: GetRentalByIdRequestDTO) {
    return this.rentalService.getRentalById(query);
  }

  @Post()
  createRental(
    @Body() body: CreateRentalRequestDTO,
    @ActiveUser('userId') userId: string
  ) {
    return this.rentalService.createRental({
      ...body,
      userId,
    });
  }

  @Put('cancel/:id')
  cancelRental(
    @Param() params: CancelRentalRequestDTO,
    @ActiveUser('userId') userId: string
  ) {
    return this.rentalService.cancelRental({ ...params, userId });
  }
}

@Controller('extension')
export class ExtensionController {
  // private readonly logger = new Logger(ExtensionController.name);

  constructor(private readonly rentalService: RentalService) {}

  @Get(':id')
  getRentalExtensions(@Param() params: GetRentalExtensionsRequestDTO) {
    return this.rentalService.getRentalExtensions(params);
  }

  @Post()
  createRentalExtension(
    @Body() body: CreateRentalExtensionRequestDTO,
    @ActiveUser('userId') userId: string
  ) {
    return this.rentalService.createRentalExtension({
      ...body,
      requestedBy: userId,
    });
  }
}
