import z from 'zod';

export const TypeOfVerificationCode = {
  REGISTER: 'REGISTER',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
} as const;

export type TypeOfVerificationCodeType =
  (typeof TypeOfVerificationCode)[keyof typeof TypeOfVerificationCode];

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

export const RegisterBodySchema = UserSchema.pick({
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
        path: ['confirmPassword'],
      });
    }
  });

export const LoginBodySchema = UserSchema.pick({
  email: true,
  password: true,
}).strict();

export const VerificationCodeSchema = z.object({
  id: z.number(),
  email: z.email(),
  code: z.string().length(6),
  type: z.enum([
    TypeOfVerificationCode.REGISTER,
    TypeOfVerificationCode.FORGOT_PASSWORD,
  ]),
  expiresAt: z.date(),
  createdAt: z.date(),
});

export const SendOTPBodySchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
});

export const RefreshTokenSchema = z.object({
  token: z.string(),
  userId: z.string(),
  expiresAt: z.date(),
  createdAt: z.date(),
});

export const RefreshTokenBodySchema = z.object({
  refreshToken: z.string(),
});

export const ForgotPasswordBodySchema = z
  .object({
    email: z.email(),
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
        path: ['confirmNewPassword'],
      });
    }
  });

export type UserType = z.infer<typeof UserSchema>;
export type RegisterBodyType = z.infer<typeof RegisterBodySchema>;
export type LoginBodyType = z.infer<typeof LoginBodySchema>;
export type VerificationCodeType = z.infer<typeof VerificationCodeSchema>;
export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>;
export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>;
export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>;
export type LogoutBodyType = RefreshTokenBodyType;
export type ForgotPasswordBodyType = z.infer<typeof ForgotPasswordBodySchema>;
