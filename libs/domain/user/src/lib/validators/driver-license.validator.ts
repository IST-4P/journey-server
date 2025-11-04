import { z } from 'zod';
import { LicenseClassEnum } from '../enums';

export const DriverLicenseValidatorSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  licenseNumber: z.string().min(1, { message: 'Error.InvalidLicenseNumber' }),
  fullName: z.string().min(2).max(100, { message: 'Error.InvalidFullName' }),
  dateOfBirth: z.coerce.date({ message: 'Error.InvalidDateOfBirth' }),
  licenseClass: LicenseClassEnum,
  issueDate: z.date({ message: 'Error.InvalidIssueDate' }),
  expiryDate: z.date({ message: 'Error.InvalidExpiryDate' }),
  issuePlace: z.string().min(1, { message: 'Error.InvalidIssuePlace' }),
  frontImageUrl: z.string().url({ message: 'Error.InvalidFrontImage' }),
  backImageUrl: z.string().url({ message: 'Error.InvalidBackImage' }),
  selfieImageUrl: z.string().url({ message: 'Error.InvalidSelfieImage' }),
  isVerified: z.boolean().default(false),
  verifiedAt: z.coerce.date().nullable().optional(),
  rejectedReason: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type DriverLicenseValidator = z.infer<
  typeof DriverLicenseValidatorSchema
>;
