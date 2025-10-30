import {
  CreateAddressRequestDTO,
  CreateBankAccountRequestDTO,
  CreateDriverLicenseRequestDTO,
  UpdateAddressRequestDTO,
  UpdateBankAccountRequestDTO,
  UpdateDriverLicenseRequestDTO,
  UpdateProfileRequestDTO,
} from '@domain/user';
import { ActiveUser } from '@hacmieu-journey/nestjs';
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  // private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Get('profile')
  getProfile(@ActiveUser('userId') userId: string) {
    return this.userService.getProfile({ userId });
  }

  @Put('profile')
  updateProfile(
    @ActiveUser('userId') userId: string,
    @Body() body: Omit<UpdateProfileRequestDTO, 'userId'>
  ) {
    return this.userService.updateProfile({
      ...body,
      userId,
    });
  }

  @Get('driver-license')
  getDriverLicense(@ActiveUser('userId') userId: string) {
    return this.userService.getDriverLicense({ userId });
  }

  @Post('driver-license')
  createDriverLicense(
    @ActiveUser('userId') userId: string,
    @Body() body: Omit<CreateDriverLicenseRequestDTO, 'userId'>
  ) {
    return this.userService.createDriverLicense({
      ...body,
      userId,
    });
  }

  @Put('driver-license')
  updateDriverLicense(
    @ActiveUser('userId') userId: string,
    @Body() body: Omit<UpdateDriverLicenseRequestDTO, 'userId'>
  ) {
    return this.userService.updateDriverLicense({
      ...body,
      userId,
    });
  }

  @Get('bank-account')
  getBankAccount(@ActiveUser('userId') userId: string) {
    return this.userService.getBankAccount({ userId });
  }

  @Post('bank-account')
  createBankAccount(
    @ActiveUser('userId') userId: string,
    @Body() body: Omit<CreateBankAccountRequestDTO, 'userId'>
  ) {
    return this.userService.createBankAccount({
      ...body,
      userId,
    });
  }

  @Put('bank-account')
  updateBankAccount(
    @ActiveUser('userId') userId: string,
    @Body() body: Omit<UpdateBankAccountRequestDTO, 'userId'>
  ) {
    return this.userService.updateBankAccount({
      ...body,
      userId,
    });
  }

  @Get('address')
  getManyAddress(@ActiveUser('userId') userId: string) {
    return this.userService.getManyAddress({ userId });
  }

  @Get('address/:id')
  getAddress(@ActiveUser('userId') userId: string, @Param('id') id: string) {
    return this.userService.getAddress({ id, userId });
  }

  @Post('address')
  createAddress(
    @ActiveUser('userId') userId: string,
    @Body() body: CreateAddressRequestDTO
  ) {
    return this.userService.createAddress({
      ...body,
      userId,
    });
  }

  @Put('address/:id')
  updateAddress(
    @ActiveUser('userId') userId: string,
    @Body() body: UpdateAddressRequestDTO,
    @Param('id') id: string
  ) {
    return this.userService.updateAddress({
      ...body,
      id,
      userId,
    });
  }
}
