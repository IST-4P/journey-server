namespace rental.Nats.Events
{
    public class RentalCreatedEvent
    {
        public string id { get; set; } = string.Empty;
        public string userId { get; set; } = string.Empty;
        public  required string type { get; set; } 
        public string rentalId { get; set; } = string.Empty;
        public double totalAmount { get; set; }
    }
}

public class RentalUpdatedEvent
{
    public string rentalId { get; set; } = string.Empty;
    public string status { get; set; } = string.Empty;
    public DateTime updatedAt { get; set; }
}

public class RentalCompletedEvent
{
    public string rentalId { get; set; } = string.Empty;
    public string userId { get; set; } = string.Empty;
    public DateTime completedAt { get; set; }
}

public class RentalCancelledEvent
{
    public string rentalId { get; set; } = string.Empty;
    public string userId { get; set; } = string.Empty;
    public double refundAmount { get; set; }
    public int refundPercent { get; set; }
    public string reason { get; set; } = string.Empty;
    public DateTime cancelledAt { get; set; }
}

public class RentalReceivedEvent
{
    public string RentalId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public double RemainingAmountPaid { get; set; }
    public DateTime ReceivedAt { get; set; }
}

public class RentalExtensionCreatedEvent
{
    public string id { get; set; } = string.Empty;
    public string userId { get; set; } = string.Empty;
    public string type { get; set; } = "EXTENSION";
    public string rentalId { get; set; } = string.Empty;
    public double totalAmount { get; set; }

}
public class RefundProcessedEvent
{
    public string rentalId { get; set; } = string.Empty;
    public double amount { get; set; }
}