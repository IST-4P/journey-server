import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Parse exception response
    let message = 'An error occurred';
    let data: any = null;

    if (typeof exceptionResponse === 'object') {
      const responseObj = exceptionResponse as any;

      // Nếu message là array (custom exceptions)
      if (Array.isArray(responseObj.message)) {
        // Lấy message đầu tiên trong array
        const firstError = responseObj.message[0];
        if (typeof firstError === 'object' && firstError.message) {
          message = firstError.message;
          data = responseObj.message; // Giữ lại toàn bộ array errors
        } else if (typeof firstError === 'string') {
          message = firstError;
          data = responseObj.message;
        }
      }
      // Nếu message là string
      else if (typeof responseObj.message === 'string') {
        message = responseObj.message;
      }
      // Nếu có error field (default NestJS)
      else if (responseObj.error) {
        message = responseObj.error;
      }
    } else if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    }

    // Response format chuẩn
    response.status(status).json({
      data: data || {},
      message,
      statusCode: status,
    });
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    response.status(status).json({
      data: {},
      message,
      statusCode: status,
    });
  }
}
