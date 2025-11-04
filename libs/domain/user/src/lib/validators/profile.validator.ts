import { z } from 'zod';
import { GenderEnum, RoleEnum } from '../enums';

export const ProfileValidatorSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email({ message: 'Error.InvalidEmail' }),
  fullName: z
    .string({ message: 'InvalidFullName' })
    .min(2)
    .max(100, { message: 'Error.InvalidFullName' }),
  phone: z
    .string()
    .regex(/^(\+84|0)[0-9]{9}$/, { message: 'Error.InvalidPhone' }),
  role: RoleEnum,
  gender: GenderEnum,
  avatarUrl: z.string().url({ message: 'Error.InvalidAvatar' }),
  facebookUrl: z.string().url().nullish(),
  creditScore: z.number().int().min(0).max(100).default(100),
  bio: z.string().max(500),
  birthDate: z.coerce.date().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ProfileValidator = z.infer<typeof ProfileValidatorSchema>;
