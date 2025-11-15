namespace rental.Nats.Events
{
    public class RentalCreatedEvent
    {
        public string Id { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string Type { get; set; } = "DEVICE"; // Always DEVICE for rental
        public string RentalId { get; set; } = string.Empty;
        public double TotalAmount { get; set; }
        public double Deposit { get; set; }
        public double RemainingAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class RentalUpdatedEvent
    {
        public string RentalId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
    }

    public class RentalCompletedEvent
    {
        public string RentalId { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public DateTime CompletedAt { get; set; }
    }

    public class RentalCancelledEvent
    {
        public string RentalId { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public double RefundAmount { get; set; }
        public int RefundPercent { get; set; }
        public string Reason { get; set; } = string.Empty;
        public DateTime CancelledAt { get; set; }
    }

    public class RentalReceivedEvent
    {
        public string RentalId { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public double RemainingAmountPaid { get; set; }
        public DateTime ReceivedAt { get; set; }
    }
}
