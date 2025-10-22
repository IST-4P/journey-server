import { createZodDto } from 'nestjs-zod';
import {
  ForgotPasswordRequestSchema,
  LoginRequestSchema,
  LoginResponseSchema,
  RefreshTokenRequestSchema,
  RefreshTokenSchema,
  RegisterRequestSchema,
  SendOTPRequestSchema,
  ValidateTokenRequestSchema,
  ValidateTokenResponseSchema,
} from '../models';

export class RegisterRequestDTO extends createZodDto(RegisterRequestSchema) {}
export class LoginRequestDTO extends createZodDto(LoginRequestSchema) {}
export class LoginResponseDTO extends createZodDto(LoginResponseSchema) {}
export class SendOTPRequestDTO extends createZodDto(SendOTPRequestSchema) {}
export class RefreshTokenDTO extends createZodDto(RefreshTokenSchema) {}
export class RefreshTokenRequestDTO extends createZodDto(
  RefreshTokenRequestSchema
) {}
export class RefreshTokenResponseDTO extends LoginResponseDTO {}
export class LogoutRequestDTO extends RefreshTokenRequestDTO {}
export class ForgotPasswordRequestDTO extends createZodDto(
  ForgotPasswordRequestSchema
) {}
export class ValidateTokenRequestDTO extends createZodDto(
  ValidateTokenRequestSchema
) {}
export class ValidateTokenResponseDTO extends createZodDto(
  ValidateTokenResponseSchema
) {}
