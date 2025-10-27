namespace review.Model.Dto
{
    /// <summary>
    /// DTO for review query parameters
    /// </summary>
    public class ReviewQueryDto
    {
        // Pagination
        public int Page { get; set; } = 1;
        public int Limit { get; set; } = 10;

        // Search
        public string? SearchText { get; set; }

        // Filters
        public int? MinRating { get; set; }
        public int? MaxRating { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public ReviewType? Type { get; set; }

        // Sorting
        public SortField SortBy { get; set; } = SortField.CreatedAt;
        public SortOrder SortOrder { get; set; } = SortOrder.Descending;

        // Validation
        public bool IsValid()
        {
            return Page > 0
                && Limit > 0
                && Limit <= 100
                && (!MinRating.HasValue || (MinRating >= 1 && MinRating <= 5))
                && (!MaxRating.HasValue || (MaxRating >= 1 && MaxRating <= 5))
                && (!MinRating.HasValue || !MaxRating.HasValue || MinRating <= MaxRating);
        }
    }

    /// <summary>
    /// Sort field options
    /// </summary>
    public enum SortField
    {
        CreatedAt = 0,
        UpdatedAt = 1,
        Rating = 2,
        Title = 3
    }

    /// <summary>
    /// Sort order options
    /// </summary>
    public enum SortOrder
    {
        Ascending = 0,
        Descending = 1
    }
}
