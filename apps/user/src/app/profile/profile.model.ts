import { z } from 'zod';

// ==================== ENUMS ====================

export const GenderEnum = z.enum(['MALE', 'FEMALE', 'OTHER']);

export const RoleEnum = z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']);

export type RoleEnumType = z.infer<typeof RoleEnum>;

// ==================== BASE SCHEMA ====================

export const ProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  phone: z.string(),
  role: RoleEnum,
  gender: GenderEnum.nullable(),

  avatarUrl: z.string().nullable(),
  facebookUrl: z.string().nullable(),
  creditScore: z.number().int(),
  bio: z.string().nullable(),
  birthDate: z.coerce.date().nullable(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const GetProfileRequestSchema = z.object({
  userId: z.string(),
});

export const GetProfileResponseSchema = ProfileSchema;

export const UpdateProfileRequestSchema = ProfileSchema.pick({
  fullName: true,
  phone: true,
  avatarUrl: true,
  facebookUrl: true,
  bio: true,
  birthDate: true,
})
  .partial()
  .extend({
    userId: z.string(),
  });

export type GetProfileRequestType = z.infer<typeof GetProfileRequestSchema>;
export type GetProfileResponseType = z.infer<typeof GetProfileResponseSchema>;
export type UpdateProfileRequestType = z.infer<
  typeof UpdateProfileRequestSchema
>;
