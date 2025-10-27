import { z } from 'zod';
import { CheckTypeEnum } from '../enums';

export const CheckInOutValidatorSchema = z.object({
  id: z.string().uuid(),
  bookingId: z.string().uuid(),
  userId: z.string().uuid(),
  type: CheckTypeEnum,

  latitude: z.number(),
  longitude: z.number(),
  address: z.string().nullable(),

  images: z.array(z.string()),

  mileage: z.number().int(),
  fuelLevel: z.number().int(),
  damageNotes: z.string().nullable(),
  damageImages: z.array(z.string()),

  verified: z.boolean(),
  verifiedAt: z.coerce.date().nullable(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type CheckInOutValidator = z.infer<typeof CheckInOutValidatorSchema>;
