import { z } from 'zod';

// ==================== BASE SCHEMA ====================

export const AddressSchema = z.object({
  id: z.string(),
  userId: z.string(),
  label: z.string(),
  city: z.string(),
  ward: z.string(),
  detail: z.string(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const GetManyAddressRequestSchema = AddressSchema.pick({
  userId: true,
});

export const GetAddressRequestSchema = AddressSchema.pick({
  id: true,
  userId: true,
});

export const GetAddressResponseSchema = AddressSchema;

export const CreateAddressRequestSchema = AddressSchema.pick({
  userId: true,
  label: true,
  city: true,
  ward: true,
  detail: true,
  latitude: true,
  longitude: true,
});

export const UpdateAddressRequestSchema =
  CreateAddressRequestSchema.partial().extend({
    id: z.string(),
    userId: z.string(),
  });

export const DeleteAddressRequestSchema = AddressSchema.pick({
  id: true,
  userId: true,
});

export type GetAddressRequestType = z.infer<typeof GetAddressRequestSchema>;
export type GetManyAddressRequestType = z.infer<
  typeof GetManyAddressRequestSchema
>;
export type GetAddressResponseType = z.infer<typeof GetAddressResponseSchema>;
export type UpdateAddressRequestType = z.infer<
  typeof UpdateAddressRequestSchema
>;
export type CreateAddressRequestType = z.infer<
  typeof CreateAddressRequestSchema
>;
export type DeleteAddressRequestType = z.infer<
  typeof DeleteAddressRequestSchema
>;
