import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  email: z.email({ message: 'Error.InvalidEmail' }),
  name: z.string().min(1, 'Error.InvalidName').max(100, 'Error.InvalidName'),
  phone: z.string().min(9).max(15),
  password: z.string().min(4).max(100),
  role: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class RegisterRequestDTO extends createZodDto(
  UserSchema.pick({
    email: true,
    name: true,
    phone: true,
    password: true,
  })
    .extend({
      confirmPassword: z.string().min(4).max(100),
      code: z.string().length(6),
    })
    .strict()
    .superRefine(({ confirmPassword, password }, ctx) => {
      if (confirmPassword !== password) {
        ctx.addIssue({
          code: 'custom',
          message: 'Error.PasswordDoNotMatch',
        });
      }
    })
) {}

export class LoginRequestDTO extends createZodDto(
  UserSchema.pick({
    email: true,
    password: true,
  }).strict()
) {}

export class RefreshTokenRequestDTO extends createZodDto(
  z.object({
    refreshToken: z.string(),
  })
) {}

export class SendOTPRequestDTO extends createZodDto(
  z.object({
    email: z.email({ message: 'Error.InvalidEmail' }),
    type: z.enum(['REGISTER', 'FORGOT_PASSWORD']),
  })
) {}

export class ForgotPasswordRequestDTO extends createZodDto(
  z
    .object({
      email: z.email({ message: 'Error.InvalidEmail' }),
      code: z.string().length(6),
      newPassword: z.string().min(4).max(100),
      confirmNewPassword: z.string().min(4).max(100),
    })
    .strict()
    .superRefine(({ newPassword, confirmNewPassword }, ctx) => {
      if (confirmNewPassword !== newPassword) {
        ctx.addIssue({
          code: 'custom',
          message: 'Error.PasswordDoNotMatch',
        });
      }
    })
) {}
