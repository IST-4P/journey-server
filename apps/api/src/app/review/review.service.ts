import { ReviewProto } from '@hacmieu-journey/grpc';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ReviewService implements OnModuleInit {
  private reviewService!: ReviewProto.ReviewServiceClient;

  constructor(
    @Inject(ReviewProto.REVIEW_PACKAGE_NAME) private client: ClientGrpc
  ) {}

  onModuleInit() {
    this.reviewService =
      this.client.getService<ReviewProto.ReviewServiceClient>(
        ReviewProto.REVIEW_SERVICE_NAME
      );
  }

  getMyReviews(
    data: ReviewProto.GetMyReviewsRequest
  ): Promise<ReviewProto.GetMyReviewsResponse> {
    return lastValueFrom(this.reviewService.getMyReviews(data));
  }

  getReviewById(
    data: ReviewProto.GetReviewByIdRequest
  ): Promise<ReviewProto.ReviewResponse> {
    return lastValueFrom(this.reviewService.getReviewById(data));
  }

  createReview(
    data: ReviewProto.CreateReviewRequest
  ): Promise<ReviewProto.ReviewResponse> {
    return lastValueFrom(this.reviewService.createReview(data));
  }

  updateReview(
    data: ReviewProto.UpdateReviewRequest
  ): Promise<ReviewProto.ReviewResponse> {
    return lastValueFrom(this.reviewService.updateReview(data));
  }

  deleteReview(
    data: ReviewProto.DeleteReviewRequest
  ): Promise<ReviewProto.DeleteReviewResponse> {
    return lastValueFrom(this.reviewService.deleteReview(data));
  }

  getReviewsByVehicle(
    data: ReviewProto.GetReviewsByVehicleRequest
  ): Promise<ReviewProto.GetReviewsResponse> {
    return lastValueFrom(this.reviewService.getReviewsByVehicle(data));
  }

  getReviewsByDevice(
    data: ReviewProto.GetReviewsByDeviceRequest
  ): Promise<ReviewProto.GetReviewsResponse> {
    return lastValueFrom(this.reviewService.getReviewsByDevice(data));
  }

  getReviewsByCombo(
    data: ReviewProto.GetReviewsByComboRequest
  ): Promise<ReviewProto.GetReviewsResponse> {
    return lastValueFrom(this.reviewService.getReviewsByCombo(data));
  }
}
