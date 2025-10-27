# Review Service

Service quản lý đánh giá (reviews) cho vehicles, devices và combos với kiến trúc Repository-Service pattern và phân quyền User-Admin.

## Kiến trúc

- **Model**: Định nghĩa entity Review
- **Repository**: Xử lý truy cập dữ liệu (CRUD operations)
- **Service**: Chứa business logic và validation
- **gRPC Service**: Xử lý các request từ client

## Tính năng

### User Operations
- **CreateReview**: Tạo đánh giá mới
  - Mỗi user chỉ được đánh giá 1 lần cho mỗi item (vehicle/device/combo)
  - Rating từ 1-5 sao
  - Có thể thêm hình ảnh

- **UpdateReview**: Cập nhật đánh giá
  - Chỉ owner mới có thể update
  - Tối đa 2 lần update
  - Tự động tăng UpdateCount

- **DeleteReview**: Xóa đánh giá
  - Chỉ owner mới có thể xóa

- **GetMyReviews**: Xem tất cả đánh giá của mình
  - Hỗ trợ pagination

- **GetReviewById**: Xem chi tiết 1 đánh giá

### Public Operations
- **GetReviewsByVehicle**: Xem đánh giá của vehicle
- **GetReviewsByDevice**: Xem đánh giá của device
- **GetReviewsByCombo**: Xem đánh giá của combo
- Tất cả đều hỗ trợ pagination

### Admin Operations
- **GetAllReviews**: Xem tất cả đánh giá
  - Có thể filter theo ReviewType
  - Hỗ trợ pagination

- **AdminDeleteReview**: Admin xóa đánh giá bất kỳ
  - Không giới hạn ownership

## Cấu trúc thư mục

```
review/
├── Model/
│   └── Review.cs                    # Entity model
├── Data/
│   └── ReviewDbContext.cs          # Database context
├── Interface/
│   ├── IReviewRepository.cs        # Repository interface
│   └── IReviewService.cs           # Service interface
├── Repository/
│   └── ReviewRepository.cs         # Repository implementation
├── Services/
│   ├── ReviewService.cs            # Business logic
│   └── ReviewGrpcService.cs        # gRPC endpoints
├── Mapping/
│   └── ReviewMappingProfile.cs     # AutoMapper profile
├── Protos/
│   └── review.proto                # gRPC definitions
└── Program.cs                       # Application entry point
```

## Business Rules

### Review Creation
1. User phải chỉ định ít nhất 1 trong 3: VehicleId, DeviceId, hoặc ComboId
2. Mỗi user chỉ được tạo 1 review cho mỗi item
3. Rating phải từ 1-5
4. Title tối đa 200 ký tự
5. Content tối đa 2000 ký tự

### Review Update
1. Chỉ owner mới được update
2. Tối đa 2 lần update (UpdateCount <= 2)
3. Rating vẫn phải từ 1-5
4. Tự động cập nhật UpdatedAt và tăng UpdateCount

### Review Delete
1. User chỉ có thể xóa review của mình
2. Admin có thể xóa bất kỳ review nào

### Pagination
1. Page phải >= 1
2. Limit phải từ 1-100

## Database Schema

```sql
CREATE TABLE Reviews (
    Id UUID PRIMARY KEY,
    VehicleId UUID NULL,
    DeviceId UUID NULL,
    ComboId UUID NULL,
    UserId UUID NOT NULL,
    Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Title VARCHAR(200) NOT NULL,
    Type INT NOT NULL,
    Content VARCHAR(2000) NOT NULL,
    Images JSONB,
    CreatedAt TIMESTAMP NOT NULL,
    UpdatedAt TIMESTAMP NOT NULL,
    UpdateCount INT DEFAULT 0
);

-- Indexes
CREATE INDEX idx_reviews_user_id ON Reviews(UserId);
CREATE INDEX idx_reviews_vehicle_id ON Reviews(VehicleId);
CREATE INDEX idx_reviews_device_id ON Reviews(DeviceId);
CREATE INDEX idx_reviews_combo_id ON Reviews(ComboId);
CREATE INDEX idx_reviews_type ON Reviews(Type);
CREATE INDEX idx_reviews_created_at ON Reviews(CreatedAt);
```

## Setup

1. Copy file `.env.example` thành `.env` và cập nhật thông tin database:
```bash
cp .env.example .env
```

2. Cập nhật connection string trong `.env`:
```
REVIEW_CONNECTION_STRING=Host=localhost;Port=5432;Database=review_db;Username=postgres;Password=your_password
```

3. Tạo migration:
```bash
dotnet ef migrations add InitialCreate
```

4. Update database:
```bash
dotnet ef database update
```

5. Build và run:
```bash
dotnet build
dotnet run
```

## Testing với gRPC Client

### Create Review
```csharp
var request = new CreateReviewRequest
{
    UserId = "user-guid",
    VehicleId = "vehicle-guid",
    Rating = 5,
    Title = "Excellent vehicle!",
    Type = ReviewType.Vehicle,
    Content = "This vehicle is amazing...",
    Images = { "image1.jpg", "image2.jpg" }
};

var response = await client.CreateReviewAsync(request);
```

### Get Reviews by Vehicle
```csharp
var request = new GetReviewsByVehicleRequest
{
    VehicleId = "vehicle-guid",
    Page = 1,
    Limit = 10
};

var response = await client.GetReviewsByVehicleAsync(request);
```

## TODO - Improvements

- [ ] Thêm authentication/authorization middleware
- [ ] Implement role-based access control cho admin
- [ ] Thêm caching layer (Redis)
- [ ] Thêm rate limiting
- [ ] Thêm validation cho image URLs
- [ ] Thêm soft delete thay vì hard delete
- [ ] Thêm audit log cho admin actions
- [ ] Thêm notification khi có review mới
- [ ] Thêm report review functionality
- [ ] Thêm review statistics/analytics
