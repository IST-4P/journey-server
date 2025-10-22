# WebSocket Integration Summary

## ✅ Đã hoàn thành

### 1. Tạo WebSocket Library (`libs/websocket`)

#### Files được tạo:

- `libs/websocket/src/lib/websocket.module.ts` - Module chính với AuthGuardModule
- `libs/websocket/src/lib/notification.gateway.ts` - Gateway xử lý notifications
- `libs/websocket/src/lib/websocket.adapter.ts` - Custom adapter với Redis & JWT
- `libs/websocket/src/lib/helpers.ts` - Helper functions (generateRoomUserId)
- `libs/websocket/src/index.ts` - Exports
- `libs/websocket/README.md` - Documentation đầy đủ
- `libs/websocket/test-client.html` - HTML test client

### 2. Tích hợp vào Notification Service

#### Files được cập nhật:

- `apps/notification/src/main.ts` - Setup WebsocketAdapter
- `apps/notification/src/app/notification/notification.module.ts` - Import WebSocketModule
- `apps/notification/src/app/notification/notification.service.ts` - Inject NotificationGateway
- `apps/notification/.env` - Thêm REDIS_URL và JWT secrets

### 3. Infrastructure Updates

#### Files được cập nhật:

- `docker-compose.yml` - Thêm Redis service
- `package.json` - Đã cài đặt dependencies: redis, @socket.io/redis-adapter, cookie, uuid

## 🔧 Chi tiết Implementation

### Authentication Flow

```
Client → WebSocket Connection
  ↓
WebsocketAdapter.authMiddleware()
  ↓
Extract JWT token (Bearer hoặc Cookie)
  ↓
JwtService.verifyAsync() - Sử dụng ACCESS_TOKEN_SECRET
  ↓
Validate payload (userId, role)
  ↓
Store user info in socket.data
  ↓
Auto-join room: userId-{userId}
  ↓
Connection Established ✅
```

### Key Features

1. **JWT Authentication**

   - Sử dụng cùng `JwtService` và `ACCESS_TOKEN_SECRET` như HTTP requests
   - Tích hợp với `AuthGuardModule` từ `@hacmieu-journey/nestjs`
   - Hỗ trợ Bearer token và Cookie

2. **Redis Adapter**

   - Scale horizontal với nhiều instances
   - Pub/Sub cho cross-instance messaging
   - Optional - vẫn hoạt động nếu không có Redis

3. **Room-based Messaging**

   - Mỗi user tự động join room `userId-{userId}`
   - Targeted notifications chỉ đến đúng user
   - Secure - user chỉ nhận notification của mình

4. **Integration với Notification Service**
   - Notification được tạo → Lưu DB → Gửi WebSocket
   - Real-time notification ngay lập tức
   - Không cần polling từ client

## 🚀 Cách sử dụng

### Start Services

```bash
# Start Redis (trong hacmieu-journey folder)
cd c:\MF\VSCODE\HacMieu-Journey\hacmieu-journey
docker-compose up redis -d

# Start Notification service
nx serve notification
```

### Test WebSocket

1. Mở `libs/websocket/test-client.html` trong browser
2. Nhập server URL: `http://localhost:3002/notification`
3. Nhập JWT access token (lấy từ login)
4. Click "Connect"
5. Tạo notification mới → Sẽ nhận real-time qua WebSocket

### Integration trong Service

```typescript
// Trong NotificationService
async createNotificationFromAuthEvent(event: UserRegisteredEvent) {
  const notification = await this.prisma.notification.create({
    data: {
      userId: event.userId,
      title: 'Welcome to HacMieu Journey!',
      message: `Welcome, ${event.name}!`,
      type: 'WELCOME',
    },
  });

  // ✅ Gửi real-time qua WebSocket
  this.notificationGateway.handleNotificationCreated(notification);
}
```

## 📋 Environment Variables

File `.env` cần có:

```env
DATABASE_URL=postgres://...
PULSAR_SERVICE_URL=pulsar://localhost:6650
PORT=3002

# WebSocket & Redis
REDIS_URL=redis://localhost:6379

# JWT (cùng với auth service)
ACCESS_TOKEN_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

## 🔐 Security

- ✅ JWT verification với cùng secret như HTTP
- ✅ Token expiration check
- ✅ Payload validation (userId, role required)
- ✅ Room-based isolation (user chỉ nhận notification của mình)
- ✅ CORS configuration
- ✅ Connection authentication trước khi establish

## 📊 Architecture

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ Socket.IO + JWT
       ↓
┌─────────────────────────────────┐
│   WebsocketAdapter              │
│   - JWT Authentication          │
│   - Redis Pub/Sub               │
│   - Room Management             │
└──────┬──────────────────────────┘
       │
       ↓
┌─────────────────────────────────┐
│   NotificationGateway           │
│   - handleNotificationCreated() │
│   - Emit to user rooms          │
└──────┬──────────────────────────┘
       │
       ↓
┌─────────────────────────────────┐
│   NotificationService           │
│   - Create notification in DB   │
│   - Call gateway to emit        │
└─────────────────────────────────┘
```

## 📝 Next Steps

### Immediate

- [x] Test WebSocket connection
- [x] Test notification creation flow
- [ ] Test với multiple clients
- [ ] Test Redis scaling (multiple instances)

### Future Enhancements

- [ ] Add rate limiting cho connections
- [ ] Add typing indicators
- [ ] Add online/offline status
- [ ] Add read receipts
- [ ] Add message acknowledgement
- [ ] Add unit tests
- [ ] Add e2e tests
- [ ] Add monitoring & analytics
- [ ] Add reconnection handling
- [ ] Add heartbeat/ping-pong

## 🎯 Comparison với Shop Project

| Feature          | Shop Project               | HacMieu Journey                              |
| ---------------- | -------------------------- | -------------------------------------------- |
| WebSocket Module | Local trong src/websockets | Shared lib @hacmieu-journey/websocket        |
| Authentication   | Local TokenService         | AuthGuardModule từ @hacmieu-journey/nestjs   |
| JWT Strategy     | Custom implementation      | Shared JwtStrategy                           |
| Redis            | Required                   | Optional                                     |
| Scalability      | Single app                 | Monorepo với multiple apps                   |
| Reusability      | No                         | Yes - có thể dùng cho api, admin, user, etc. |

## ✨ Benefits

1. **Reusable Library**: Có thể dùng cho bất kỳ app nào trong monorepo
2. **Consistent Authentication**: Cùng JWT strategy với HTTP requests
3. **Scalable**: Redis adapter cho horizontal scaling
4. **Type-safe**: Full TypeScript với interfaces
5. **Well-documented**: README đầy đủ và test client
6. **Production-ready**: Error handling, logging, security

## 📞 Support

Nếu cần giúp đỡ:

1. Đọc `libs/websocket/README.md`
2. Sử dụng `test-client.html` để test
3. Check logs trong terminal
4. Verify environment variables
5. Ensure Redis is running (if using adapter)
