import {
  AdminDeleteReviewRequestDTO,
  GetAllReviewsRequestDTO,
  GetReviewByIdRequestDTO,
  GetReviewsByComboRequestDTO,
  GetReviewsByDeviceRequestDTO,
  GetReviewsByVehicleRequestDTO,
  UpdateReviewRequestDTO,
} from '@domain/review';
import { ActiveUser, Auth, AuthType } from '@hacmieu-journey/nestjs';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { ReviewService } from './review.service';

@Controller('review')
export class ReviewController {
  // private readonly logger = new Logger(ReviewController.name);

  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  @Auth([AuthType.Admin])
  getAllReviews(
    @Query() query: GetAllReviewsRequestDTO,
    @ActiveUser('userId') userId: string
  ) {
    return this.reviewService.getAllReviews({
      ...query,
      adminId: userId,
    } as any);
  }

  @Get(':id')
  @Auth([AuthType.Admin])
  getReviewById(@Param() query: GetReviewByIdRequestDTO) {
    return this.reviewService.getReviewById(query);
  }

  @Put()
  @Auth([AuthType.Admin])
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
  @Auth([AuthType.Admin])
  deleteReview(
    @Param() params: Omit<AdminDeleteReviewRequestDTO, 'adminId'>,
    @ActiveUser('userId') userId: string
  ) {
    return this.reviewService.adminDeleteReview({
      reviewId: params.reviewId,
      adminId: userId,
    });
  }

  @Get('vehicle/:vehicleId')
  @Auth([AuthType.Admin])
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
  @Auth([AuthType.Admin])
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
  @Auth([AuthType.Admin])
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
