# Review Service - Changes Summary

## Các thay đổi chính

### 1. **Thêm BookingId vào Review Model**
- Mỗi review bây giờ phải liên kết với một `BookingId`
- Mỗi booking chỉ được tạo **1 review duy nhất**
- Review có thể được cập nhật tối đa **2 lần** (qua `UpdateCount`)

### 2. **Images có thể null**
- Trường `Images` bây giờ là `List<string>?` thay vì bắt buộc
- Người dùng có thể tạo review mà không cần hình ảnh

### 3. **NATS JetStream Integration**

#### Packages đã thêm:
```xml
<PackageReference Include="NATS.Client.Core" Version="2.4.0" />
<PackageReference Include="NATS.Client.JetStream" Version="2.4.0" />
```

#### Cấu trúc NATS:
- **Stream**: `REVIEW`
- **Subjects**: 
  - `review.created` - Khi tạo review mới
  - `review.updated` - Khi cập nhật review
  - `review.deleted` - Khi xóa review

#### Event Model:
```csharp
public class ReviewCreatedEvent
{
    public string ReviewId { get; set; }
    public string? VehicleId { get; set; }
    public string? DeviceId { get; set; }
    public string? ComboId { get; set; }
    public string UserId { get; set; }
    public int Rating { get; set; }
    public string Type { get; set; } // "Vehicle", "Device", "Combo"
    public string CreatedAt { get; set; }
}
```

### 4. **Workflow tạo Review**

```
1. User tạo review với BookingId
   ↓
2. Kiểm tra BookingId đã có review chưa
   ↓
3. Lưu review vào database
   ↓
4. Publish event "review.created" lên NATS
   ↓
5. Vehicle/Device service subscribe event và thêm reviewId vào totalReviewIds
```

### 5. **Files đã tạo/sửa**

#### Tạo mới:
- `Nats/Events/ReviewCreatedEvent.cs` - Event model
- `Nats/NatsPublisher.cs` - Publisher để gửi events
- `Nats/NatsStreamSetup.cs` - Setup NATS streams

#### Cập nhật:
- `Model/Review.cs` - Thêm `BookingId`, `Images` nullable
- `Model/Dto/ReviewDto.cs` - Thêm `BookingId` vào DTOs
- `Interface/IReviewRepository.cs` - Thay `HasUserReviewedAsync` → `HasBookingBeenReviewedAsync`
- `Repository/ReviewRepository.cs` - Implement phương thức mới
- `Services/ReviewService.cs` - Tích hợp NATS publisher
- `Services/ReviewGrpcService.cs` - Map `BookingId` từ request
- `Data/ReviewDbContext.cs` - Thêm unique index cho `BookingId`
- `Protos/review.proto` - Thêm `booking_id` vào messages
- `Mapping/ReviewMappingProfile.cs` - Map `BookingId`
- `Program.cs` - Đăng ký NATS services

### 6. **Database Migration**
```bash
dotnet ef migrations add AddBookingIdToReview
```

Migration này:
- Thêm cột `BookingId` (required)
- Thêm unique index trên `BookingId` để đảm bảo 1 booking = 1 review
- Cho phép `Images` là null

### 7. **Environment Variables**

Thêm vào `.env`:
```bash
NATS_URL=nats://localhost:4222
```

### 8. **Luồng làm việc**

#### Tạo Review:
1. Client gọi `CreateReview` với `BookingId`
2. Service kiểm tra `BookingId` đã có review chưa
3. Nếu chưa có, tạo review và lưu DB
4. Publish event `review.created` lên NATS
5. Vehicle/Device service nhận event và update `totalReviewIds[]`

#### Cập nhật Review:
1. Client gọi `UpdateReview` với `ReviewId`
2. Service kiểm tra ownership và `UpdateCount < 2`
3. Nếu hợp lệ, cập nhật review và tăng `UpdateCount`
4. Có thể publish event `review.updated` (optional)

### 9. **Vehicle/Device Service Integration**

Vehicle/Device service cần:
1. Subscribe NATS subject: `review.created`
2. Khi nhận event, parse `VehicleId/DeviceId`
3. Thêm `ReviewId` vào mảng `totalReviewIds` của vehicle/device tương ứng
4. Cập nhật `averageRating` (optional)

Example consumer code:
```csharp
var js = new NatsJSContext(natsConnection);
await foreach (var msg in js.ConsumeAsync<ReviewCreatedEvent>("REVIEW", "review.created"))
{
    var review = msg.Data;
    if (!string.IsNullOrEmpty(review.VehicleId))
    {
        await AddReviewIdToVehicle(review.VehicleId, review.ReviewId);
    }
    await msg.AckAsync();
}
```

### 10. **Validation Rules**

- ✅ Mỗi booking chỉ được tạo 1 review
- ✅ Review có thể update tối đa 2 lần
- ✅ Rating phải từ 1-5
- ✅ Phải có ít nhất 1 trong 3: VehicleId, DeviceId, ComboId
- ✅ Images có thể null (không bắt buộc)
- ✅ User chỉ có thể update/delete review của mình

### 11. **Next Steps**

1. ⏳ Apply migration: `dotnet ef database update`
2. ⏳ Cài đặt NATS server (nếu chưa có)
3. ⏳ Implement NATS consumer ở Vehicle/Device service
4. ⏳ Test end-to-end flow
5. ⏳ Add logging và monitoring

### 12. **Testing**

#### Test tạo review:
```bash
grpcurl -plaintext -d '{
  "booking_id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "user-123",
  "vehicle_id": "vehicle-456",
  "rating": 5,
  "title": "Excellent!",
  "type": "VEHICLE",
  "content": "Great vehicle!"
}' localhost:5010 review.ReviewService/CreateReview
```

#### Kiểm tra NATS event:
```bash
nats sub "review.created"
```
