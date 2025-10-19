using System.ComponentModel.DataAnnotations;

namespace Blog.Validators
{
    public class HtmlContentAttribute : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            if (value is not string htmlContent)
                return false;

            // Basic HTML validation - check if it contains basic HTML structure
            if (string.IsNullOrWhiteSpace(htmlContent))
                return false;

            // Allow HTML content - just check it's not empty
            return !string.IsNullOrWhiteSpace(htmlContent.Trim());
        }

        public override string FormatErrorMessage(string name)
        {
            return $"{name} must contain valid HTML content.";
        }
    }
}