# Tóm tắt chuyển đổi Blog Service: REST API → gRPC Microservice

## ✅ Hoàn thành

### 1. **Cấu trúc dự án đã thay đổi**

#### ❌ Đã xóa/Không sử dụng:

- `Controller/BlogController.cs` (REST API Controller) - Giữ lại nhưng không sử dụng
- Swagger/OpenAPI packages
- Authentication/Authorization middleware
- HTTP REST endpoints

#### ✅ Đã thêm mới:

- `Services/BlogGrpcService.cs` - gRPC Service implementation
- `Protos/blog.proto` - Proto definition file
- Grpc.AspNetCore v2.70.0 package

### 2. **Files đã sửa đổi**

#### `Blog.csproj`

```xml
<!-- Removed -->
- Swagger packages
- JWT Authentication packages
- OpenApi packages
- Grpc.Net.Client (client-only)

<!-- Added -->
+ Grpc.AspNetCore (server)
+ <Protobuf Include="Protos\blog.proto" GrpcServices="Server" />
```

#### `Program.cs`

```csharp
// Before: REST API
builder.Services.AddControllers();
builder.Services.AddSwagger();
app.MapControllers();

// After: gRPC
builder.Services.AddGrpc();
app.MapGrpcService<BlogGrpcService>();
```

#### `.env`

```bash
# Added
BLOG_GRPC_SERVICE_URL=0.0.0.0:5005
ASPNETCORE_URLS=http://0.0.0.0:5005
```

#### `appsettings.json`

```json
{
  "Kestrel": {
    "EndpointDefaults": {
      "Protocols": "Http2" // gRPC requires HTTP/2
    }
  }
}
```

### 3. **gRPC Service Implementation**

File: `Services/BlogGrpcService.cs`

Implements 5 methods theo `blog.proto`:

1. ✅ **GetBlog** - Lấy 1 blog theo ID

   ```csharp
   GetBlogRequest → GetBlogResponse
   ```

2. ✅ **GetManyBlogs** - Lấy danh sách với pagination

   ```csharp
   GetManyBlogsRequest → GetManyBlogsResponse
   ```

3. ✅ **CreateBlog** - Tạo blog mới

   ```csharp
   CreateBlogRequest → GetBlogResponse
   ```

4. ✅ **UpdateBlog** - Cập nhật blog

   ```csharp
   UpdateBlogRequest → GetBlogResponse
   ```

5. ✅ **DeleteBlog** - Xóa blog
   ```csharp
   DeleteBlogRequest → DeleteBlogResponse
   ```

### 4. **Business Logic giữ nguyên**

✅ Không thay đổi:

- `Repository/BlogRepository.cs`
- `Data/BlogDbContext.cs`
- `Models/Blog.cs`
- AutoMapper configuration
- Database connection

### 5. **Error Handling**

```csharp
// gRPC uses RpcException instead of HTTP status codes
throw new RpcException(new Status(
    StatusCode.NotFound,    // or InvalidArgument, Internal, etc.
    "Blog not found"
));
```

Status codes mapping:

- `StatusCode.NotFound` → HTTP 404
- `StatusCode.InvalidArgument` → HTTP 400
- `StatusCode.Internal` → HTTP 500

## 🚀 Cách sử dụng

### Start Blog gRPC Service

```powershell
# Terminal 1: Blog service
dotnet run --project c:\MF\VSCODE\HacMieu-Journey\hacmieu-journey\apps\blog\Blog.csproj
```

Output:

```
Database Connection: Host=***;Port=***;Database=journey-blog;Username=***;Password=***
Blog gRPC Service listening on: 0.0.0.0:5005
Now listening on: http://0.0.0.0:5005
Application started.
```

### Connect từ API Gateway (apps/api)

```typescript
// apps/api/src/app/blog/blog.module.ts đã cấu hình sẵn
ClientsModule.registerAsync([
  {
    name: BlogProto.BLOG_PACKAGE_NAME,
    useFactory: (configService: ConfigService) => ({
      transport: Transport.GRPC,
      options: {
        url: 'localhost:5005',  // hoặc từ BLOG_GRPC_SERVICE_URL
        package: BlogProto.BLOG_PACKAGE_NAME,
        protoPath: join(__dirname, '../../libs/grpc/proto/blog.proto'),
      },
    }),
  },
]),
```

### Test qua API Gateway

```bash
# Start API Gateway
npm start  # apps/api

# Call endpoints
curl http://localhost:3000/api/blog?page=1&limit=10
curl http://localhost:3000/api/blog/{blogId}
```

## 🔍 Kiểm tra kết nối gRPC

### PowerShell

```powershell
# Check port
netstat -ano | findstr :5005

# Test connection
Test-NetConnection -ComputerName localhost -Port 5005
```

### grpcurl (nếu đã cài)

```bash
# List services
grpcurl -plaintext localhost:5005 list

# Call method
grpcurl -plaintext -d '{"page": 1, "limit": 10}' \
  localhost:5005 blog.BlogService/GetManyBlogs
```

## 📋 Checklist

- ✅ Xóa REST API dependencies (Swagger, Auth)
- ✅ Thêm Grpc.AspNetCore package
- ✅ Copy blog.proto vào Protos/
- ✅ Tạo BlogGrpcService.cs
- ✅ Cập nhật Program.cs cho gRPC
- ✅ Cấu hình Kestrel HTTP/2
- ✅ Cập nhật .env với GRPC URL
- ✅ Build thành công
- ✅ Service chạy được tại 0.0.0.0:5005
- ✅ API Gateway có thể kết nối
- ✅ Giữ nguyên Repository/Business logic
- ✅ Error handling với RpcException

## 🎯 Kết quả

**Before:**

```
Client → HTTP REST → BlogController → Repository → Database
```

**After:**

```
API Gateway → gRPC → BlogGrpcService → Repository → Database
            (HTTP/2)     (Internal only)
```

## 📝 Lưu ý quan trọng

1. **Protocol**: Service chỉ dùng HTTP/2 (requirement của gRPC)
2. **Internal only**: Service này chỉ nên được gọi từ internal network
3. **Port**: 5005 (có thể đổi trong .env)
4. **Authentication**: Chưa implement auth trên gRPC layer
5. **Database**: Giữ nguyên connection và logic

## 🐛 Troubleshooting

### Port đã được sử dụng

```powershell
netstat -ano | findstr :5005
taskkill /PID <PID> /F
```

### Proto generation lỗi

```bash
dotnet clean
dotnet build
```

### API Gateway không kết nối được

- Kiểm tra blog service có đang chạy
- Kiểm tra BLOG_GRPC_SERVICE_URL trong .env
- Check logs của cả 2 services

---

**Status:** ✅ Migration complete - Blog service is now a gRPC microservice!
