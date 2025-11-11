import { PaginationQuerySchema } from '@domain/shared';
import { z } from 'zod';
import { HistoryValidatorSchema } from '../validators';

export const GetManyHistoriesRequestSchema = HistoryValidatorSchema.pick({
  action: true,
  bookingId: true,
})
  .partial()
  .extend(PaginationQuerySchema.shape);

export const GetManyHistoriesResponseSchema = z.object({
  histories: z.array(HistoryValidatorSchema.omit({ notes: true })),
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
