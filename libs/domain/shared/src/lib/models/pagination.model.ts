import { z } from 'zod';

/**
 * Pagination Query Schema
 * Dùng cho tất cả API có phân trang
 */
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

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

/**
 * Pagination Response Schema
 * Generic type cho response có phân trang
 */
export interface PaginationResponse<T> {
  data: T[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Helper function để tạo pagination response
 */
export function createPaginationResponse<T>(
  data: T[],
  totalItems: number,
  page: number,
  limit: number
): PaginationResponse<T> {
  return {
    data,
    page,
    limit,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
  };
}
