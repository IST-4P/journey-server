namespace rental.Nats.Events
{
    /// <summary>
    /// Event published when rental status changes and device/combo quantities need to be updated
    /// </summary>
    public class RentalQuantityChangeEvent
    {
        public string RentalId { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public List<QuantityChangeItem> Items { get; set; } = new();
        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    }

    public class QuantityChangeItem
    {
        public string TargetId { get; set; } = string.Empty; // Device or Combo ID
        public bool IsCombo { get; set; }
        public int Quantity { get; set; }
    }
}
