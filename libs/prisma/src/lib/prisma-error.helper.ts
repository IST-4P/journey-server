/**
 * Interface cho Prisma Known Request Error
 * Sử dụng để type check mà không cần import từ @prisma/client
 */
export interface PrismaKnownRequestError extends Error {
  code: string;
  meta?: Record<string, any>;
  clientVersion: string;
}

/**
 * Kiểm tra lỗi unique constraint của Prisma (P2002)
 * @param error - Error object cần kiểm tra
 * @returns true nếu là lỗi unique constraint
 * @example
 * ```ts
 * try {
 *   await prisma.user.create({ data: { email: 'existing@example.com' } });
 * } catch (error) {
 *   if (isUniqueConstraintPrismaError(error)) {
 *     throw new ConflictException('Email already exists');
 *   }
 * }
 * ```
 */
export function isUniqueConstraintPrismaError(
  error: any
): error is PrismaKnownRequestError {
  return (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === 'P2002'
  );
}

/**
 * Kiểm tra lỗi not found của Prisma (P2025)
 * @param error - Error object cần kiểm tra
 * @returns true nếu là lỗi not found
 * @example
 * ```ts
 * try {
 *   await prisma.user.delete({ where: { id: 'non-existent' } });
 * } catch (error) {
 *   if (isNotFoundPrismaError(error)) {
 *     throw new NotFoundException('User not found');
 *   }
 * }
 * ```
 */
export function isNotFoundPrismaError(
  error: any
): error is PrismaKnownRequestError {
  return (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === 'P2025'
  );
}

/**
 * Kiểm tra lỗi foreign key constraint của Prisma (P2003)
 * @param error - Error object cần kiểm tra
 * @returns true nếu là lỗi foreign key constraint
 * @example
 * ```ts
 * try {
 *   await prisma.order.create({ data: { userId: 'invalid-user-id' } });
 * } catch (error) {
 *   if (isForeignKeyConstraintPrismaError(error)) {
 *     throw new BadRequestException('Invalid user reference');
 *   }
 * }
 * ```
 */
export function isForeignKeyConstraintPrismaError(
  error: any
): error is PrismaKnownRequestError {
  return (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === 'P2003'
  );
}
