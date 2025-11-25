namespace review.Model.Dto
{
    /// <summary>
    /// DTO for creating a new review
    /// </summary>
    public class CreateReviewDto
    {
        public Guid? BookingId { get; set; }
        public Guid UserId { get; set; }
        public Guid? RentalId { get; set; }
        public int Rating { get; set; }
        public string Title { get; set; } = string.Empty;
        public ReviewType Type { get; set; }
        public string Content { get; set; } = string.Empty;
        public List<string>? Images { get; set; }
    }

    /// <summary>
    /// DTO for updating an existing review
    /// </summary>
    public class UpdateReviewDto
    {
        public Guid ReviewId { get; set; }
        public Guid UserId { get; set; }
        public int Rating { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public List<string>? Images { get; set; }
    }

    /// <summary>
    /// DTO for aggregated rating statistics of a target (Vehicle/Device/Combo)
    /// </summary>
    public class RatingStatsDto
    {
        public Guid TargetId { get; set; }
        public ReviewType Type { get; set; }
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
    }
}
