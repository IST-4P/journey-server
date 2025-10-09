import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T = any> {
  data: T;
  message: string;
  statusCode: number;
}

// Response Interceptor để format response thống nhất
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<StandardResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;

        // Nếu data đã là StandardResponse format (có đầy đủ 3 fields) thì trả về luôn
        if (this.isStandardResponse(data)) {
          return data;
        }

        // Nếu data có message và có thể có data field
        if (data && typeof data === 'object' && 'message' in data) {
          // Nếu có field data riêng thì dùng nó, không thì dùng toàn bộ object trừ message
          const { message, data: innerData, ...rest } = data;
          const responseData = innerData !== undefined ? innerData : rest;

          return {
            data: Object.keys(responseData).length > 0 ? responseData : {},
            message: message as string,
            statusCode,
          };
        }

        // Trường hợp còn lại: wrap data thành standard format
        return {
          data: data || {},
          message: 'Success',
          statusCode,
        };
      })
    );
  }

  private isStandardResponse(data: any): data is StandardResponse {
    return (
      data &&
      typeof data === 'object' &&
      'data' in data &&
      'message' in data &&
      'statusCode' in data
    );
  }
}
