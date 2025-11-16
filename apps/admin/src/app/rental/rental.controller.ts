import {
  DeleteRentalRequestDTO,
  GetAllRentalsRequestDTO,
  GetRentalByIdRequestDTO,
  GetRentalExtensionsRequestDTO,
  UpdateRentalRequestDTO,
} from '@domain/rental';
import { ActiveUser } from '@hacmieu-journey/nestjs';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { RentalService } from './rental.service';

@Controller('rental')
export class RentalController {
  // private readonly logger = new Logger(RentalController.name);

  constructor(private readonly rentalService: RentalService) {}

  @Get()
  getAllRentals(
    @Query() query: GetAllRentalsRequestDTO,
    @ActiveUser('userId') requesterId: string
  ) {
    return this.rentalService.getAllRentals({
      ...query,
      requesterId,
    });
  }

  @Get(':id')
  getRentalById(@Param() query: GetRentalByIdRequestDTO) {
    return this.rentalService.getRentalById(query);
  }

  @Put(':rentalId')
  updateRental(
    @Param('rentalId') rentalId: string,
    @Body() body: Omit<UpdateRentalRequestDTO, 'rentalId'>
  ) {
    return this.rentalService.updateRental({
      ...body,
      rentalId,
    });
  }

  @Delete(':id')
  deleteRental(@Param() params: DeleteRentalRequestDTO) {
    return this.rentalService.deleteRental(params);
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
}
