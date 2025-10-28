namespace rental.Model.Dto
{
    /// <summary>
    /// DTO for review summary from Review service
    /// Optional - rental may not have a review
    /// </summary>
    public class ReviewSummaryDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public int Rating { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // "Device", "Vehicle", "Combo"
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int UpdateCount { get; set; }
    }
}
