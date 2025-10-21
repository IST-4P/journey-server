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

        // Format dates trong data trước khi xử lý
        const formattedData = this.formatDates(data);

        // Nếu data đã là StandardResponse format
        if (this.isStandardResponse(formattedData)) {
          return formattedData;
        }

        // Nếu data có message và có thể có data field
        if (
          formattedData &&
          typeof formattedData === 'object' &&
          'message' in formattedData
        ) {
          const { message, data: innerData, ...rest } = formattedData;
          const responseData = innerData !== undefined ? innerData : rest;

          return {
            data: Object.keys(responseData).length > 0 ? responseData : {},
            message: message as string,
            statusCode,
          };
        }

        // Trường hợp còn lại
        return {
          data: formattedData || {},
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

  /**
   * Recursively format all Date objects and date strings to ISO format
   */
  private formatDates(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    // Case 1: Date object
    if (obj instanceof Date) {
      return this.toISOStringHighPrecision(obj);
    }

    // Case 2: Date string pattern (từ Prisma hoặc JSON serialization)
    if (typeof obj === 'string' && this.isDateString(obj)) {
      const date = new Date(obj);
      if (!isNaN(date.getTime())) {
        return this.toISOStringHighPrecision(date);
      }
    }

    // Case 3: Array
    if (Array.isArray(obj)) {
      return obj.map((item) => this.formatDates(item));
    }

    // Case 4: Plain Object
    if (typeof obj === 'object' && obj.constructor === Object) {
      const formatted: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          formatted[key] = this.formatDates(obj[key]);
        }
      }
      return formatted;
    }

    // Case 5: Other types
    return obj;
  }

  /**
   * Check if string matches common date patterns
   */
  private isDateString(value: string): boolean {
    // Chỉ check các field thường là date
    // Pattern 1: ISO 8601 - 2025-10-21T14:51:26.051Z
    // Pattern 2: ISO with timezone - 2025-10-21T14:51:26+07:00
    // Pattern 3: Date string from JS - Tue Oct 21 2025...
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO format
      /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s\w{3}\s\d{1,2}\s\d{4}/, // JS Date toString
    ];

    return datePatterns.some((pattern) => pattern.test(value));
  }

  /**
   * Format Date to ISO string with 7-digit milliseconds
   */
  private toISOStringHighPrecision(date: Date): string {
    const iso = date.toISOString();
    const [dateTimePart, millisAndZ] = iso.split('.');
    const millis = millisAndZ.replace('Z', '').padEnd(7, '0');
    return `${dateTimePart}.${millis}Z`;
  }
}
