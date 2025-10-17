// http-exception.filter.ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = 'An error occurred';
    let data: any = null;

    if (typeof exceptionResponse === 'object') {
      const responseObj = exceptionResponse as any;

      if (Array.isArray(responseObj.message)) {
        const firstError = responseObj.message[0];
        if (typeof firstError === 'object' && firstError.message) {
          message = firstError.message;
          data = responseObj.message;
        } else if (typeof firstError === 'string') {
          message = firstError;
          data = responseObj.message;
        }
      } else if (typeof responseObj.message === 'string') {
        message = responseObj.message;
      } else if (responseObj.error) {
        message = responseObj.error;
      }
    } else if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    }

    response.status(status).json({
      data: data || {},
      message,
      statusCode: status,
    });
  }
}
