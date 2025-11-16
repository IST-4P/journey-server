import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import {
  CreateDriverLicenseRequestSchema,
  GetDriverLicenseRequestSchema,
  GetDriverLicenseResponseSchema,
  UpdateDriverLicenseRequestSchema,
  VerifyDriverLicenseRequestSchema,
} from '../models';

export class GetDriverLicenseRequestDTO extends createZodDto(
  GetDriverLicenseRequestSchema
) {}
export class GetDriverLicenseResponseDTO extends createZodDto(
  GetDriverLicenseResponseSchema
) {}
export class CreateDriverLicenseRequestDTO extends createZodDto(
  CreateDriverLicenseRequestSchema.extend({
    dateOfBirth: z.string().datetime(),
    issueDate: z.string().datetime(),
    expiryDate: z.string().datetime(),
  })
) {}
export class UpdateDriverLicenseRequestDTO extends createZodDto(
  UpdateDriverLicenseRequestSchema.extend({
    dateOfBirth: z.string().datetime().optional(),
    issueDate: z.string().datetime().optional(),
    expiryDate: z.string().datetime().optional(),
  })
) {}
export class VerifyDriverLicenseRequestDTO extends createZodDto(
  VerifyDriverLicenseRequestSchema.extend({
    rejectedReason: z.string().optional(),
  })
) {}
