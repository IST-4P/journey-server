using rental.Model.Entities;
using System.Text.Json;

namespace rental.Service
{
    public static class RentalCalculationHelper
    {
        public const double VAT_PERCENT = 10.0;
        public const double DEPOSIT_PERCENT = 20.0; // 20% of item price * quantity

        public static double CalculateDiscountAmount(double rentalFee, double discountPercent, double maxDiscount)
        {
            double calculatedDiscount = rentalFee * (discountPercent / 100.0);
            return Math.Min(calculatedDiscount, maxDiscount);
        }

        // Calculate deposit based on individual item prices and quantities
        public static double CalculateDepositForItems(List<(double unitPrice, int quantity)> items)
        {
            double totalItemValue = 0;
            foreach (var item in items)
            {
                totalItemValue += item.unitPrice * item.quantity;
            }
            return totalItemValue * (DEPOSIT_PERCENT / 100.0);
        }
        public static double CalculateTotalPrice(double rentalFee, double discountAmount, double deposit)
        {
            double subtotal = rentalFee - discountAmount + deposit;
            double totalWithVAT = subtotal * (1 + VAT_PERCENT / 100.0);
            return totalWithVAT;
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
