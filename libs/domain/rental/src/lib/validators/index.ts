import { z } from 'zod';
import { RentalStatusEnum } from '../enums';

export const RentalItemValidatorSchema = z.object({
  targetId: z.string().uuid(),
  isCombo: z.boolean(),
  quantity: z.number().int().min(1),
});

export const RentalTargetDetailValidatorSchema = z.union([
  z.object({
    device: z.object({
      id: z.string().uuid(),
      name: z.string(),
      price: z.number().min(0),
      description: z.string(),
      status: z.string(),
      quantity: z.number().int(),
      information: z.array(z.string()),
      images: z.array(z.string()),
      categoryId: z.string().uuid(),
      categoryName: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
  }),
  z.object({
    combo: z.object({
      id: z.string().uuid(),
      name: z.string(),
      price: z.number().min(0),
      description: z.string(),
      images: z.array(z.string()),
      devices: z.array(
        z.object({
          deviceId: z.string().uuid(),
          deviceName: z.string(),
          devicePrice: z.number().min(0),
          quantity: z.number().int().min(1),
        })
      ),
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
  }),
]);

export const RentalItemDetailValidatorSchema = z.object({
  targetId: z.string().uuid(),
  isCombo: z.boolean(),
  quantity: z.number().int().min(1),
  name: z.string(),
  unitPrice: z.number().min(0),
  subtotal: z.number().min(0),
  detail: RentalTargetDetailValidatorSchema,
});

export const RentalValidatorSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  items: z.array(RentalItemDetailValidatorSchema),
  status: RentalStatusEnum,
  rentalFee: z.number().min(0),
  deposit: z.number().min(0),
  maxDiscount: z.number().min(0),
  totalPrice: z.number().min(0),
  totalQuantity: z.number().int().min(0),
  VAT: z.number().min(0),
  startDate: z.string(),
  endDate: z.string(),
  createdAt: z.string(),
  actualEndDate: z.string().optional(),
  discountPercent: z.number().min(0).max(100),
});

export const RentalExtensionValidatorSchema = z.object({
  id: z.string().uuid(),
  rentalId: z.string().uuid(),
  newEndDate: z.string(),
  additionalFee: z.number().min(0),
  additionalHours: z.number().min(0),
  requestedBy: z.string().uuid(),
  createdAt: z.string(),
  notes: z.string().optional(),
});

export type RentalItemValidator = z.infer<typeof RentalItemValidatorSchema>;
export type RentalTargetDetailValidator = z.infer<
  typeof RentalTargetDetailValidatorSchema
>;
export type RentalItemDetailValidator = z.infer<
  typeof RentalItemDetailValidatorSchema
>;
export type RentalValidator = z.infer<typeof RentalValidatorSchema>;
export type RentalExtensionValidator = z.infer<
  typeof RentalExtensionValidatorSchema
>;
