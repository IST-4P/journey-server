import { UserProto } from '@hacmieu-journey/grpc';
import { ActiveUser } from '@hacmieu-journey/nestjs';
import { Body, Controller, Get, Put } from '@nestjs/common';
import { UpdateUserProfileRequestDTO } from './user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  getUserProfile(@ActiveUser('userId') userId: string) {
    return this.userService.getUserProfile({ userId });
  }

  @Put('profile')
  updateUserProfile(
    @ActiveUser('userId') userId: string,
    @Body() body: UpdateUserProfileRequestDTO
  ) {
    return this.userService.updateUserProfile({ userId, ...body });
  }
}
