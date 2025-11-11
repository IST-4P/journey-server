import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

interface VehiclePrice {
  vehicleFeeDay: number;
  vehicleFeeHour: number;
  insuranceFeePercent: number;
  vatPercent: number;
  deposit: number;
  hours: number;
}

export const calculateDuration = (startTime: Date, endTime: Date): number => {
  startTime = new Date(startTime);
  endTime = new Date(endTime);
  console.log('startTime: ', startTime);
  console.log('endTime: ', endTime);
  if (endTime <= startTime) {
    throw new RpcException({
      code: status.INVALID_ARGUMENT,
      message: 'Error.BookingTimeInvalid',
    });
  }
  endTime = new Date(endTime);
  startTime = new Date(startTime);
  const diffMs: number = endTime.getTime() - startTime.getTime();
  const diffHours: number = diffMs / (1000 * 60 * 60);

  return diffHours;
};

export const calculateRefundPercentage = (
  cancelDate: Date,
  startDate: Date
): number => {
  // Chuyển đổi sang Date object nếu là string
  const cancel = new Date(cancelDate);
  const start = new Date(startDate);

  // Reset time về đầu ngày để so sánh chính xác số ngày
  cancel.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);

  // Tính số ngày chênh lệch
  const diffTime = start.getTime() - cancel.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Áp dụng chính sách hoàn tiền
  if (diffDays > 10) {
    return 100; // Hoàn 100% nếu hủy trước > 10 ngày
  } else if (diffDays > 5) {
    return 30; // Hoàn 30% nếu hủy trước > 5 ngày
  } else {
    return 0; // Không hoàn tiền nếu hủy trong vòng 5 ngày
  }
};

export const convertHoursToDaysAndHours = (
  totalHours: number
): {
  days: number;
  hours: number;
  totalHours: number;
} => {
  const days = Math.floor(totalHours / 24);
  const remainingHours = totalHours % 24;

  return {
    days,
    hours: remainingHours,
    totalHours,
  };
};

export const calculateVehiclePrice = (data: VehiclePrice) => {
  const durationDayAndHours = convertHoursToDaysAndHours(data.hours);

  const rentalFee = Math.round(
    durationDayAndHours.days * data.vehicleFeeDay +
      durationDayAndHours.hours * data.vehicleFeeHour
  );

  const insuranceFee = Math.round(rentalFee * data.insuranceFeePercent);

  const vatAmount = Math.round((rentalFee + insuranceFee) * data.vatPercent);

  const totalAmount =
    Math.round(rentalFee + insuranceFee + vatAmount) + Number(data.deposit); // Tổng cộng bao gồm VAT 10%

  return {
    rentalFee,
    insuranceFee,
    totalAmount,
    vat: vatAmount,
  };
};
