# NATS JetStream Integration Summary

## Services đã cập nhật

### 1. **Review Service** ✅
- Đã có NATS JetStream
- Publish event `review.created` khi tạo review thành công
- Stream: `REVIEW`
- Subjects: `review.created`, `review.updated`, `review.deleted`

### 2. **Device Service** ✅ ADDED
- ✅ Thêm NATS Client Core & JetStream packages
- ✅ Tạo `NatsPublisher`, `NatsStreamSetup`
- ✅ Tạo `ReviewEventConsumer` - Subscribe `review.created`
- ✅ Thêm `TotalReviewIds` field vào Device model
- ✅ Implement `AddReviewIdAsync` trong DeviceRepository
- ✅ Đăng ký services trong Program.cs
- ✅ Migration `AddTotalReviewIdsToDevice` đã được tạo

### 3. **Rental Service** ✅ ADDED
- ✅ Thêm NATS Client Core & JetStream packages
- ✅ Tạo `NatsPublisher`, `NatsStreamSetup`
- ✅ Đăng ký services trong Program.cs
- ✅ Stream: `RENTAL` (subjects: rental.created, rental.updated, rental.completed)

---

## Kiến trúc NATS Event-Driven

```
┌─────────────────┐
│  Review Service │
└────────┬────────┘
         │ publish
         ▼
   review.created
         │
         ├────────────────────┬────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Device Service │  │ Vehicle Service │  │  Combo Service  │
│   (subscribe)   │  │   (subscribe)   │  │   (subscribe)   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
  Update Device       Update Vehicle       Update Combo
  TotalReviewIds[]    TotalReviewIds[]     TotalReviewIds[]
```

---

## Files Đã Tạo/Sửa

### Device Service:
```
apps/device/
├── device.csproj (+ NATS packages)
├── Program.cs (+ NATS setup)
├── Model/Entities/Device.cs (+ TotalReviewIds field)
├── Interface/IDeviceRepository.cs (+ AddReviewIdAsync)
├── Repository/DeviceRepository.cs (+ AddReviewIdAsync implementation)
├── Nats/
│   ├── NatsPublisher.cs
│   ├── NatsStreamSetup.cs
│   ├── Events/
│   │   └── ReviewCreatedEvent.cs
│   └── Consumers/
│       └── ReviewEventConsumer.cs
└── Migrations/
    └── [timestamp]_AddTotalReviewIdsToDevice.cs
```

### Rental Service:
```
apps/rental/
├── rental.csproj (+ NATS packages)
├── Program.cs (+ NATS setup)
└── Nats/
    ├── NatsPublisher.cs
    └── NatsStreamSetup.cs
```

### Review Service:
```
apps/review/
├── review.csproj (+ NATS packages)
├── Program.cs (+ NATS setup)
├── Model/Review.cs (+ BookingId field)
├── Services/ReviewService.cs (+ publish event)
├── Nats/
│   ├── NatsPublisher.cs
│   ├── NatsStreamSetup.cs
│   └── Events/
│       └── ReviewCreatedEvent.cs
└── Migrations/
    └── [timestamp]_AddBookingIdToReview.cs
```

---

## Event Flow - Review Created

### 1. **User tạo review**
```http
POST /review.ReviewService/CreateReview
{
  "booking_id": "...",
  "device_id": "...",
  "rating": 5,
  "title": "Great device!",
  "content": "..."
}
```

### 2. **Review Service**
```csharp
// ReviewService.cs
var review = await _repository.CreateReviewAsync(review);

// Publish event to NATS
await _natsPublisher.PublishAsync("review.created", new ReviewCreatedEvent {
    ReviewId = review.Id.ToString(),
    DeviceId = review.DeviceId?.ToString(),
    VehicleId = review.VehicleId?.ToString(),
    ComboId = review.ComboId?.ToString(),
    UserId = review.UserId.ToString(),
    Rating = review.Rating,
    Type = review.Type.ToString(),
    CreatedAt = review.CreatedAt.ToString("o")
});
```

### 3. **Device Service - Consumer**
```csharp
// ReviewEventConsumer.cs (BackgroundService)
await foreach (var msg in consumer.ConsumeAsync<string>())
{
    var reviewEvent = JsonSerializer.Deserialize<ReviewCreatedEvent>(msg.Data);
    
    if (!string.IsNullOrEmpty(reviewEvent.DeviceId))
    {
        await deviceRepository.AddReviewIdAsync(
            Guid.Parse(reviewEvent.DeviceId), 
            Guid.Parse(reviewEvent.ReviewId)
        );
    }
    
    await msg.AckAsync();
}
```

### 4. **Device Repository**
```csharp
public async Task<bool> AddReviewIdAsync(Guid deviceId, Guid reviewId)
{
    var device = await _dbContext.Devices.FirstOrDefaultAsync(x => x.Id == deviceId);
    if (device == null) return false;

    if (device.TotalReviewIds == null)
        device.TotalReviewIds = new List<string>();

    var reviewIdString = reviewId.ToString();
    if (!device.TotalReviewIds.Contains(reviewIdString))
    {
        device.TotalReviewIds.Add(reviewIdString);
        device.UpdateAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();
    }

    return true;
}
```

---

## Configuration

### Environment Variables (.env)
```bash
# Đã có
NATS_URL=nats://localhost:4222  # hoặc 0.0.0.0:4222

# Services
REVIEW_GRPC_SERVICE_URL=0.0.0.0:5010
DEVICE_GRPC_SERVICE_URL=0.0.0.0:5006
RENTAL_GRPC_SERVICE_URL=0.0.0.0:5007
```

---

## Database Changes

### Device Table:
```sql
ALTER TABLE device 
ADD COLUMN "TotalReviewIds" jsonb NULL;
```

### Review Table:
```sql
ALTER TABLE reviews 
ADD COLUMN "BookingId" uuid NOT NULL;

CREATE UNIQUE INDEX "IX_reviews_BookingId" 
ON reviews ("BookingId");

ALTER TABLE reviews
ALTER COLUMN "Images" DROP NOT NULL;
```

---

## Next Steps

### 1. **Apply Migrations**
```bash
# Device
cd apps/device
dotnet ef database update

# Review
cd apps/review
dotnet ef database update
```

### 2. **Start NATS Server**
```bash
# Docker
docker run -p 4222:4222 -p 8222:8222 nats:latest -js

# Hoặc local install
nats-server -js
```

### 3. **Test Services**
```bash
# Start services
cd apps/review && dotnet run &
cd apps/device && dotnet run &
cd apps/rental && dotnet run &
```

### 4. **Test Event Flow**
```bash
# 1. Create review
grpcurl -plaintext -d '{
  "booking_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "device_id": "789e0123-e89b-12d3-a456-426614174000",
  "rating": 5,
  "title": "Excellent!",
  "type": "DEVICE",
  "content": "Great device!"
}' localhost:5010 review.ReviewService/CreateReview

# 2. Check NATS message
nats sub "review.created"

# 3. Check Device updated (TotalReviewIds should contain new reviewId)
grpcurl -plaintext -d '{
  "id": "789e0123-e89b-12d3-a456-426614174000"
}' localhost:5006 device.DeviceService/GetDeviceById
```

---

## Vehicle Service TODO

Vehicle service cũng cần subscribe `review.created`:

```csharp
// 1. Add packages
<PackageReference Include="NATS.Client.Core" Version="2.4.0" />
<PackageReference Include="NATS.Client.JetStream" Version="2.4.0" />

// 2. Create Consumer (same as Device)
// 3. Add TotalReviewIds field to Vehicle model
// 4. Implement AddReviewIdAsync in VehicleRepository
// 5. Create migration
```

---

## Monitoring & Debugging

### Check NATS Streams:
```bash
nats stream ls
nats stream info REVIEW
nats stream info DEVICE
nats stream info RENTAL
```

### Check Consumers:
```bash
nats consumer ls REVIEW
nats consumer info REVIEW device-review-consumer
```

### View Messages:
```bash
nats sub "review.*"
nats sub "device.*"
nats sub "rental.*"
```

### Logs to watch:
- `[Review] Published message to review.created`
- `[Device] Received review.created for DeviceId`
- `[Device] Added ReviewId ... to Device ...`

---

## Error Handling

### Consumer retries:
- Failed messages → NAK with 5 second delay
- Messages are redelivered automatically
- Check consumer configuration for max redeliveries

### Common issues:
1. **NATS not running**: Services will log connection errors
2. **Stream not created**: First service creates it
3. **Consumer not acking**: Messages pile up in stream
4. **Serialization errors**: Check JSON format

---

## Benefits

✅ **Decoupled services**: Review không cần gọi trực tiếp Device/Vehicle  
✅ **Reliable delivery**: Messages persist in JetStream  
✅ **Scalable**: Có thể add thêm consumers  
✅ **Async**: Review service không bị block  
✅ **Audit trail**: Có thể replay events  
✅ **Flexible**: Dễ add thêm services subscribe cùng event  
