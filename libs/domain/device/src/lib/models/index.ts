import { PaginationQuerySchema } from '@domain/shared';
import { z } from 'zod';
import {
  ComboDeviceItemValidatorSchema,
  ComboValidatorSchema,
  DeviceValidatorSchema,
} from '../validators';

// Device models
export const GetDeviceRequestSchema = z.object({
  deviceId: z.string().uuid(),
});

export const GetDeviceResponseSchema = DeviceValidatorSchema;

export const GetManyDevicesRequestSchema = z
  .object({
    status: z.string(),
    search: z.string(),
    categoryId: z.string().uuid(),
  })
  .partial()
  .extend(PaginationQuerySchema.shape);

export const GetManyDevicesResponseSchema = z.object({
  devices: z.array(DeviceValidatorSchema.omit({ categoryId: true })),
  page: z.number().int(),
  limit: z.number().int(),
  totalItems: z.number().int(),
  totalPages: z.number().int(),
});

export const GetManyDevicesAdminRequestSchema = GetManyDevicesRequestSchema;

export const GetManyDevicesAdminResponseSchema = z.object({
  devices: z.array(DeviceValidatorSchema),
  page: z.number().int(),
  limit: z.number().int(),
  totalItems: z.number().int(),
  totalPages: z.number().int(),
});

export const CreateDeviceRequestSchema = DeviceValidatorSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateDeviceRequestSchema = DeviceValidatorSchema.omit({
  createdAt: true,
  updatedAt: true,
})
  .partial()
  .extend({
    deviceId: z.string().uuid(),
    images: z.array(z.string()),
    information: z.array(z.string()),
  });

export const DeleteDeviceRequestSchema = z.object({
  deviceId: z.string().uuid(),
});

export const DeleteDeviceResponseSchema = z.object({
  message: z.string(),
});

// Combo models
export const GetComboRequestSchema = z.object({
  comboId: z.string().uuid(),
});

export const GetComboResponseSchema = ComboValidatorSchema;

export const GetManyCombosRequestSchema = z
  .object({
    search: z.string().optional(),
  })
  .extend(PaginationQuerySchema.shape);

export const GetManyCombosResponseSchema = z.object({
  combos: z.array(
    ComboValidatorSchema.omit({ devices: true }).extend({
      deviceCount: z.number().int(),
    })
  ),
  page: z.number().int(),
  limit: z.number().int(),
  totalItems: z.number().int(),
  totalPages: z.number().int(),
});

export const CreateComboRequestSchema = ComboValidatorSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  devices: true,
}).extend({
  deviceItems: z.array(ComboDeviceItemValidatorSchema),
});

export const UpdateComboRequestSchema = ComboValidatorSchema.omit({
  createdAt: true,
  updatedAt: true,
  devices: true,
})
  .partial()
  .extend({
    deviceItems: z.array(ComboDeviceItemValidatorSchema),
    images: z.array(z.string()),
    comboId: z.string().uuid(),
  });

export const DeleteComboRequestSchema = z.object({
  comboId: z.string().uuid(),
});

export const DeleteComboResponseSchema = z.object({
  message: z.string(),
});

// Device types
export type GetDeviceRequest = z.infer<typeof GetDeviceRequestSchema>;
export type GetDeviceResponse = z.infer<typeof GetDeviceResponseSchema>;
export type GetManyDevicesRequest = z.infer<typeof GetManyDevicesRequestSchema>;
export type GetManyDevicesResponse = z.infer<
  typeof GetManyDevicesResponseSchema
>;
export type GetManyDevicesAdminRequest = z.infer<
  typeof GetManyDevicesAdminRequestSchema
>;
export type GetManyDevicesAdminResponse = z.infer<
  typeof GetManyDevicesAdminResponseSchema
>;
export type CreateDeviceRequest = z.infer<typeof CreateDeviceRequestSchema>;
export type UpdateDeviceRequest = z.infer<typeof UpdateDeviceRequestSchema>;
export type DeleteDeviceRequest = z.infer<typeof DeleteDeviceRequestSchema>;
export type DeleteDeviceResponse = z.infer<typeof DeleteDeviceResponseSchema>;

// Combo types
export type GetComboRequest = z.infer<typeof GetComboRequestSchema>;
export type GetComboResponse = z.infer<typeof GetComboResponseSchema>;
export type GetManyCombosRequest = z.infer<typeof GetManyCombosRequestSchema>;
export type GetManyCombosResponse = z.infer<typeof GetManyCombosResponseSchema>;
export type CreateComboRequest = z.infer<typeof CreateComboRequestSchema>;
export type UpdateComboRequest = z.infer<typeof UpdateComboRequestSchema>;
export type DeleteComboRequest = z.infer<typeof DeleteComboRequestSchema>;
export type DeleteComboResponse = z.infer<typeof DeleteComboResponseSchema>;
