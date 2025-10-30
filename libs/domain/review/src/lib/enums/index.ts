import z from 'zod';

export const ReviewTypeValues = {
  DEVICE: 'DEVICE',
  VEHICLE: 'VEHICLE',
  COMBO: 'COMBO',
} as const;

export const ReviewTypeEnum = z.enum([
  ReviewTypeValues.DEVICE,
  ReviewTypeValues.VEHICLE,
  ReviewTypeValues.COMBO,
]);

export const SortFieldValues = {
  CREATED_AT: 'CREATED_AT',
  UPDATED_AT: 'UPDATED_AT',
  RATING: 'RATING',
  TITLE: 'TITLE',
} as const;

export const SortFieldEnum = z.enum([
  SortFieldValues.CREATED_AT,
  SortFieldValues.UPDATED_AT,
  SortFieldValues.RATING,
  SortFieldValues.TITLE,
]);

export const SortOrderValues = {
  ASCENDING: 'ASCENDING',
  DESCENDING: 'DESCENDING',
} as const;

export const SortOrderEnum = z.enum([
  SortOrderValues.ASCENDING,
  SortOrderValues.DESCENDING,
]);

export type ReviewType = z.infer<typeof ReviewTypeEnum>;
export type SortField = z.infer<typeof SortFieldEnum>;
export type SortOrder = z.infer<typeof SortOrderEnum>;
