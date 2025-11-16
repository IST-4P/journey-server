import { PaginationQuerySchema } from '@domain/shared';
import { z } from 'zod';
import { CategorySortByEnum, SortDirectionEnum } from '../enums/category.enum';
import { CategoryValidatorSchema } from '../validators/category.validator';

// Category models
export const GetCategoryRequestSchema = z.object({
  categoryId: z.string().uuid(),
});

export const GetCategoryResponseSchema = CategoryValidatorSchema;

export const GetManyCategoriesRequestSchema = z
  .object({
    search: z.string(),
    sortBy: CategorySortByEnum,
    sortDir: SortDirectionEnum,
  })
  .partial()
  .extend(PaginationQuerySchema.shape);

export const GetManyCategoriesResponseSchema = z.object({
  categories: z.array(CategoryValidatorSchema),
  page: z.number().int(),
  limit: z.number().int(),
  totalItems: z.number().int(),
  totalPages: z.number().int(),
});

export const CreateCategoryRequestSchema = CategoryValidatorSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const CreateCategoryResponseSchema = CategoryValidatorSchema;

export const UpdateCategoryRequestSchema = CategoryValidatorSchema.omit({
  createdAt: true,
  updatedAt: true,
})
  .partial()
  .extend({
    categoryId: z.string().uuid(),
  });

export const UpdateCategoryResponseSchema = CategoryValidatorSchema;

export const DeleteCategoryRequestSchema = z.object({
  categoryId: z.string().uuid(),
});

export const DeleteCategoryResponseSchema = z.object({
  message: z.string(),
});

// Category types
export type GetCategoryRequest = z.infer<typeof GetCategoryRequestSchema>;
export type GetCategoryResponse = z.infer<typeof GetCategoryResponseSchema>;
export type GetManyCategoriesRequest = z.infer<
  typeof GetManyCategoriesRequestSchema
>;
export type GetManyCategoriesResponse = z.infer<
  typeof GetManyCategoriesResponseSchema
>;
export type CreateCategoryRequest = z.infer<typeof CreateCategoryRequestSchema>;
export type CreateCategoryResponse = z.infer<
  typeof CreateCategoryResponseSchema
>;
export type UpdateCategoryRequest = z.infer<typeof UpdateCategoryRequestSchema>;
export type UpdateCategoryResponse = z.infer<
  typeof UpdateCategoryResponseSchema
>;
export type DeleteCategoryRequest = z.infer<typeof DeleteCategoryRequestSchema>;
export type DeleteCategoryResponse = z.infer<
  typeof DeleteCategoryResponseSchema
>;
