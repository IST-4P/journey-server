import { createZodDto } from 'nestjs-zod';
import {
  AdminDeleteReviewRequestSchema,
  CreateReviewRequestSchema,
  DeleteReviewRequestSchema,
  DeleteReviewResponseSchema,
  GetAllReviewsRequestSchema,
  GetMyReviewsRequestSchema,
  GetMyReviewsResponseSchema,
  GetReviewByIdRequestSchema,
  GetReviewsByComboRequestSchema,
  GetReviewsByDeviceRequestSchema,
  GetReviewsByVehicleRequestSchema,
  GetReviewsResponseSchema,
  ReviewResponseSchema,
  UpdateReviewRequestSchema,
} from '../models';

// Review DTOs
export class CreateReviewRequestDTO extends createZodDto(
  CreateReviewRequestSchema
) {}
export class UpdateReviewRequestDTO extends createZodDto(
  UpdateReviewRequestSchema
) {}
export class DeleteReviewRequestDTO extends createZodDto(
  DeleteReviewRequestSchema
) {}
export class GetReviewByIdRequestDTO extends createZodDto(
  GetReviewByIdRequestSchema
) {}
export class GetMyReviewsRequestDTO extends createZodDto(
  GetMyReviewsRequestSchema
) {}
export class GetReviewsByVehicleRequestDTO extends createZodDto(
  GetReviewsByVehicleRequestSchema
) {}
export class GetReviewsByDeviceRequestDTO extends createZodDto(
  GetReviewsByDeviceRequestSchema
) {}
export class GetReviewsByComboRequestDTO extends createZodDto(
  GetReviewsByComboRequestSchema
) {}
export class GetAllReviewsRequestDTO extends createZodDto(
  GetAllReviewsRequestSchema
) {}
export class AdminDeleteReviewRequestDTO extends createZodDto(
  AdminDeleteReviewRequestSchema
) {}
export class ReviewResponseDTO extends createZodDto(ReviewResponseSchema) {}
export class GetReviewsResponseDTO extends createZodDto(
  GetReviewsResponseSchema
) {}
export class GetMyReviewsResponseDTO extends createZodDto(
  GetMyReviewsResponseSchema
) {}
export class DeleteReviewResponseDTO extends createZodDto(
  DeleteReviewResponseSchema
) {}
