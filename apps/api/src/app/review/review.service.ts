import { BookingStatusValues } from '@domain/booking';
import { RentalStatusValues } from '@domain/rental';
import { BookingProto, RentalProto, ReviewProto } from '@hacmieu-journey/grpc';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ReviewService implements OnModuleInit {
  private reviewService!: ReviewProto.ReviewServiceClient;
  private bookingService!: BookingProto.BookingServiceClient;
  private rentalService!: RentalProto.RentalServiceClient;

  constructor(
    @Inject(ReviewProto.REVIEW_PACKAGE_NAME)
    private reviewClient: ClientGrpc,
    @Inject(BookingProto.BOOKING_PACKAGE_NAME)
    private bookingClient: ClientGrpc,
    @Inject(RentalProto.RENTAL_PACKAGE_NAME)
    private rentalClient: ClientGrpc
  ) {}

  onModuleInit() {
    this.reviewService =
      this.reviewClient.getService<ReviewProto.ReviewServiceClient>(
        ReviewProto.REVIEW_SERVICE_NAME
      );
    this.bookingService =
      this.bookingClient.getService<BookingProto.BookingServiceClient>(
        BookingProto.BOOKING_SERVICE_NAME
      );
    this.rentalService =
      this.rentalClient.getService<RentalProto.RentalServiceClient>(
        RentalProto.RENTAL_SERVICE_NAME
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

  async createReview(
    data: ReviewProto.CreateReviewRequest
  ): Promise<ReviewProto.ReviewResponse> {
    if (data.bookingId) {
      const booking = await lastValueFrom(
        this.bookingService.getBooking({ id: data.bookingId })
      );
      if (booking.status !== BookingStatusValues.COMPLETED) {
        throw new Error('Cannot review a booking that is not completed');
      }
      data.vehicleId = booking.vehicleId;
    } else if (data.rentalId) {
      const rental = await lastValueFrom(
        this.rentalService.getRentalById({ rentalId: data.rentalId })
      );

      if (rental.status !== RentalStatusValues.COMPLETED) {
        throw new Error('Cannot review a rental that is not completed');
      }
    }
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
