import { createZodDto } from 'nestjs-zod';
import {
  ForgotPasswordRequestSchema,
  LoginRequestSchema,
  RefreshTokenRequestSchema,
  RegisterRequestSchema,
  SendOTPRequestSchema,
} from './auth.model';

export class RegisterRequestDTO extends createZodDto(RegisterRequestSchema) {}

export class LoginRequestDTO extends createZodDto(LoginRequestSchema) {}

export class RefreshTokenRequestDTO extends createZodDto(
  RefreshTokenRequestSchema
) {}

export class SendOTPRequestDTO extends createZodDto(SendOTPRequestSchema) {}

export class ForgotPasswordRequestDTO extends createZodDto(
  ForgotPasswordRequestSchema
) {}
