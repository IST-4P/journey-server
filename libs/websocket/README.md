# WebSocket Library

Thư viện WebSocket có thể tái sử dụng cho các microservices trong HacMieu Journey.

## 📦 Cài đặt

Thư viện này đã được tạo sẵn trong monorepo, chỉ cần import vào app cần dùng.

Dependencies đã được cài:

```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

## 🚀 Sử dụng

### 1. Import WebSocketModule vào app

```typescript
// app.module.ts
import { WebSocketModule } from '@hacmieu-journey/websocket';

@Module({
  imports: [
    WebSocketModule,
    // ... other modules
  ],
})
export class AppModule {}
```

### 2. Tạo Gateway trong app

```typescript
// notification.gateway.ts
import { BaseWebSocketGateway, WebSocketService } from '@hacmieu-journey/websocket';
import { SubscribeMessage, MessageBody, ConnectedSocket, WebSocketGateway } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
  namespace: 'notifications', // Optional: tạo namespace riêng
  cors: { origin: '*' },
})
export class NotificationGateway extends BaseWebSocketGateway {
  constructor(private readonly websocketService: WebSocketService) {
    super();
  }

  afterInit(server: Server) {
    super.afterInit(server);
    this.websocketService.setServer(server);
  }

  @SubscribeMessage('authenticate')
  handleAuthenticate(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket) {
    // Register client với userId
    this.registerClient(data.userId, client.id);

    // Join user room
    client.join(`user:${data.userId}`);

    this.logger.log(`User ${data.userId} authenticated via socket ${client.id}`);

    return { success: true, message: 'Authenticated successfully' };
  }

  @SubscribeMessage('get-online-status')
  handleGetOnlineStatus(@MessageBody() data: { userId: string }) {
    return {
      userId: data.userId,
      online: this.isUserOnline(data.userId),
    };
  }
}
```

### 3. Setup WebSocket Adapter trong main.ts

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { WebSocketAdapter } from '@hacmieu-journey/websocket';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Setup WebSocket adapter
  app.useWebSocketAdapter(new WebSocketAdapter(app, configService));

  await app.listen(3000);
}

bootstrap();
```

### 4. Gửi notification từ Service

```typescript
// notification.service.ts
import { Injectable } from '@nestjs/common';
import { WebSocketService } from '@hacmieu-journey/websocket';

@Injectable()
export class NotificationService {
  constructor(private readonly websocketService: WebSocketService) {}

  async sendNotificationToUser(userId: string, notification: any) {
    // Save to database
    const saved = await this.notificationRepository.save({
      userId,
      ...notification,
    });

    // Send via WebSocket
    this.websocketService.sendToUser(userId, 'notification', {
      id: saved.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      createdAt: saved.createdAt,
    });

    return saved;
  }

  async broadcastAnnouncement(announcement: string) {
    this.websocketService.broadcast('announcement', {
      message: announcement,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### 5. Sử dụng từ Pulsar Consumer

```typescript
// user-registered.consumer.ts
import { PulsarConsumer, PulsarClient } from '@hacmieu-journey/pulsar';
import { WebSocketService } from '@hacmieu-journey/websocket';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRegisteredConsumer extends PulsarConsumer<UserRegisteredEvent> {
  constructor(pulsarClient: PulsarClient, private readonly websocketService: WebSocketService, private readonly notificationService: NotificationService) {
    super(pulsarClient, 'persistent://journey/events/user-registered', 'notification-service');
  }

  protected async onMessage(event: UserRegisteredEvent): Promise<void> {
    this.logger.log(`Sending welcome notification to user: ${event.userId}`);

    // Create notification in DB
    const notification = await this.notificationService.create({
      userId: event.userId,
      type: 'WELCOME',
      title: 'Chào mừng đến HacMieu Journey!',
      message: `Xin chào ${event.name}, hãy bắt đầu hành trình của bạn!`,
    });

    // Send real-time via WebSocket
    this.websocketService.sendToUser(event.userId, 'notification', {
      id: notification.id,
      type: 'WELCOME',
      title: notification.title,
      message: notification.message,
      createdAt: notification.createdAt,
    });
  }
}
```

## 🎯 Events

### Client → Server

```typescript
// Client kết nối và authenticate
socket.emit('authenticate', { userId: '123' });

// Client request online status
socket.emit('get-online-status', { userId: '456' });
```

### Server → Client

```typescript
// Server gửi notification
socket.on('notification', (data) => {
  console.log('New notification:', data);
  // { id, type, title, message, createdAt }
});

// Server gửi announcement
socket.on('announcement', (data) => {
  console.log('Announcement:', data);
  // { message, timestamp }
});
```

## 📚 API Reference

### BaseWebSocketGateway

Base class cho các WebSocket gateways.

**Methods:**

- `registerClient(userId: string, clientId: string)` - Đăng ký client với userId
- `getUserSockets(userId: string): string[]` - Lấy danh sách socket IDs của user
- `emitToUser(userId: string, event: string, data: any)` - Gửi event đến user
- `emitToSocket(socketId: string, event: string, data: any)` - Gửi event đến socket cụ thể
- `broadcast(event: string, data: any)` - Broadcast đến tất cả clients
- `isUserOnline(userId: string): boolean` - Kiểm tra user có online không
- `getConnectedClientsCount(): number` - Đếm số clients đang kết nối
- `getConnectedUsersCount(): number` - Đếm số users đang online

### WebSocketService

Service để gửi messages từ bất kỳ đâu trong app.

**Methods:**

- `sendToUser(userId: string, event: string, data: any)` - Gửi đến user cụ thể
- `sendToUsers(userIds: string[], event: string, data: any)` - Gửi đến nhiều users
- `broadcast(event: string, data: any)` - Broadcast đến tất cả
- `sendToRoom(room: string, event: string, data: any)` - Gửi đến room
- `getServer(): Server` - Lấy Socket.IO server instance

## 🔧 Configuration

Thêm vào `.env`:

```env
CORS_ORIGIN=http://localhost:4200,http://localhost:3000
```

## 🌟 Use Cases

### 1. Notification Service

Gửi thông báo real-time khi có event:

- User đăng ký → Welcome notification
- Booking confirmed → Booking notification
- Payment successful → Payment notification

### 2. Chat Service

Real-time chat giữa user và support:

- Typing indicator
- Message delivery
- Online/offline status

### 3. Booking Service

Real-time updates:

- Vehicle availability changes
- Booking status updates
- Check-in/Check-out notifications

## 🎨 Frontend Integration

### React/Next.js

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/notifications', {
  transports: ['websocket'],
});

// Authenticate
socket.emit('authenticate', { userId: user.id });

// Listen for notifications
socket.on('notification', (data) => {
  toast.info(data.message);
  // Update notification list
});

// Cleanup
return () => {
  socket.disconnect();
};
```

### Vue.js

```typescript
import { io } from 'socket.io-client';

export default {
  mounted() {
    this.socket = io('http://localhost:3000/notifications');
    this.socket.emit('authenticate', { userId: this.userId });

    this.socket.on('notification', (data) => {
      this.notifications.push(data);
    });
  },
  beforeUnmount() {
    this.socket.disconnect();
  },
};
```

## 🔐 Security

Để bảo mật WebSocket connections:

1. **JWT Authentication:**

```typescript
@SubscribeMessage('authenticate')
async handleAuthenticate(
  @MessageBody() data: { token: string },
  @ConnectedSocket() client: Socket
) {
  try {
    const payload = await this.jwtService.verify(data.token);
    this.registerClient(payload.userId, client.id);
    client.join(`user:${payload.userId}`);
    return { success: true };
  } catch (error) {
    client.disconnect();
    return { success: false, error: 'Invalid token' };
  }
}
```

2. **Rate Limiting:**

```typescript
import { ThrottlerGuard } from '@nestjs/throttler';
import { UseGuards } from '@nestjs/common';

@UseGuards(ThrottlerGuard)
@WebSocketGateway()
export class NotificationGateway extends BaseWebSocketGateway {
  // ...
}
```

## 📊 Monitoring

Track WebSocket connections:

```typescript
@Get('/ws/stats')
getWebSocketStats() {
  return {
    connectedClients: this.notificationGateway.getConnectedClientsCount(),
    connectedUsers: this.notificationGateway.getConnectedUsersCount(),
  };
}
```

## Running unit tests

Run `nx test websocket` to execute the unit tests via [Jest](https://jestjs.io).
