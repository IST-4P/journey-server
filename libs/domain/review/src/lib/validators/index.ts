import { z } from 'zod';
import { ReviewTypeEnum } from '../enums';

export const ReviewValidatorSchema = z.object({
  id: z.string().uuid(),
  booking_id: z.string().uuid().optional(),
  vehicle_id: z.string().uuid().optional(),
  device_id: z.string().uuid().optional(),
  combo_id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1),
  type: ReviewTypeEnum,
  content: z.string().min(1),
  images: z.array(z.string()),
  created_at: z.string(),
  updated_at: z.string(),
  update_count: z.number().int().min(0),
  rental_id: z.string().uuid().optional(),
});

export const ReviewSummaryValidatorSchema = z.object({
  id: z.string().uuid(),
  booking_id: z.string().uuid().optional(),
  vehicle_id: z.string().uuid().optional(),
  device_id: z.string().uuid().optional(),
  combo_id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1),
  type: ReviewTypeEnum,
  created_at: z.string(),
  updated_at: z.string(),
  update_count: z.number().int().min(0),
  rental_id: z.string().uuid().optional(),
});

export type ReviewValidator = z.infer<typeof ReviewValidatorSchema>;
export type ReviewSummaryValidator = z.infer<
  typeof ReviewSummaryValidatorSchema
>;
