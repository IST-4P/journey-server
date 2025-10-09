import { createZodDto } from 'nestjs-zod';
import {
  ForgotPasswordBodySchema,
  LoginBodySchema,
  RefreshTokenBodySchema,
  RegisterBodySchema,
  SendOTPBodySchema,
} from './auth.model';

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}

export class LoginBodyDTO extends createZodDto(LoginBodySchema) {}

export class RefreshTokenBodyDTO extends createZodDto(RefreshTokenBodySchema) {}

export class SendOTPBodyDTO extends createZodDto(SendOTPBodySchema) {}

export class ForgotPasswordBodyDTO extends createZodDto(
  ForgotPasswordBodySchema
) {}
