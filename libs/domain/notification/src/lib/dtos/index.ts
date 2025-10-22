import { createZodDto } from 'nestjs-zod';
import {
  CreateNotificationRequestSchema,
  DeleteNotificationRequestSchema,
  GetManyNotificationsRequestSchema,
  GetManyNotificationsResponseSchema,
  GetNotificationRequestSchema,
  GetNotificationResponseSchema,
  MarkAsReadRequestSchema,
} from '../models';

export class GetNotificationRequestDTO extends createZodDto(
  GetNotificationRequestSchema
) {}

export class GetNotificationResponseDTO extends createZodDto(
  GetNotificationResponseSchema
) {}

export class GetManyNotificationsRequestDTO extends createZodDto(
  GetManyNotificationsRequestSchema
) {}

export class GetManyNotificationsResponseDTO extends createZodDto(
  GetManyNotificationsResponseSchema
) {}

export class CreateNotificationRequestDTO extends createZodDto(
  CreateNotificationRequestSchema
) {}

export class DeleteNotificationRequestDTO extends createZodDto(
  DeleteNotificationRequestSchema
) {}

export class MarkAsReadRequestDTO extends createZodDto(
  MarkAsReadRequestSchema
) {}
