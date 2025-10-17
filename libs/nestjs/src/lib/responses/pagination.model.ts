import { z } from 'zod';

export const PaginationQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive({ message: 'Error.InvalidPage' })
    .default(1),
  limit: z.coerce
    .number()
    .int()
    .positive({ message: 'Error.InvalidLimit' })
    .default(10),
});

export type PaginationQueryType = z.infer<typeof PaginationQuerySchema>;
