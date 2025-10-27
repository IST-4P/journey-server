# Review Service - Query and Sort Features

Tài liệu này mô tả chi tiết các tính năng query và sort trong Review Service.

## Tính năng Query

### Search Text
- **Field**: `search_text`
- **Mô tả**: Tìm kiếm text trong Title hoặc Content của review
- **Type**: `string`
- **Example**: "excellent", "good service"

### Rating Filter
- **MinRating**: `min_rating`
  - Type: `int32`
  - Range: 1-5
  - Example: 4 (lọc reviews có rating >= 4)

- **MaxRating**: `max_rating`
  - Type: `int32`
  - Range: 1-5
  - Example: 5 (lọc reviews có rating <= 5)

### Date Range Filter
- **StartDate**: `start_date`
  - Type: `string` (ISO 8601 format)
  - Example: "2025-01-01T00:00:00Z"
  - Lọc reviews được tạo từ ngày này trở đi

- **EndDate**: `end_date`
  - Type: `string` (ISO 8601 format)
  - Example: "2025-12-31T23:59:59Z"
  - Lọc reviews được tạo đến ngày này

## Tính năng Sort

### Sort Fields
```proto
enum SortField {
  CREATED_AT = 0;  // Sắp xếp theo ngày tạo
  UPDATED_AT = 1;  // Sắp xếp theo ngày cập nhật
  RATING = 2;      // Sắp xếp theo điểm rating
  TITLE = 3;       // Sắp xếp theo tiêu đề (alphabetically)
}
```

### Sort Order
```proto
enum SortOrder {
  ASCENDING = 0;   // Tăng dần (A-Z, 1-5, cũ->mới)
  DESCENDING = 1;  // Giảm dần (Z-A, 5-1, mới->cũ)
}
```

## Examples

### Example 1: Get reviews with high rating (4-5 stars), sorted by newest
```protobuf
GetReviewsByVehicleRequest {
  vehicle_id = "123e4567-e89b-12d3-a456-426614174000"
  page = 1
  limit = 10
  min_rating = 4
  max_rating = 5
  sort_by = CREATED_AT
  sort_order = DESCENDING
}
```

### Example 2: Search reviews with text "excellent", sorted by rating
```protobuf
GetReviewsByDeviceRequest {
  device_id = "123e4567-e89b-12d3-a456-426614174001"
  page = 1
  limit = 20
  search_text = "excellent"
  sort_by = RATING
  sort_order = DESCENDING
}
```

### Example 3: Get reviews in date range
```protobuf
GetMyReviewsRequest {
  user_id = "123e4567-e89b-12d3-a456-426614174002"
  page = 1
  limit = 10
  start_date = "2025-01-01T00:00:00Z"
  end_date = "2025-01-31T23:59:59Z"
  sort_by = CREATED_AT
  sort_order = ASCENDING
}
```

### Example 4: Admin get all 5-star reviews, sorted by title
```protobuf
GetAllReviewsRequest {
  admin_id = "admin-123"
  page = 1
  limit = 50
  type = VEHICLE
  min_rating = 5
  max_rating = 5
  sort_by = TITLE
  sort_order = ASCENDING
}
```

### Example 5: Complex query - Search + Date range + Rating + Sort
```protobuf
GetReviewsByVehicleRequest {
  vehicle_id = "123e4567-e89b-12d3-a456-426614174000"
  page = 1
  limit = 10
  
  // Query filters
  search_text = "comfortable"
  min_rating = 3
  max_rating = 5
  start_date = "2025-10-01T00:00:00Z"
  end_date = "2025-10-31T23:59:59Z"
  
  // Sort
  sort_by = RATING
  sort_order = DESCENDING
}
```

## Default Values

Nếu các tham số không được cung cấp, hệ thống sẽ sử dụng giá trị mặc định:

| Parameter | Default Value |
|-----------|---------------|
| page | 1 |
| limit | 10 |
| search_text | null (không filter) |
| min_rating | null (không filter) |
| max_rating | null (không filter) |
| start_date | null (không filter) |
| end_date | null (không filter) |
| sort_by | CREATED_AT |
| sort_order | DESCENDING |

## Use Cases

### 1. Lấy reviews mới nhất
```
sort_by = CREATED_AT
sort_order = DESCENDING
```

### 2. Lấy reviews cũ nhất
```
sort_by = CREATED_AT
sort_order = ASCENDING
```

### 3. Lấy reviews rating cao nhất
```
sort_by = RATING
sort_order = DESCENDING
min_rating = 4  // optional
```

### 4. Lấy reviews rating thấp nhất (để xử lý khiếu nại)
```
sort_by = RATING
sort_order = ASCENDING
max_rating = 2
```

### 5. Lấy reviews được update gần đây
```
sort_by = UPDATED_AT
sort_order = DESCENDING
```

### 6. Search reviews có keyword cụ thể
```
search_text = "keyword"
sort_by = CREATED_AT
sort_order = DESCENDING
```

### 7. Analytics - Reviews trong khoảng thời gian
```
start_date = "2025-10-01T00:00:00Z"
end_date = "2025-10-31T23:59:59Z"
sort_by = CREATED_AT
sort_order = ASCENDING
```

## Performance Notes

1. **Indexes**: Database đã được index các trường sau để tối ưu performance:
   - UserId
   - VehicleId
   - DeviceId
   - ComboId
   - Type
   - CreatedAt

2. **Search Text**: Sử dụng `.Contains()` với ToLower() cho case-insensitive search. Với database lớn, nên cân nhắc sử dụng Full-Text Search.

3. **Pagination**: Luôn sử dụng pagination để tránh load quá nhiều data.

4. **Limit**: Maximum limit là 100 items per page để tránh overload.

## Testing với gRPC Client

### C# Example
```csharp
var client = new ReviewService.ReviewServiceClient(channel);

var request = new GetReviewsByVehicleRequest
{
    VehicleId = "123e4567-e89b-12d3-a456-426614174000",
    Page = 1,
    Limit = 10,
    SearchText = "excellent",
    MinRating = 4,
    MaxRating = 5,
    StartDate = "2025-10-01T00:00:00Z",
    EndDate = "2025-10-31T23:59:59Z",
    SortBy = SortField.Rating,
    SortOrder = SortOrder.Descending
};

var response = await client.GetReviewsByVehicleAsync(request);

Console.WriteLine($"Total: {response.TotalItems}, Pages: {response.TotalPages}");
foreach (var review in response.Reviews)
{
    Console.WriteLine($"{review.Title} - {review.Rating} stars");
}
```

## API Endpoints

Tất cả các endpoint sau đều hỗ trợ query và sort:

1. **GetMyReviews** - User xem reviews của mình
2. **GetReviewsByVehicle** - Xem reviews của vehicle
3. **GetReviewsByDevice** - Xem reviews của device  
4. **GetReviewsByCombo** - Xem reviews của combo
5. **GetAllReviews** - Admin xem tất cả reviews

## Error Handling

### Invalid Page/Limit
```
Status: InvalidArgument
Message: "Page must be greater than 0"
Message: "Limit must be between 1 and 100"
```

### Invalid Date Format
- Nếu date format không đúng, field sẽ bị ignore (treated as null)

### Invalid Rating Range
- MinRating và MaxRating nên từ 1-5
- Nếu không hợp lệ, filter sẽ bị ignore
