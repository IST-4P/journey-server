# Rental Service Refactoring

## Tổng quan

Rental service đã được refactor để lấy thông tin người dùng và thiết bị thông qua gRPC từ User service và Device service. Service bây giờ cung cấp thông tin đầy đủ hơn trong responses.

## Quyền truy cập

### User (Người dùng thường)
- **Create (C)**: Tạo rental mới cho chính mình
- **Read (R)**: Xem danh sách rental của chính mình

### Admin (Quản trị viên)
- **Read (R)**: Xem tất cả rentals của tất cả người dùng
- **Update (U)**: Cập nhật thông tin rental (status, dates)
- **Delete (D)**: Xóa rental

## Các thay đổi chính

### 1. Response DTOs được mở rộng

**UserRentalDto** (cho User):
```csharp
public class UserRentalDto
{
    public Guid Id { get; set; }
    public Guid TargetId { get; set; }
    public bool IsCombo { get; set; }
    public string TargetName { get; set; }      // Mới: Tên Device/Combo
    public double TargetPrice { get; set; }     // Mới: Giá Device/Combo
    public string Status { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

**AdminRentalDto** (cho Admin):
```csharp
public class AdminRentalDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; }        // Mới: Tên người dùng
    public string UserEmail { get; set; }       // Mới: Email người dùng
    public Guid TargetId { get; set; }
    public bool IsCombo { get; set; }
    public string TargetName { get; set; }      // Mới: Tên Device/Combo
    public double TargetPrice { get; set; }     // Mới: Giá Device/Combo
    public string Status { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

### 2. gRPC Proto được cập nhật

Proto messages (`UserRental` và `AdminRental`) đã được cập nhật để bao gồm thông tin mới:
- `targetName` và `targetPrice` trong cả hai
- `userName` và `userEmail` trong `AdminRental`

### 3. Kết nối gRPC Services

**Program.cs** đã được cấu hình để kết nối với:
- **User Service**: Lấy thông tin profile người dùng
- **Device Service**: Lấy thông tin Device hoặc Combo

```csharp
// Cấu hình trong appsettings.json
{
  "GrpcServices": {
    "UserService": "http://localhost:5002",
    "DeviceService": "http://localhost:5003"
  }
}

// Environment variables trong .env
USER_GRPC_URL=http://localhost:5002
DEVICE_GRPC_URL=http://localhost:5003
```

### 4. Service Methods

**RentalGrpcService** bây giờ:
- Inject `UserService.UserServiceClient` và `DeviceService.DeviceServiceClient`
- Fetch thông tin User từ User service khi trả về Admin responses
- Fetch thông tin Device/Combo từ Device service cho tất cả responses
- Xử lý lỗi gracefully với fallback values ("Unknown", 0.0)

## Cách sử dụng

### User Operations

#### 1. Create Rental (User)
```protobuf
CreateRentalRequest {
  userId: "user-guid"
  targetId: "device-or-combo-guid"
  isCombo: true/false
  startDate: "2025-10-21T10:00:00Z"
  endDate: "2025-10-25T10:00:00Z"
}
```

#### 2. Get My Rentals (User)
```protobuf
GetMyRentalsRequest {
  userId: "user-guid"
  page: 1
  limit: 10
  status: "Pending" // optional
}

// Response bao gồm targetName và targetPrice
```

#### 3. Get Rental By Id (User/Admin)
```protobuf
GetRentalByIdRequest {
  rentalId: "rental-guid"
}
```

### Admin Operations

#### 1. Get All Rentals (Admin)
```protobuf
GetAllRentalsRequest {
  page: 1
  limit: 10
  status: "Pending" // optional
  userId: "user-guid" // optional filter
}

// Response bao gồm userName, userEmail, targetName, targetPrice
```

#### 2. Update Rental (Admin)
```protobuf
UpdateRentalRequest {
  rentalId: "rental-guid"
  status: "Approved" // optional
  startDate: "2025-10-21T10:00:00Z" // optional
  endDate: "2025-10-25T10:00:00Z" // optional
}
```

#### 3. Delete Rental (Admin)
```protobuf
DeleteRentalRequest {
  rentalId: "rental-guid"
}
```

## Error Handling

Service sử dụng logging để ghi lại các lỗi khi không thể fetch dữ liệu từ User/Device services:
- Nếu không fetch được User info: Hiển thị "Unknown" cho userName, "" cho userEmail
- Nếu không fetch được Device/Combo info: Hiển thị "Unknown" cho targetName, 0.0 cho targetPrice

Điều này đảm bảo service vẫn hoạt động ngay cả khi các service khác không available.

## Dependencies

### Proto Files
- `rental.proto`: Định nghĩa Rental service (Server)
- `user.proto`: Định nghĩa User service (Client) - từ libs/grpc
- `device.proto`: Định nghĩa Device service (Client) - từ apps/device

### NuGet Packages
- Grpc.AspNetCore: 2.70.0
- Google.Protobuf: 3.29.1
- Grpc.Tools: 2.70.0
- AutoMapper: 12.0.1
- Entity Framework Core: 9.0.10
- Npgsql: 9.0.4

## Testing

Để test service, cần đảm bảo:
1. User service đang chạy trên port 5002 (hoặc theo cấu hình)
2. Device service đang chạy trên port 5003 (hoặc theo cấu hình)
3. PostgreSQL database đã được migration
4. Các environment variables trong `.env` đã được cấu hình đúng

## Build & Run

```bash
# Build project
dotnet build

# Run migrations (nếu cần)
dotnet ef database update

# Run service
dotnet run
```

Service sẽ chạy trên port được cấu hình trong `launchSettings.json`.
