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
import {
  CreateAddressRequestDTO,
  CreateBankAccountRequestDTO,
  CreateDriverLicenseRequestDTO,
  DeleteAddressQueryDTO,
  FindAllProfilesQueryDTO,
  GetAddressQueryDTO,
  UpdateAddressQueryDTO,
  UpdateAddressRequestDTO,
  UpdateBankAccountRequestDTO,
  UpdateDriverLicenseRequestDTO,
  UpdateProfileRequestDTO,
} from './user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  // private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Get('profiles')
  findAllProfiles(@Query() query: FindAllProfilesQueryDTO) {
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
      userId,
      ...body,
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
      userId,
      ...body,
    });
  }

  @Put('driver-license/:userId')
  updateDriverLicense(
    @Param('userId') userId: string,
    @Body() body: UpdateDriverLicenseRequestDTO
  ) {
    return this.userService.updateDriverLicense({ userId, ...body });
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
      userId,
      ...body,
    });
  }

  @Put('bank-account/:userId')
  updateBankAccount(
    @Param('userId') userId: string,
    @Body() body: UpdateBankAccountRequestDTO
  ) {
    return this.userService.updateBankAccount({
      userId,
      ...body,
    });
  }

  @Get('address')
  getAddress(@Query() query: GetAddressQueryDTO) {
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
    return this.userService.createAddress({
      userId,
      ...body,
    });
  }

  @Put('address')
  updateAddress(
    @Body() body: UpdateAddressRequestDTO,
    @Query() query: UpdateAddressQueryDTO
  ) {
    return this.userService.updateAddress({
      id: query.id,
      userId: query.userId,
      ...body,
    });
  }

  @Delete('address')
  deleteAddress(@Query() query: DeleteAddressQueryDTO) {
    return this.userService.deleteAddress({
      id: query.id,
      userId: query.userId,
    });
  }
}
