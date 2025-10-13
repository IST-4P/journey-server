# 🔄 User Registration Flow với Apache Pulsar

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     USER REGISTRATION FLOW                          │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   CLIENT     │         │  AUTH SERVICE│         │ USER SERVICE │
│  (Frontend)  │         │   (Port 3000)│         │  (Port 3001) │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │
       │  1. POST /auth/otp     │                        │
       │  { email, type }       │                        │
       ├───────────────────────>│                        │
       │                        │                        │
       │  2. Send OTP Email     │                        │
       │<───────────────────────┤                        │
       │                        │                        │
       │  3. POST /auth/register│                        │
       │  { email, name, phone, │                        │
       │    password, code }    │                        │
       ├───────────────────────>│                        │
       │                        │                        │
       │                   ┌────┴────┐                   │
       │                   │ Validate│                   │
       │                   │   OTP   │                   │
       │                   └────┬────┘                   │
       │                        │                        │
       │                   ┌────┴────┐                   │
       │                   │  Create │                   │
       │                   │  User   │                   │
       │                   │  in DB  │                   │
       │                   └────┬────┘                   │
       │                        │                        │
       │                   ┌────┴────────────────────────┼────────┐
       │                   │  🚀 PUBLISH EVENT          │        │
       │                   │  Topic: user-registered     │        │
       │                   │  Data: {userId, email,      │ PULSAR │
       │                   │         name, phone, role}  │ BROKER │
       │                   └────┬────────────────────────┼────────┘
       │                        │                        │
       │  4. Success Response   │                   ┌────┴────┐
       │<───────────────────────┤                   │📥 CONSUME│
       │                        │                   │  EVENT  │
       │                        │                   └────┬────┘
       │                        │                        │
       │                        │                   ┌────┴────┐
       │                        │                   │ Create  │
       │                        │                   │ Profile │
       │                        │                   │  in DB  │
       │                        │                   └────┬────┘
       │                        │                        │
       │                        │                    ✅ Done!
       │                        │                        │

┌─────────────────────────────────────────────────────────────────────┐
│                          DATABASES                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  AUTH_DB (PostgreSQL)          USER_DB (PostgreSQL)                 │
│  ┌─────────────────┐           ┌─────────────────┐                 │
│  │ users           │           │ user_profiles   │                 │
│  ├─────────────────┤           ├─────────────────┤                 │
│  │ id (PK)         │           │ id (PK)         │                 │
│  │ email           │           │ userId          │                 │
│  │ phone           │           │ email           │                 │
│  │ password (hash) │           │ fullName        │                 │
│  │ name            │           │ phone           │                 │
│  │ role            │           │ avatarUrl       │                 │
│  │ createdAt       │           │ bio             │                 │
│  │ updatedAt       │           │ address         │                 │
│  └─────────────────┘           │ dateOfBirth     │                 │
│                                │ createdAt       │                 │
│                                │ updatedAt       │                 │
│                                └─────────────────┘                 │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔑 Key Concepts

### **Subscription Name: 'jobber'**

```typescript
// File: libs/pulsar/src/lib/pulsar.client.ts
subscription: 'jobber',  // ← Đây là tên nhóm consumer
```

**Giải thích:**

- **Subscription** = "Bookmark" của consumer group
- Tất cả instances của User Service đều dùng subscription `'jobber'`
- Pulsar sẽ:
  - ✅ Ghi nhớ message nào đã xử lý
  - ✅ Load balancing giữa các instances
  - ✅ Đảm bảo mỗi message chỉ xử lý 1 lần (trong Shared mode)

**Subscription Types:**

- `Shared` (default): Load balancing - mỗi message → 1 consumer
- `Failover`: Active/Standby - chỉ 1 consumer active
- `Exclusive`: Chỉ 1 consumer duy nhất
- `Key_Shared`: Load balancing theo key

## 📝 Implementation Details

### **1. Auth Service - Publisher**

```typescript
// File: apps/auth/src/app/auth/auth.service.ts

async register(body: RegisterBodyType) {
  // 1. Validate OTP
  await this.validateVerificationCode(...)

  // 2. Create user in AUTH_DB
  const user = await this.userRepository.createUser(...)

  // 3. 🚀 Publish event to Pulsar
  const producer = await this.pulsarClient.createProducer(
    'persistent://hacmieu/events/user-registered'
  );

  await producer.send({
    data: Buffer.from(JSON.stringify({
      userId: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt.toISOString()
    })),
    properties: {
      eventType: 'user.registered',
      version: '1.0',
      source: 'auth-service'
    }
  });

  return user;
}
```

### **2. User Service - Consumer**

```typescript
// File: apps/user/src/app/profile/profile.consumer.ts

async onModuleInit() {
  // 📡 Subscribe to user-registered events
  await this.pulsarClient.createConsumer(
    'persistent://hacmieu/events/user-registered',
    this.handleUserRegisteredEvent.bind(this)
  );
}

private async handleUserRegisteredEvent(message: Message) {
  const eventData = JSON.parse(message.getData().toString());

  // Create profile in USER_DB
  await this.ProfileService.createProfileFromAuthEvent(eventData);
}
```

## 🎯 Benefits của Microservice với Pulsar

### ✅ **Loose Coupling (Tách rời)**

- Auth Service không cần biết User Service có tồn tại hay không
- Chỉ cần publish event → done!
- User Service tự subscribe và xử lý

### ✅ **Async Processing (Xử lý bất đồng bộ)**

- User register → response ngay lập tức
- Profile creation chạy background (không ảnh hưởng UX)

### ✅ **Scalability (Mở rộng)**

- Chạy nhiều instances User Service
- Pulsar tự động load balancing
- Throughput tăng tuyến tính

### ✅ **Reliability (Đáng tin cậy)**

- Message persistence (lưu trữ)
- Retry mechanism (thử lại)
- Idempotency (xử lý trùng lặp)

### ✅ **Event Sourcing**

- Có thể replay events
- Audit trail (theo dõi lịch sử)
- Dễ debug

## 🚀 Next Steps

1. **Cài đặt Pulsar:**

   ```bash
   docker run -it -p 6650:6650 -p 8080:8080 apachepulsar/pulsar:latest bin/pulsar standalone
   ```

2. **Thêm biến môi trường:**

   ```env
   # .env
   PULSAR_SERVICE_URL=pulsar://localhost:6650
   ```

3. **Tạo Prisma schema cho User Service:**

   ```prisma
   model Profile {
     id          String    @id @default(uuid())
     userId      String    @unique
     email       String
     fullName    String
     phone       String
     avatarUrl   String?
     bio         String?
     address     String?
     dateOfBirth DateTime?
     createdAt   DateTime  @default(now())
     updatedAt   DateTime  @updatedAt

     @@map("user_profiles")
   }
   ```

4. **Test flow:**

   ```bash
   # Terminal 1: Run Pulsar
   docker run -it -p 6650:6650 -p 8080:8080 apachepulsar/pulsar:latest bin/pulsar standalone

   # Terminal 2: Run Auth Service
   nx serve auth

   # Terminal 3: Run User Service
   nx serve user

   # Terminal 4: Test API
   curl -X POST http://localhost:3000/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "name": "Test User",
       "phone": "0123456789",
       "password": "password123",
       "code": "123456"
     }'
   ```

## 📚 Topic Naming Convention

```
persistent://<tenant>/<namespace>/<topic-name>

persistent://hacmieu/events/user-registered
           │        │       │
           │        │       └─ Topic name (kebab-case)
           │        └───────── Namespace (events, commands, queries)
           └────────────────── Tenant (company/project name)
```

**Best Practices:**

- `events/` - For event-driven messages (user-registered, order-created)
- `commands/` - For command messages (send-email, process-payment)
- `queries/` - For query messages (get-user-stats)

## 🎓 Summary

**Subscription `'jobber'`** = Tên nhóm consumer, dùng để:

1. Track messages đã xử lý
2. Load balancing giữa nhiều instances
3. Ensure exactly-once processing

**Flow hoàn chỉnh:**

1. Client gọi API register
2. Auth Service tạo user trong DB
3. Auth Service publish event lên Pulsar
4. User Service subscribe event từ Pulsar
5. User Service tạo profile trong DB
6. ✅ Hoàn tất!
