import {
  DeleteRentalRequestDTO,
  GetAllRentalsRequestDTO,
  GetRentalByIdRequestDTO,
  GetRentalExtensionsRequestDTO,
  ApproveExtensionRequestDTO,
  RejectExtensionRequestDTO,
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
    @Query() query: Omit<GetAllRentalsRequestDTO, 'requesterId'>,
    @ActiveUser('userId') requesterId: string
  ) {
    return this.rentalService.getAllRentals({
      ...query,
      requesterId,
    });
  }

  @Get(':rentalId')
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

  @Delete(':rentalId')
  deleteRental(@Param() params: DeleteRentalRequestDTO) {
    return this.rentalService.deleteRental(params);
  }
}

@Controller('rental-extension')
export class ExtensionController {
  // private readonly logger = new Logger(ExtensionController.name);

  constructor(private readonly rentalService: RentalService) {}

   @Get()
    getManyExtensions(
      @Query() query: Omit<GetRentalExtensionsRequestDTO, 'requesterId'>,
      @ActiveUser('userId') requesterId: string
    ) {
      return this.rentalService.getAllRentalExtensions({
        ...query,
        requesterId,
        page: 0,
        limit: 0
      });
    }


  @Get(':rentalId')
  getRentalExtensions(@Param() params: GetRentalExtensionsRequestDTO) {
    return this.rentalService.getRentalExtensions(params);
  }

  @Put('/approve/:extensionId')
  approveExtension(
    @Param('extensionId') extensionId: string,
    @Body() body: Omit<ApproveExtensionRequestDTO, 'extensionId'>
  ) {
    return this.rentalService.updateExtensionStatus({
      extensionId,
      status: 'APPROVED',
    });
  }

  @Put('/reject/:extensionId')
  rejectExtension(
    @Param('extensionId') extensionId: string,
    @Body() body: Omit<RejectExtensionRequestDTO, 'extensionId'>
  ) {
    return this.rentalService.updateExtensionStatus({
      extensionId,
      status: 'REJECTED',
      adminNotes: body.rejectionReason,
    });
  }
}
