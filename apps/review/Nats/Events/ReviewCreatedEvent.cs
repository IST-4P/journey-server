namespace review.Nats.Events
{
    public class ReviewCreatedEvent
    {
        public string ReviewId { get; set; } = string.Empty;
        public string? BookingId { get; set; }
        public string? RentalId { get; set; }
        public string? VehicleId { get; set; }
        public string? DeviceId { get; set; }
        public string? ComboId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Type { get; set; } = string.Empty; // "Vehicle", "Device", "Combo"
        public string CreatedAt { get; set; } = string.Empty;
    }
}
