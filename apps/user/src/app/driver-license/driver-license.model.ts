import { z } from 'zod';

// ==================== ENUMS ====================

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

// ==================== BASE SCHEMA ====================

export const DriverLicenseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  licenseNumber: z.string().min(1),
  fullName: z.string().min(2).max(100),

  dateOfBirth: z.coerce.date(),
  licenseClass: LicenseClassEnum,
  issueDate: z.coerce.date(),
  expiryDate: z.coerce.date(),
  issuePlace: z.string().min(1),

  frontImageUrl: z.string(),
  backImageUrl: z.string(),
  selfieImageUrl: z.string(),

  isVerified: z.boolean().default(false),
  verifiedAt: z.coerce.date().nullable().optional(),
  rejectedReason: z.string().nullable().optional(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const GetDriverLicenseRequestSchema = DriverLicenseSchema.pick({
  userId: true,
});

export const GetDriverLicenseResponseSchema = DriverLicenseSchema;

export const CreateDriverLicenseRequestSchema = DriverLicenseSchema.pick({
  userId: true,
  licenseNumber: true,
  fullName: true,
  dateOfBirth: true,
  licenseClass: true,
  issueDate: true,
  expiryDate: true,
  issuePlace: true,
  frontImageUrl: true,
  backImageUrl: true,
  selfieImageUrl: true,
});

export const UpdateDriverLicenseRequestSchema =
  CreateDriverLicenseRequestSchema.partial().extend({
    userId: z.string(),
  });

export type GetDriverLicenseRequestType = z.infer<
  typeof GetDriverLicenseRequestSchema
>;
export type GetDriverLicenseResponseType = z.infer<
  typeof GetDriverLicenseResponseSchema
>;
export type UpdateDriverLicenseRequestType = z.infer<
  typeof UpdateDriverLicenseRequestSchema
>;
export type CreateDriverLicenseRequestType = z.infer<
  typeof CreateDriverLicenseRequestSchema
>;
