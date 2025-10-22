import { z } from 'zod';

export const VerificationCodeValues = {
  REGISTER: 'REGISTER',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
} as const;

export const VerificationCodeEnum = z.enum([
  VerificationCodeValues.REGISTER,
  VerificationCodeValues.FORGOT_PASSWORD,
]);

export type VerificationCodeType = z.infer<typeof VerificationCodeEnum>;
