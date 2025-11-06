using rental.Model.Entities;
using System.Text.Json;

namespace rental.Service
{
    public static class RentalCalculationHelper
    {
        public const double VAT_PERCENT = 10.0; // VAT 10%
        public const double DEPOSIT_PERCENT = 20.0; // 20% of total price (paid upfront)

        public static double CalculateDiscountAmount(double rentalFee, double discountPercent, double maxDiscount)
        {
            double calculatedDiscount = rentalFee * (discountPercent / 100.0);
            return Math.Min(calculatedDiscount, maxDiscount);
        }

        // TotalPrice = (RentalFee - Discount) × 1.1 (including VAT)
        public static double CalculateTotalPrice(double rentalFee, double discountAmount)
        {
            double amountAfterDiscount = rentalFee - discountAmount;
            return amountAfterDiscount * (1 + VAT_PERCENT / 100.0);
        }

        // Calculate deposit: 20% of total price (paid upfront)
        public static double CalculateDeposit(double totalPrice)
        {
            return totalPrice * (DEPOSIT_PERCENT / 100.0);
        }

        // Calculate remaining amount: 80% of total price (paid on pickup)
        public static double CalculateRemainingAmount(double totalPrice)
        {
            return totalPrice * ((100.0 - DEPOSIT_PERCENT) / 100.0);
        }

        public static double CalculateRefundPercent(DateTime startDate, DateTime cancelDate)
        {
            var daysBefore = (startDate - cancelDate).TotalDays;

            if (daysBefore >= 7)
                return 100;
            else if (daysBefore >= 3)
                return 50;
            else
                return 0;
        }

        public static double CalculateRefundAmount(double deposit, double refundPercent)
        {
            return deposit * (refundPercent / 100.0);
        }
    }
}
