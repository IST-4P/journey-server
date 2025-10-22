import { z } from 'zod';
import { HistoryValidatorSchema } from '../validators';

export const GetManyHistoriesRequestSchema = HistoryValidatorSchema.pick({
  action: true,
}).partial();

export const GetManyHistoriesResponseSchema = z.object({
  histories: z.array(HistoryValidatorSchema),
  page: z.number().int(),
  limit: z.number().int(),
  totalItems: z.number().int(),
  totalPages: z.number().int(),
});

export const GetHistoryRequestSchema = HistoryValidatorSchema.pick({
  id: true,
});

export const GetHistoryResponseSchema = HistoryValidatorSchema;

export const CreateHistoryRequestSchema = HistoryValidatorSchema.pick({
  bookingId: true,
  action: true,
  notes: true,
});

export type GetManyHistoriesRequest = z.infer<
  typeof GetManyHistoriesRequestSchema
>;
export type GetManyHistoriesResponse = z.infer<
  typeof GetManyHistoriesResponseSchema
>;
export type GetHistoryRequest = z.infer<typeof GetHistoryRequestSchema>;
export type GetHistoryResponse = z.infer<typeof GetHistoryResponseSchema>;
export type CreateHistoryRequest = z.infer<typeof CreateHistoryRequestSchema>;
