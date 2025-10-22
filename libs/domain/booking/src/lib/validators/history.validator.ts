import { z } from 'zod';
import { HistoryActionEnum } from '../enums';

export const HistoryValidatorSchema = z.object({
  id: z.string().uuid(),
  bookingId: z.string().uuid(),
  action: HistoryActionEnum,
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
});

export type HistoryValidator = z.infer<typeof HistoryValidatorSchema>;
