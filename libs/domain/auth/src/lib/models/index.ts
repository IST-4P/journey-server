import { z } from 'zod';
import { VerificationCodeEnum } from '../enums';
import { UserValidatorSchema } from '../validators';

export const RegisterRequestSchema = UserValidatorSchema.pick({
  email: true,
  name: true,
  phone: true,
  password: true,
})
  .extend({
    confirmPassword: z
      .string({ message: 'Error.InvalidConfirmPassword' })
      .min(4)
      .max(100),
    code: z.string({ message: 'Error.InvalidOTP' }).length(6),
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Error.PasswordDoNotMatch',
      });
    }
  });

export const LoginRequestSchema = UserValidatorSchema.pick({
  email: true,
  password: true,
}).strict();

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const VerificationCodeSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  code: z.string().length(6),
  type: VerificationCodeEnum,
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date(),
});

export const SendOTPRequestSchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
});

export const RefreshTokenSchema = z.object({
  token: z.string(),
  userId: z.string(),
  expiresAt: z.date(),
  createdAt: z.date(),
});

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string(),
});

export const ForgotPasswordRequestSchema = z
  .object({
    email: z.string().email(),
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
  });

export const ValidateTokenRequestSchema = z.object({
  accessToken: z.string(),
});

export const ValidateTokenResponseSchema = z.object({
  isValid: z.boolean(),
  userId: z.string().optional(),
  role: z.string().optional(),
  uuid: z.string().optional(),
  iat: z.number().optional(),
  exp: z.number().optional(),
  error: z.string().optional(),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type SendOTPRequest = z.infer<typeof SendOTPRequestSchema>;
export type RefreshToken = z.infer<typeof RefreshTokenSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
export type RefreshTokenResponse = LoginResponse;
export type LogoutRequest = RefreshTokenRequest;
export type VerificationCode = z.infer<typeof VerificationCodeSchema>;
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;
export type ValidateTokenRequest = z.infer<typeof ValidateTokenRequestSchema>;
export type ValidateTokenResponse = z.infer<typeof ValidateTokenResponseSchema>;
