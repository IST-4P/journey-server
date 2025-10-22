import { createZodDto } from 'nestjs-zod';
import {
  CreateFeatureRequestSchema,
  DeleteFeatureRequestSchema,
  GetAllFeaturesResponseSchema,
  GetFeatureRequestSchema,
  GetFeatureResponseSchema,
  UpdateFeatureRequestSchema,
} from '../models';

export class GetFeatureRequestDTO extends createZodDto(
  GetFeatureRequestSchema
) {}

export class GetFeatureResponseDTO extends createZodDto(
  GetFeatureResponseSchema
) {}

export class GetAllFeaturesResponseDTO extends createZodDto(
  GetAllFeaturesResponseSchema
) {}

export class CreateFeatureRequestDTO extends createZodDto(
  CreateFeatureRequestSchema
) {}

export class UpdateFeatureRequestDTO extends createZodDto(
  UpdateFeatureRequestSchema.omit({ id: true })
) {}

export class DeleteFeatureRequestDTO extends createZodDto(
  DeleteFeatureRequestSchema
) {}
