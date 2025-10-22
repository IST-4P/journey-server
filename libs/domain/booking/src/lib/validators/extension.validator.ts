import { z } from 'zod';
import { ExtensionStatusEnum } from '../enums';

export const ExtensionValidatorSchema = z.object({
  id: z.string().uuid(),
  bookingId: z.string().uuid(),
  requestedBy: z.string().uuid(),
  originalEndTime: z.coerce.date(),
  newEndTime: z.coerce.date(),
  additionalHours: z.number().int().min(1),
  additionalAmount: z.number().int().min(0),
  status: ExtensionStatusEnum,
  rejectionReason: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
});

export type ExtensionValidator = z.infer<typeof ExtensionValidatorSchema>;
