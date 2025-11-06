import { z } from 'zod';
import { DriverLicenseValidatorSchema } from '../validators';

export const GetDriverLicenseRequestSchema = DriverLicenseValidatorSchema.pick({
  userId: true,
});

export const GetDriverLicenseResponseSchema = DriverLicenseValidatorSchema;

export const CreateDriverLicenseRequestSchema =
  DriverLicenseValidatorSchema.pick({
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
    userId: z.string().uuid(),
  });

export const VerifyDriverLicenseRequestSchema =
  DriverLicenseValidatorSchema.pick({
    userId: true,
    isVerified: true,
    rejectedReason: true,
  });

export type GetDriverLicenseRequest = z.infer<
  typeof GetDriverLicenseRequestSchema
>;
export type GetDriverLicenseResponse = z.infer<
  typeof GetDriverLicenseResponseSchema
>;
export type CreateDriverLicenseRequest = z.infer<
  typeof CreateDriverLicenseRequestSchema
>;
export type UpdateDriverLicenseRequest = z.infer<
  typeof UpdateDriverLicenseRequestSchema
>;
export type VerifyDriverLicenseRequest = z.infer<
  typeof VerifyDriverLicenseRequestSchema
>;
