import { PaginationQuerySchema } from '@domain/shared';
import { z } from 'zod';
import { ReviewValidatorSchema } from '../validators';

// Review models
export const CreateReviewRequestSchema = z.object({
  bookingId: z.string().uuid().optional(),
  userId: z.string().uuid(),
  rentalId: z.string().uuid().optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1),
  type: z.string(), // Will be validated as enum in service
  content: z.string().min(1),
  images: z.array(z.string()),
});

export const UpdateReviewRequestSchema = z.object({
  reviewId: z.string().uuid(),
  userId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1),
  content: z.string().min(1),
  images: z.array(z.string()),
});

export const DeleteReviewRequestSchema = z.object({
  reviewId: z.string().uuid(),
  userId: z.string().uuid(),
});

export const GetReviewByIdRequestSchema = z.object({
  reviewId: z.string().uuid(),
});

export const GetMyReviewsRequestSchema = z
  .object({
    userId: z.string().uuid(),
    search_text: z.string().optional(),
    min_rating: z.number().int().min(1).max(5).optional(),
    max_rating: z.number().int().min(1).max(5).optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    sort_by: z.string().optional(),
    sort_order: z.string().optional(),
  })
  .extend(PaginationQuerySchema.shape);

export const GetReviewsByVehicleRequestSchema = z
  .object({
    vehicleId: z.string().uuid(),
    search_text: z.string().optional(),
    min_rating: z.number().int().min(1).max(5).optional(),
    max_rating: z.number().int().min(1).max(5).optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    sort_by: z.string().optional(),
    sort_order: z.string().optional(),
  })
  .extend(PaginationQuerySchema.shape);

export const GetReviewsByDeviceRequestSchema = z
  .object({
    deviceId: z.string().uuid(),
    search_text: z.string().optional(),
    min_rating: z.number().int().min(1).max(5).optional(),
    max_rating: z.number().int().min(1).max(5).optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    sort_by: z.string().optional(),
    sort_order: z.string().optional(),
  })
  .extend(PaginationQuerySchema.shape);

export const GetReviewsByComboRequestSchema = z
  .object({
    comboId: z.string().uuid(),
    search_text: z.string().optional(),
    min_rating: z.number().int().min(1).max(5).optional(),
    max_rating: z.number().int().min(1).max(5).optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    sort_by: z.string().optional(),
    sort_order: z.string().optional(),
  })
  .extend(PaginationQuerySchema.shape);

export const GetAllReviewsRequestSchema = z
  .object({
    adminId: z.string().uuid(),
    type: z.string().optional(),
    searchText: z.string().optional(),
    minRating: z.number().int().min(1).max(5).optional(),
    maxRating: z.number().int().min(1).max(5).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.string().optional(),
  })
  .extend(PaginationQuerySchema.shape);

export const AdminDeleteReviewRequestSchema = z.object({
  reviewId: z.string().uuid(),
  adminId: z.string().uuid(),
});

export const ReviewResponseSchema = ReviewValidatorSchema;

export const GetReviewsResponseSchema = z.object({
  reviews: z.array(ReviewValidatorSchema),
  page: z.number().int(),
  limit: z.number().int(),
  total_items: z.number().int(),
  total_pages: z.number().int(),
});

export const GetMyReviewsResponseSchema = z.object({
  reviews: z.array(ReviewValidatorSchema),
  page: z.number().int(),
  limit: z.number().int(),
  total_items: z.number().int(),
  total_pages: z.number().int(),
});

export const DeleteReviewResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Review types
export type CreateReviewRequest = z.infer<typeof CreateReviewRequestSchema>;
export type UpdateReviewRequest = z.infer<typeof UpdateReviewRequestSchema>;
export type DeleteReviewRequest = z.infer<typeof DeleteReviewRequestSchema>;
export type GetReviewByIdRequest = z.infer<typeof GetReviewByIdRequestSchema>;
export type GetMyReviewsRequest = z.infer<typeof GetMyReviewsRequestSchema>;
export type GetReviewsByVehicleRequest = z.infer<
  typeof GetReviewsByVehicleRequestSchema
>;
export type GetReviewsByDeviceRequest = z.infer<
  typeof GetReviewsByDeviceRequestSchema
>;
export type GetReviewsByComboRequest = z.infer<
  typeof GetReviewsByComboRequestSchema
>;
export type GetAllReviewsRequest = z.infer<typeof GetAllReviewsRequestSchema>;
export type AdminDeleteReviewRequest = z.infer<
  typeof AdminDeleteReviewRequestSchema
>;
export type ReviewResponse = z.infer<typeof ReviewResponseSchema>;
export type GetReviewsResponse = z.infer<typeof GetReviewsResponseSchema>;
export type GetMyReviewsResponse = z.infer<typeof GetMyReviewsResponseSchema>;
export type DeleteReviewResponse = z.infer<typeof DeleteReviewResponseSchema>;
