import { z } from 'zod';

// ==================== ENUMS ====================

export const GenderEnum = z.enum(['MALE', 'FEMALE', 'OTHER']);

export const RoleEnum = z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']);

export type RoleEnumType = z.infer<typeof RoleEnum>;

// ==================== BASE SCHEMA ====================

export const UserProfileSchema = z.object({
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

export const GetUserProfileRequestSchema = z.object({
  userId: z.string(),
});

export const GetUserProfileResponseSchema = UserProfileSchema;

export const UpdateUserProfileRequestSchema = UserProfileSchema.pick({
  fullName: true,
  phone: true,
  avatarUrl: true,
  facebookUrl: true,
  bio: true,
  birthDate: true,
})
  .extend({
    userId: z.string(),
  })
  .partial();

export type GetUserProfileRequestType = z.infer<
  typeof GetUserProfileRequestSchema
>;
export type GetUserProfileResponseType = z.infer<
  typeof GetUserProfileResponseSchema
>;
export type UpdateUserProfileRequestType = z.infer<
  typeof UpdateUserProfileRequestSchema
>;
