# Blog Service - Deployment Configuration

## ✅ Files đã tạo/cập nhật

### 1. Dockerfile

**File:** `apps/blog/Dockerfile`

Multi-stage Dockerfile cho .NET 9.0:

- **Stage 1 (build)**: Sử dụng `mcr.microsoft.com/dotnet/sdk:9.0`
  - Copy và restore dependencies
  - Copy proto file từ libs/grpc
  - Build và publish release
- **Stage 2 (runtime)**: Sử dụng `mcr.microsoft.com/dotnet/aspnet:9.0`
  - Chỉ chứa runtime và published app
  - Expose port 5005
  - Health check endpoint `/health`
  - Chạy `dotnet Blog.dll`

### 2. GitHub Actions

**File:** `.github/workflows/push.yml`

Các thay đổi:

- ✅ Thêm `blog` vào danh sách SERVICES cleanup
- ✅ Thêm blog service vào matrix build với type `dotnet`
- ✅ Conditional download node_modules (chỉ cho nodejs services)
- ✅ Thêm blog image vào values.override.yaml
- ✅ Thêm blog deployment verification

```yaml
matrix:
  service:
    # ... other services
    - name: blog
      dockerfile: apps/blog/Dockerfile
      type: dotnet # Khác với nodejs
```

### 3. Helm Charts

**Thư mục:** `charts/journey/templates/blog/`

#### deployment.yaml

- Deployment cho blog service
- Port: gRPC 5005
- Environment variables:
  - `ASPNETCORE_URLS`: http://+:5005
  - `ASPNETCORE_ENVIRONMENT`: Production
  - `BLOG_GRPC_SERVICE_URL`: 0.0.0.0:5005
  - `ConnectionStrings__DefaultConnection`: từ secret
- Health checks: liveness & readiness probes
- Resources: 256Mi-512Mi RAM, 100m-500m CPU

#### service.yaml

- ClusterIP service
- Port 5005 (gRPC)
- Internal access only

### 4. Configuration Files

#### values.yaml

```yaml
blog:
  enabled: true
  replicas: 1
  image: 'caophi562005/journey-blog:latest'
  port:
    grpc: 5005
    http: 3005

config:
  blogUrl: 'blog:5005' # Internal service URL

secrets:
  blogDatabaseUrl: '' # PostgreSQL connection string
```

#### secrets.local.yaml

```yaml
config:
  blogUrl: 'blog:5005'

secrets:
  blogDatabaseUrl: 'postgres://...'
```

## 🚀 Deployment Flow

### 1. Build Docker Image

```bash
# Local test
docker build -f apps/blog/Dockerfile -t journey-blog:test .

# GitHub Actions sẽ tự động build và push
```

### 2. Push to Docker Hub

```bash
# Được thực hiện tự động bởi GitHub Actions
caophi562005/journey-blog:latest
caophi562005/journey-blog:<commit-sha>
```

### 3. Deploy to Kubernetes

```bash
# Helm upgrade tự động
helm upgrade journey ./charts/journey \
  -f secrets.production.yaml \
  -f values.override.yaml \
  --namespace journey
```

## 📊 Architecture

```
┌─────────────────────────────────────────────────┐
│              API Gateway (apps/api)             │
│              Port: 3000 (HTTP REST)             │
└──────────────┬──────────────────────────────────┘
               │
               │ gRPC Call
               ▼
┌─────────────────────────────────────────────────┐
│         Blog Service (apps/blog/.NET)           │
│              Port: 5005 (gRPC/HTTP2)            │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │      BlogGrpcService.cs                 │   │
│  │  - GetBlog                              │   │
│  │  - GetManyBlogs                         │   │
│  │  - CreateBlog                           │   │
│  │  - UpdateBlog                           │   │
│  │  - DeleteBlog                           │   │
│  └──────────────┬──────────────────────────┘   │
│                 │                               │
│                 ▼                               │
│  ┌─────────────────────────────────────────┐   │
│  │      BlogRepository.cs                  │   │
│  └──────────────┬──────────────────────────┘   │
└─────────────────┼──────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│        PostgreSQL (journey-blog)                │
│          Aiven Cloud Database                   │
└─────────────────────────────────────────────────┘
```

## 🔧 Environment Variables

### Development (.env)

```bash
DB_HOST=hacmieu-postgresql-caophi565caophi-d37b.e.aivencloud.com
DB_PORT=19769
DB_NAME=journey-blog
DB_USERNAME=avnadmin
DB_PASSWORD=***
BLOG_GRPC_SERVICE_URL=0.0.0.0:5005
ASPNETCORE_URLS=http://0.0.0.0:5005
```

### Production (Kubernetes)

```yaml
# From ConfigMap
BLOG_GRPC_SERVICE_URL: '0.0.0.0:5005'

# From Secret
ConnectionStrings__DefaultConnection: 'postgres://...'
```

## 📝 Checklist Deployment

- ✅ Dockerfile created (multi-stage .NET)
- ✅ GitHub Actions updated
  - ✅ Added blog to cleanup services
  - ✅ Added blog to docker matrix (type: dotnet)
  - ✅ Conditional node_modules download
  - ✅ Added blog to values.override.yaml
  - ✅ Added blog to deployment verification
- ✅ Helm charts created
  - ✅ templates/blog/deployment.yaml
  - ✅ templates/blog/service.yaml
- ✅ Configuration updated
  - ✅ values.yaml (blog section)
  - ✅ configmap.yaml (BLOG_GRPC_SERVICE_URL)
  - ✅ secret.yaml (BLOG_DATABASE_URL)
  - ✅ secrets.local.yaml (blogUrl + blogDatabaseUrl)

## 🧪 Testing

### Local Development

```bash
# Build
cd apps/blog
dotnet build

# Run
dotnet run
# Listening on: http://0.0.0.0:5005
```

### Docker

```bash
# Build image
docker build -f apps/blog/Dockerfile -t journey-blog:test .

# Run container
docker run -p 5005:5005 \
  -e ConnectionStrings__DefaultConnection="postgres://..." \
  journey-blog:test
```

### Kubernetes

```bash
# Check deployment
kubectl get pods -n journey | grep blog

# Check logs
kubectl logs -n journey -l app=blog

# Check service
kubectl get svc -n journey blog

# Port forward để test
kubectl port-forward -n journey svc/blog 5005:5005
```

### Test gRPC Connection

```bash
# From apps/api
curl http://localhost:3000/api/blog?page=1&limit=10
```

## 🔍 Monitoring

### Health Check

```bash
# HTTP endpoint
curl http://blog:5005/health

# Kubernetes probes
kubectl describe pod -n journey -l app=blog
```

### Logs

```bash
# Real-time logs
kubectl logs -f -n journey -l app=blog

# Recent logs
kubectl logs --tail=100 -n journey -l app=blog
```

## 🐛 Troubleshooting

### Image pull failed

```bash
# Check image exists
docker pull caophi562005/journey-blog:latest

# Check imagePullPolicy
kubectl describe pod -n journey -l app=blog
```

### Database connection failed

```bash
# Check secret
kubectl get secret journey-secrets -n journey -o yaml

# Check environment variables
kubectl exec -n journey -it <blog-pod> -- env | grep DATABASE
```

### gRPC connection failed

```bash
# Check service
kubectl get svc -n journey blog

# Check endpoints
kubectl get endpoints -n journey blog

# Test from another pod
kubectl run -n journey test --rm -it --image=curlimages/curl -- sh
curl http://blog:5005/health
```

## 🎯 Next Steps

1. **Update secrets.production.yaml** với production database URL
2. **Test local build** với Dockerfile
3. **Push code** để trigger GitHub Actions
4. **Monitor deployment** trong Kubernetes
5. **Test API endpoints** qua API Gateway

---

**Status:** ✅ All deployment configurations completed!
**Ready for:** CI/CD pipeline deployment
