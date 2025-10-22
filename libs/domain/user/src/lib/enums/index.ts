import { z } from 'zod';

export const GenderEnum = z.enum(['MALE', 'FEMALE', 'OTHER']);

export const RoleEnum = z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']);

export const LicenseClassEnum = z.enum([
  'A1',
  'A2',
  'B1',
  'B2',
  'C',
  'D',
  'E',
  'F',
]);

export type Role = z.infer<typeof RoleEnum>;
export type Gender = z.infer<typeof GenderEnum>;
export type LicenseClass = z.infer<typeof LicenseClassEnum>;
