import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateUserProfileRequestSchema = z.object({
  fullName: z.string(),
  phone: z.string(),
  email: z.string().email(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  dateOfBirth: z.string(),
  avatar: z.string(),
});

export class UpdateUserProfileRequestDTO extends createZodDto(
  z
    .object({
      fullName: z.string(),
      phone: z.string(),
      email: z.string().email(),
      gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
      dateOfBirth: z.string(),
      avatar: z.string(),
    })
    .optional()
) {}
