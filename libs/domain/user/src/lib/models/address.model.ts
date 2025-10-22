import { z } from 'zod';
import { AddressValidatorSchema } from '../validators';

export const GetManyAddressRequestSchema = z.object({
  userId: z.string().uuid(),
});

export const GetAddressRequestSchema = AddressValidatorSchema.pick({
  id: true,
  userId: true,
});

export const GetAddressResponseSchema = AddressValidatorSchema;

export const CreateAddressRequestSchema = AddressValidatorSchema.pick({
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
    id: z.string().uuid(),
    userId: z.string().uuid(),
  });

export const DeleteAddressRequestSchema = AddressValidatorSchema.pick({
  id: true,
  userId: true,
});

export type GetManyAddressRequest = z.infer<typeof GetManyAddressRequestSchema>;
export type GetAddressRequest = z.infer<typeof GetAddressRequestSchema>;
export type GetAddressResponse = z.infer<typeof GetAddressResponseSchema>;
export type CreateAddressRequest = z.infer<typeof CreateAddressRequestSchema>;
export type UpdateAddressRequest = z.infer<typeof UpdateAddressRequestSchema>;
export type DeleteAddressRequest = z.infer<typeof DeleteAddressRequestSchema>;
