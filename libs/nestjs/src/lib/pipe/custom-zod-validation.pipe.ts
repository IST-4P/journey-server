import { BadRequestException } from '@nestjs/common';
import { createZodValidationPipe } from 'nestjs-zod';
import { ZodError } from 'zod';

// For HTTP REST API
export const CustomZodValidationPipe = createZodValidationPipe({
  createValidationException: (error: ZodError) => {
    return new BadRequestException({
      message: error.issues[0]?.message || 'Error.Validation',
    });
  },
});
