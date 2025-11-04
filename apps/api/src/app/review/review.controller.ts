import {
  CreateReviewRequestDTO,
  DeleteReviewRequestDTO,
  GetMyReviewsRequestDTO,
  GetReviewByIdRequestDTO,
  GetReviewsByComboRequestDTO,
  GetReviewsByDeviceRequestDTO,
  GetReviewsByVehicleRequestDTO,
  UpdateReviewRequestDTO,
} from '@domain/review';
import { ActiveUser } from '@hacmieu-journey/nestjs';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ReviewService } from './review.service';

@Controller('review')
export class ReviewController {
  // private readonly logger = new Logger(ReviewController.name);

  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  getMyReviews(
    @Query() query: Omit<GetMyReviewsRequestDTO, 'userId'>,
    @ActiveUser('userId') userId: string
  ) {
    return this.reviewService.getMyReviews({ ...query, userId });
  }

  @Get(':reviewId')
  getReviewById(@Param() params: GetReviewByIdRequestDTO) {
    return this.reviewService.getReviewById(params);
  }

  @Post()
  createReview(
    @Body() body: Omit<CreateReviewRequestDTO, 'userId'>,
    @ActiveUser('userId') userId: string
  ) {
    return this.reviewService.createReview({
      ...body,
      type: body.type as any, // Any is the best
      userId,
    });
  }

  @Put()
  updateReview(
    @Body() body: Omit<UpdateReviewRequestDTO, 'userId'>,
    @ActiveUser('userId') userId: string
  ) {
    return this.reviewService.updateReview({
      ...body,
      userId,
    });
  }

  @Delete(':id')
  deleteReview(
    @Param() params: Omit<DeleteReviewRequestDTO, 'userId'>,
    @ActiveUser('userId') userId: string
  ) {
    return this.reviewService.deleteReview({
      reviewId: params.reviewId,
      userId,
    });
  }

  @Get('vehicle/:vehicleId')
  getReviewsByVehicle(
    @Param('vehicleId') vehicleId: string,
    @Query() query: Omit<GetReviewsByVehicleRequestDTO, 'vehicleId'>
  ) {
    return this.reviewService.getReviewsByVehicle({
      ...query,
      vehicleId,
    });
  }

  @Get('combo/:comboId')
  getReviewsByCombo(
    @Param('comboId') comboId: string,
    @Query() query: Omit<GetReviewsByComboRequestDTO, 'comboId'>
  ) {
    return this.reviewService.getReviewsByCombo({
      ...query,
      comboId,
    });
  }

  @Get('device/:deviceId')
  getReviewsByDevice(
    @Param('deviceId') deviceId: string,
    @Query() query: Omit<GetReviewsByDeviceRequestDTO, 'deviceId'>
  ) {
    return this.reviewService.getReviewsByDevice({
      ...query,
      deviceId,
    });
  }
}
