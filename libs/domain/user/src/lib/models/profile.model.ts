import { PaginationQuerySchema } from '@domain/shared';
import { z } from 'zod';
import { ProfileValidatorSchema } from '../validators';

export const GetProfileRequestSchema = z.object({
  userId: z.string().uuid(),
});

export const GetProfileResponseSchema = ProfileValidatorSchema;

export const UpdateProfileRequestSchema = ProfileValidatorSchema.pick({
  fullName: true,
  phone: true,
  avatarUrl: true,
  facebookUrl: true,
  bio: true,
  birthDate: true,
  gender: true,
})
  .partial()
  .extend({
    userId: z.string().uuid(),
  });

export const GetAllProfilesRequestSchema = ProfileValidatorSchema.pick({
  fullName: true,
  email: true,
  phone: true,
  role: true,
})
  .partial()
  .extend(PaginationQuerySchema.shape);

export const GetAllProfilesResponseSchema = z.object({
  profiles: z.array(ProfileValidatorSchema),
  totalItems: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  totalPages: z.number().int(),
});

export const GetAllUserIdsResponseSchema = z.object({
  userIds: z.array(z.string().uuid()),
});

export const GetFullNameAndAvatarRequestSchema = z.object({
  userIds: z.array(z.string().uuid()),
});

export const GetFullNameAndAvatarResponseSchema = z.object({
  users: z.array(
    z.object({
      userId: z.string().uuid(),
      fullName: z.string(),
      avatarUrl: z.string(),
    })
  ),
});

export type GetProfileRequest = z.infer<typeof GetProfileRequestSchema>;
export type GetProfileResponse = z.infer<typeof GetProfileResponseSchema>;
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;
export type GetAllProfilesRequest = z.infer<typeof GetAllProfilesRequestSchema>;
export type GetAllProfilesResponse = z.infer<
  typeof GetAllProfilesResponseSchema
>;
export type GetAllUserIdsResponse = z.infer<typeof GetAllUserIdsResponseSchema>;
export type GetFullNameAndAvatarRequest = z.infer<
  typeof GetFullNameAndAvatarRequestSchema
>;
export type GetFullNameAndAvatarResponse = z.infer<
  typeof GetFullNameAndAvatarResponseSchema
>;
