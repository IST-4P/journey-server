namespace review.Nats.Events
{
    public class ReviewCreatedEvent
    {
        public string reviewId { get; set; } = string.Empty;
        public string? bookingId { get; set; }
        public string? rentalId { get; set; }
        public string? vehicleId { get; set; }
        public string? deviceId { get; set; }
        public string? comboId { get; set; }
        public int rating { get; set; }
        
    }

    public class ReviewUpdatedEvent
    {
        public string ReviewId { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string UpdatedAt { get; set; } = string.Empty;
    }

    public class ReviewDeletedEvent
    {
        public string ReviewId { get; set; } = string.Empty;
        public string? DeviceId { get; set; }
        public string? VehicleId { get; set; }
        public string? ComboId { get; set; }
        public string DeletedAt { get; set; } = string.Empty;
    }
}
