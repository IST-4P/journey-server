// grpc-exception.filter.ts
import { status as GrpcStatus } from '@grpc/grpc-js';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

// Custom decorator để catch gRPC errors
@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
  private readonly grpcToHttpStatusMap = {
    [GrpcStatus.OK]: HttpStatus.OK,
    [GrpcStatus.CANCELLED]: 499,
    [GrpcStatus.UNKNOWN]: HttpStatus.INTERNAL_SERVER_ERROR,
    [GrpcStatus.INVALID_ARGUMENT]: HttpStatus.BAD_REQUEST,
    [GrpcStatus.DEADLINE_EXCEEDED]: HttpStatus.GATEWAY_TIMEOUT,
    [GrpcStatus.NOT_FOUND]: HttpStatus.NOT_FOUND,
    [GrpcStatus.ALREADY_EXISTS]: HttpStatus.CONFLICT,
    [GrpcStatus.PERMISSION_DENIED]: HttpStatus.FORBIDDEN,
    [GrpcStatus.RESOURCE_EXHAUSTED]: HttpStatus.TOO_MANY_REQUESTS,
    [GrpcStatus.FAILED_PRECONDITION]: HttpStatus.PRECONDITION_FAILED,
    [GrpcStatus.ABORTED]: HttpStatus.CONFLICT,
    [GrpcStatus.OUT_OF_RANGE]: HttpStatus.BAD_REQUEST,
    [GrpcStatus.UNIMPLEMENTED]: HttpStatus.NOT_IMPLEMENTED,
    [GrpcStatus.INTERNAL]: HttpStatus.INTERNAL_SERVER_ERROR,
    [GrpcStatus.UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
    [GrpcStatus.DATA_LOSS]: HttpStatus.INTERNAL_SERVER_ERROR,
    [GrpcStatus.UNAUTHENTICATED]: HttpStatus.UNAUTHORIZED,
  };

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Chỉ xử lý gRPC errors (có thuộc tính code)
    if (
      exception.code !== undefined &&
      typeof exception.code === 'number' &&
      this.grpcToHttpStatusMap[exception.code as GrpcStatus]
    ) {
      const status = this.grpcToHttpStatusMap[exception.code as GrpcStatus];
      const message = exception.details || 'An error occurred';

      return response.status(status).json({
        data: {},
        message,
        statusCode: status,
      });
    }

    // Để các lỗi khác cho filter khác xử lý
    throw exception;
  }
}
