# Blog gRPC Microservice

Service blog đã được chuyển đổi từ REST API Gateway sang gRPC Microservice.

## Thay đổi chính

### 1. **Dependencies**

- ❌ Removed: Swagger, Authentication, Authorization packages
- ✅ Added: `Grpc.AspNetCore` v2.70.0

### 2. **Architecture**

- ❌ Removed: `BlogController.cs` (REST API)
- ✅ Added: `BlogGrpcService.cs` (gRPC Service)
- ✅ Proto file: `Protos/blog.proto`

### 3. **Configuration**

```env
# gRPC URL
BLOG_GRPC_SERVICE_URL=0.0.0.0:5005
ASPNETCORE_URLS=http://0.0.0.0:5005
```

## Cách chạy

### 1. Start Blog gRPC Service

```bash
cd apps/blog
dotnet run
```

Service sẽ chạy tại: `0.0.0.0:5005`

### 2. Test từ apps/api

Service `apps/api` đã được cấu hình để kết nối đến Blog gRPC:

```bash
# Terminal 1: Start blog gRPC service
cd apps/blog
dotnet run

# Terminal 2: Start api gateway
cd apps/api
npm start
```

### 3. Test endpoints qua API Gateway

```bash
# Get many blogs
curl http://localhost:3000/api/blog?page=1&limit=10

# Get single blog
curl http://localhost:3000/api/blog/{blogId}
```

## gRPC Service Methods

Service implement 5 methods từ `blog.proto`:

1. **GetBlog** - Lấy thông tin 1 blog theo ID
2. **GetManyBlogs** - Lấy danh sách blogs với pagination
3. **CreateBlog** - Tạo blog mới
4. **UpdateBlog** - Cập nhật blog
5. **DeleteBlog** - Xóa blog

## Kiểm tra gRPC connection

### Sử dụng grpcurl (nếu đã cài đặt)

```bash
# List services
grpcurl -plaintext localhost:5005 list

# List methods
grpcurl -plaintext localhost:5005 list blog.BlogService

# Call GetManyBlogs
grpcurl -plaintext -d '{"page": 1, "limit": 10}' localhost:5005 blog.BlogService/GetManyBlogs

# Call GetBlog
grpcurl -plaintext -d '{"blogId": "your-blog-id"}' localhost:5005 blog.BlogService/GetBlog
```

### Sử dụng netstat (Windows PowerShell)

```powershell
# Kiểm tra port 5005 đang mở
netstat -ano | findstr :5005

# hoặc
Get-NetTCPConnection -LocalPort 5005 -ErrorAction SilentlyContinue
```

### Sử dụng Test.NetConnection (PowerShell)

```powershell
Test-NetConnection -ComputerName localhost -Port 5005
```

## Database Repository

Giữ nguyên code repository và business logic:

- ✅ `BlogRepository.cs` - Không thay đổi
- ✅ `BlogDbContext.cs` - Không thay đổi
- ✅ `Models/Blog.cs` - Không thay đổi
- ✅ AutoMapper configuration - Không thay đổi

## Logs

Service sẽ log các thông tin quan trọng:

- Database connection (ẩn password)
- gRPC service URL
- Request logs cho mỗi method call
- Error logs khi có exception

## Lưu ý

1. **Protocol**: Service chỉ sử dụng HTTP/2 (yêu cầu của gRPC)
2. **Security**: Hiện tại chưa có authentication/authorization trên gRPC layer
3. **Error Handling**: Sử dụng `RpcException` với proper status codes
4. **Internal only**: Service này chỉ nên được truy cập từ các services khác trong internal network, không expose ra public

## Troubleshooting

### Service không start được

```bash
# Check if port is already in use
netstat -ano | findstr :5005

# Kill process if needed
taskkill /PID <PID> /F
```

### API Gateway không kết nối được

- Kiểm tra `BLOG_GRPC_SERVICE_URL` trong `.env` của apps/api
- Đảm bảo blog service đang chạy
- Check logs của cả 2 services

### Proto generation issues

```bash
# Clean and rebuild
cd apps/blog
dotnet clean
dotnet build
```
