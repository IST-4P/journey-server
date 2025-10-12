import { MessageResponseType } from '@hacmieu-journey/nestjs';
import { Body, Controller, Post } from '@nestjs/common';
import { RegisterRequestType } from './auth.model';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() data: RegisterRequestType): Promise<MessageResponseType> {
    return this.authService.register(data);
  }
}
