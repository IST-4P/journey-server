import z from 'zod';

export const CategorySortByValues = {
  NAME: 'name',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
} as const;

export const CategorySortByEnum = z.enum([
  CategorySortByValues.NAME,
  CategorySortByValues.CREATED_AT,
  CategorySortByValues.UPDATED_AT,
]);

export const SortDirectionValues = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export const SortDirectionEnum = z.enum([
  SortDirectionValues.ASC,
  SortDirectionValues.DESC,
]);

export type CategorySortBy = z.infer<typeof CategorySortByEnum>;
export type SortDirection = z.infer<typeof SortDirectionEnum>;
