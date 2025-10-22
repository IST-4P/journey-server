import { z } from 'zod';

export const AddressValidatorSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  label: z.string().min(1, { message: 'Error.InvalidLabel' }),
  city: z.string().min(1, { message: 'Error.InvalidCity' }),
  ward: z.string().min(1, { message: 'Error.InvalidWard' }),
  detail: z.string().min(1, { message: 'Error.InvalidDetail' }),
  latitude: z.number().min(-90).max(90).nullish(),
  longitude: z.number().min(-180).max(180).nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type AddressValidator = z.infer<typeof AddressValidatorSchema>;
