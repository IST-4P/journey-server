using rental.Model.Entities;

namespace rental.Service
{
    public static class RentalCalculationHelper
    {
        public const double VAT_PERCENT = 10.0;

        public static double CalculateDiscountAmount(double rentalFee, double discountPercent, double maxDiscount)
        {
            double calculatedDiscount = rentalFee * (discountPercent / 100.0);
            return Math.Min(calculatedDiscount, maxDiscount);
        }

        /// <summary>
        /// Calculate deposit based on price after discount
        /// </summary>
        public static double CalculateDeposit(double priceAfterDiscount)
        {
            if (priceAfterDiscount < 100_000)
                return 0;
            else if (priceAfterDiscount < 500_000)
                return 100_000;
            else if (priceAfterDiscount < 1_000_000)
                return 200_000;
            else
                return 500_000;
        }

        /// <summary>
        /// Calculate total price: (RentalFee - discount + deposit) * (1 + VAT/100)
        /// </summary>
        public static double CalculateTotalPrice(double rentalFee, double discountAmount, double deposit)
        {
            double subtotal = rentalFee - discountAmount + deposit;
            double totalWithVAT = subtotal * (1 + VAT_PERCENT / 100.0);
            return totalWithVAT;
        }
    }
}
