import {
  CreateAddressRequestDTO,
  CreateBankAccountRequestDTO,
  CreateDriverLicenseRequestDTO,
  DeleteAddressRequestDTO,
  GetAddressRequestDTO,
  GetAllProfilesRequestDTO,
  UpdateAddressRequestDTO,
  UpdateBankAccountRequestDTO,
  UpdateDriverLicenseRequestDTO,
  UpdateProfileRequestDTO,
} from '@domain/user';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  // private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Get('profiles')
  findAllProfiles(@Query() query: GetAllProfilesRequestDTO) {
    return this.userService.findAllProfiles(query);
  }

  @Get('profiles/:userId')
  getProfile(@Param('userId') userId: string) {
    return this.userService.getProfile({ userId });
  }

  @Put('profiles/:userId')
  updateProfile(
    @Param('userId') userId: string,
    @Body() body: UpdateProfileRequestDTO
  ) {
    return this.userService.updateProfile({
      ...body,
      userId,
    });
  }

  @Get('driver-license/:userId')
  getDriverLicense(@Param('userId') userId: string) {
    return this.userService.getDriverLicense({ userId });
  }

  @Post('driver-license/:userId')
  createDriverLicense(
    @Param('userId') userId: string,
    @Body() body: CreateDriverLicenseRequestDTO
  ) {
    return this.userService.createDriverLicense({
      ...body,
      userId,
    });
  }

  @Put('driver-license/:userId')
  updateDriverLicense(
    @Param('userId') userId: string,
    @Body() body: UpdateDriverLicenseRequestDTO
  ) {
    return this.userService.updateDriverLicense({
      ...body,
      userId,
    });
  }

  @Get('bank-account/:userId')
  getBankAccount(@Param('userId') userId: string) {
    return this.userService.getBankAccount({ userId });
  }

  @Post('bank-account/:userId')
  createBankAccount(
    @Param('userId') userId: string,
    @Body() body: CreateBankAccountRequestDTO
  ) {
    return this.userService.createBankAccount({
      ...body,
      userId,
    });
  }

  @Put('bank-account/:userId')
  updateBankAccount(
    @Param('userId') userId: string,
    @Body() body: UpdateBankAccountRequestDTO
  ) {
    return this.userService.updateBankAccount({
      ...body,
      userId,
    });
  }

  @Get('address')
  getAddress(@Query() query: GetAddressRequestDTO) {
    if (query.id) {
      return this.userService.getAddress({
        id: query.id,
        userId: query.userId,
      });
    }
    return this.userService.getManyAddress({ userId: query.userId });
  }

  @Post('address/:userId')
  createAddress(
    @Param('userId') userId: string,
    @Body() body: CreateAddressRequestDTO
  ) {
    return this.userService.createAddress(body);
  }

  @Put('address')
  updateAddress(@Body() body: UpdateAddressRequestDTO) {
    return this.userService.updateAddress(body);
  }

  @Delete('address')
  deleteAddress(@Query() query: DeleteAddressRequestDTO) {
    return this.userService.deleteAddress(query);
  }
}
