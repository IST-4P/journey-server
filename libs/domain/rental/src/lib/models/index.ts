import { PaginationQuerySchema } from '@domain/shared';
import { z } from 'zod';
import {
  RentalExtensionValidatorSchema,
  RentalValidatorSchema,
} from '../validators';

// Rental models
export const CreateRentalRequestSchema = z.object({
  userId: z.string().uuid(),
  items: z.array(
    z.object({
      targetId: z.string().uuid(),
      isCombo: z.boolean(),
      quantity: z.number().int().min(1),
    })
  ),
  startDate: z.string(),
  endDate: z.string(),
  discountPercent: z.number().min(0).max(100),
  maxDiscount: z.number().min(0),
});

export const RentalResponseSchema = RentalValidatorSchema;

export const GetMyRentalsRequestSchema = z
  .object({
    userId: z.string().uuid(),
    status: z.string().optional(),
  })
  .extend(PaginationQuerySchema.shape);

export const UserRentalSchema = z.object({
  id: z.string().uuid(),
  items: z.array(
    z.object({
      targetId: z.string().uuid(),
      isCombo: z.boolean(),
      quantity: z.number().int().min(1),
      name: z.string(),
      unitPrice: z.number().min(0),
      subtotal: z.number().min(0),
      detail: z.any(), // Simplified for user view
    })
  ),
  totalPrice: z.number().min(0),
  maxDiscount: z.number().min(0),
  status: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  createdAt: z.string(),
  discountPercent: z.number().min(0).max(100),
});

export const GetMyRentalsResponseSchema = z.object({
  rentals: z.array(UserRentalSchema),
  page: z.number().int(),
  limit: z.number().int(),
  totalItems: z.number().int(),
  totalPages: z.number().int(),
});

export const GetRentalByIdRequestSchema = z.object({
  rentalId: z.string().uuid(),
});

export const GetAllRentalsRequestSchema = z
  .object({
    status: z.string(),
    userId: z.string().uuid(),
    requesterId: z.string().uuid(),
  })
  .extend(PaginationQuerySchema.shape);

export const AdminRentalSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  userName: z.string(),
  userEmail: z.string(),
  items: z.array(
    z.object({
      targetId: z.string().uuid(),
      isCombo: z.boolean(),
      quantity: z.number().int().min(1),
      name: z.string(),
      unitPrice: z.number().min(0),
      subtotal: z.number().min(0),
      detail: z.any(),
    })
  ),
  totalPrice: z.number().min(0),
  maxDiscount: z.number().min(0),
  status: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  createdAt: z.string(),
  discountPercent: z.number().min(0).max(100),
});

export const GetAllRentalsAdminResponseSchema = z.object({
  rentals: z.array(AdminRentalSchema),
  page: z.number().int(),
  limit: z.number().int(),
  totalItems: z.number().int(),
  totalPages: z.number().int(),
});

export const CancelRentalRequestSchema = z.object({
  rentalId: z.string().uuid(),
  userId: z.string().uuid(),
});

export const CancelRentalResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  refund_amount: z.number().min(0),
  refund_percent: z.number().min(0).max(100),
});

export const UpdateRentalRequestSchema = z.object({
  rentalId: z.string().uuid(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const DeleteRentalRequestSchema = z.object({
  rentalId: z.string().uuid(),
});

export const DeleteRentalResponseSchema = z.object({
  message: z.string(),
});

// Rental Extension models
export const CreateRentalExtensionRequestSchema = z.object({
  rentalId: z.string().uuid(),
  requestedBy: z.string().uuid(),
  newEndDate: z.string(),
  additionalFee: z.number().min(0),
  additionalHours: z.number().min(0),
  notes: z.string().optional(),
});

export const GetRentalExtensionsRequestSchema = z.object({
  rentalId: z.string().uuid(),
});

export const GetRentalExtensionsResponseSchema = z.object({
  extensions: z.array(RentalExtensionValidatorSchema),
});

// Rental types
export type CreateRentalRequest = z.infer<typeof CreateRentalRequestSchema>;
export type RentalResponse = z.infer<typeof RentalResponseSchema>;
export type GetMyRentalsRequest = z.infer<typeof GetMyRentalsRequestSchema>;
export type GetMyRentalsResponse = z.infer<typeof GetMyRentalsResponseSchema>;
export type GetRentalByIdRequest = z.infer<typeof GetRentalByIdRequestSchema>;
export type GetAllRentalsRequest = z.infer<typeof GetAllRentalsRequestSchema>;
export type GetAllRentalsAdminResponse = z.infer<
  typeof GetAllRentalsAdminResponseSchema
>;
export type CancelRentalRequest = z.infer<typeof CancelRentalRequestSchema>;
export type CancelRentalResponse = z.infer<typeof CancelRentalResponseSchema>;
export type UpdateRentalRequest = z.infer<typeof UpdateRentalRequestSchema>;
export type DeleteRentalRequest = z.infer<typeof DeleteRentalRequestSchema>;
export type DeleteRentalResponse = z.infer<typeof DeleteRentalResponseSchema>;

// Rental Extension types
export type CreateRentalExtensionRequest = z.infer<
  typeof CreateRentalExtensionRequestSchema
>;
export type GetRentalExtensionsRequest = z.infer<
  typeof GetRentalExtensionsRequestSchema
>;
export type GetRentalExtensionsResponse = z.infer<
  typeof GetRentalExtensionsResponseSchema
>;
