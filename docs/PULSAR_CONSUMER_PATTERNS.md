# 🔄 Pulsar Consumer Pattern

## 📚 **2 Cách để tạo Pulsar Consumer**

---

## ✅ **Option 1: Sử dụng `PulsarConsumer` Abstract Class (RECOMMENDED)**

### **Ưu điểm:**

- ✅ Code ngắn gọn, dễ đọc
- ✅ Tự động handle deserialization, logging, errors
- ✅ Standardized pattern across all services
- ✅ Type-safe với TypeScript generics

### **Code:**

```typescript
// user-profile.consumer.ts
import { Injectable } from '@nestjs/common';
import { PulsarClient, PulsarConsumer } from '@hacmieu-journey/pulsar';
import { UserProfileService } from './user-profile.service';

interface UserRegisteredEvent {
  userId: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  createdAt: string;
}

@Injectable()
export class UserProfileConsumer extends PulsarConsumer<UserRegisteredEvent> {
  constructor(pulsarClient: PulsarClient, private readonly userProfileService: UserProfileService) {
    super(
      pulsarClient,
      'persistent://journey/events/user-registered', // Topic
      'user-service' // Service name
    );
  }

  // Chỉ cần implement method này!
  protected async onMessage(event: UserRegisteredEvent): Promise<void> {
    this.logger.log(`📥 Received event for user: ${event.userId}`);

    await this.userProfileService.createProfileFromAuthEvent(event);

    this.logger.log(`✅ Created profile for user: ${event.userId}`);
  }
}
```

### **Flow tự động:**

```
1. Module init → PulsarConsumer.onModuleInit()
2. Subscribe to topic với auto-generated subscription name
3. Receive message → PulsarConsumer.listener()
4. Deserialize JSON → deserialize<T>()
5. Call child's onMessage(data) → Your business logic
6. Success → Log ✅
7. Error → Log ❌ & throw (Pulsar will retry)
```

---

## ⚙️ **Option 2: Manual Implementation (Current)**

### **Khi nào dùng:**

- ⚠️ Cần custom logic phức tạp
- ⚠️ Multiple topics in one consumer
- ⚠️ Special error handling

### **Code:**

```typescript
// user-profile.consumer.ts (current)
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PulsarClient } from '@hacmieu-journey/pulsar';
import { Message } from 'pulsar-client';
import { UserProfileService } from './user-profile.service';

interface UserRegisteredEvent {
  userId: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  createdAt: string;
}

@Injectable()
export class UserProfileConsumer implements OnModuleInit {
  private readonly logger = new Logger(UserProfileConsumer.name);

  constructor(private readonly pulsarClient: PulsarClient, private readonly userProfileService: UserProfileService) {}

  async onModuleInit() {
    await this.pulsarClient.createConsumer('persistent://journey/events/user-registered', 'user-service', this.handleUserRegisteredEvent.bind(this));

    this.logger.log('✅ Subscribed to topic');
  }

  private async handleUserRegisteredEvent(message: Message) {
    try {
      const event: UserRegisteredEvent = JSON.parse(message.getData().toString());

      this.logger.log(`📥 Received event for user: ${event.userId}`);

      await this.userProfileService.createProfileFromAuthEvent(event);

      this.logger.log(`✅ Created profile for user: ${event.userId}`);
    } catch (error) {
      this.logger.error('❌ Failed to process event:', error);
      throw error;
    }
  }
}
```

### **Flow thủ công:**

```
1. Module init → onModuleInit()
2. Call pulsarClient.createConsumer() manually
3. Define listener function manually
4. Parse JSON manually
5. Handle errors manually
6. Log manually
```

---

## 📊 **So sánh 2 Options:**

| Feature             | Option 1 (Abstract Class) | Option 2 (Manual)     |
| ------------------- | ------------------------- | --------------------- |
| **Lines of code**   | ~30 lines                 | ~60 lines             |
| **Boilerplate**     | Minimal                   | Lots                  |
| **Type safety**     | ✅ Generic `<T>`          | ⚠️ Manual typing      |
| **Error handling**  | ✅ Built-in               | Manual                |
| **Logging**         | ✅ Standardized           | Custom                |
| **Deserialization** | ✅ Automatic              | Manual `JSON.parse()` |
| **Flexibility**     | ⚠️ Limited                | ✅ Full control       |
| **Recommended for** | ✅ Most use cases         | Complex scenarios     |

---

## 🎯 **Recommendation:**

### **✅ Dùng Option 1 (PulsarConsumer) khi:**

- Đơn giản subscribe 1 topic
- Chỉ cần xử lý message và gọi service
- Muốn code clean, maintainable
- **→ 90% use cases**

### **⚠️ Dùng Option 2 (Manual) khi:**

- Cần subscribe nhiều topics cùng lúc
- Custom error handling logic phức tạp
- Special deserialization (không phải JSON)
- **→ 10% use cases**

---

## 🔧 **Migration từ Option 2 → Option 1:**

### **Before (Manual):**

```typescript
@Injectable()
export class UserProfileConsumer implements OnModuleInit {
  private readonly logger = new Logger(UserProfileConsumer.name);

  constructor(private readonly pulsarClient: PulsarClient, private readonly userProfileService: UserProfileService) {}

  async onModuleInit() {
    await this.pulsarClient.createConsumer('persistent://journey/events/user-registered', 'user-service', this.handleUserRegisteredEvent.bind(this));
  }

  private async handleUserRegisteredEvent(message: Message) {
    try {
      const event = JSON.parse(message.getData().toString());
      await this.userProfileService.createProfileFromAuthEvent(event);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
```

### **After (Abstract Class):**

```typescript
@Injectable()
export class UserProfileConsumer extends PulsarConsumer<UserRegisteredEvent> {
  constructor(pulsarClient: PulsarClient, private readonly userProfileService: UserProfileService) {
    super(pulsarClient, 'persistent://journey/events/user-registered', 'user-service');
  }

  protected async onMessage(event: UserRegisteredEvent): Promise<void> {
    await this.userProfileService.createProfileFromAuthEvent(event);
  }
}
```

**→ Từ 40 lines xuống còn 15 lines!** 🎉

---

## 📝 **Example: Multiple Events Consumer**

Nếu cần handle nhiều events, dùng **Option 2** (Manual):

```typescript
@Injectable()
export class NotificationConsumer implements OnModuleInit {
  constructor(private readonly pulsarClient: PulsarClient) {}

  async onModuleInit() {
    // Subscribe to multiple topics
    await this.pulsarClient.createConsumer('persistent://journey/events/user-registered', 'notification-service', this.handleUserRegistered.bind(this));

    await this.pulsarClient.createConsumer('persistent://journey/events/booking-created', 'notification-service', this.handleBookingCreated.bind(this));

    await this.pulsarClient.createConsumer('persistent://journey/events/payment-completed', 'notification-service', this.handlePaymentCompleted.bind(this));
  }

  private async handleUserRegistered(message: Message) {
    // Send welcome email
  }

  private async handleBookingCreated(message: Message) {
    // Send booking confirmation
  }

  private async handlePaymentCompleted(message: Message) {
    // Send payment receipt
  }
}
```

Hoặc tạo **multiple abstract consumers**:

```typescript
// user-registered.consumer.ts
@Injectable()
export class UserRegisteredConsumer extends PulsarConsumer<UserRegisteredEvent> {
  constructor(pulsarClient: PulsarClient, private emailService: EmailService) {
    super(pulsarClient, 'persistent://journey/events/user-registered', 'notification-service');
  }

  protected async onMessage(event: UserRegisteredEvent) {
    await this.emailService.sendWelcomeEmail(event);
  }
}

// booking-created.consumer.ts
@Injectable()
export class BookingCreatedConsumer extends PulsarConsumer<BookingCreatedEvent> {
  constructor(pulsarClient: PulsarClient, private emailService: EmailService) {
    super(pulsarClient, 'persistent://journey/events/booking-created', 'notification-service');
  }

  protected async onMessage(event: BookingCreatedEvent) {
    await this.emailService.sendBookingConfirmation(event);
  }
}
```

---

## 🎓 **Tóm tắt:**

### **`PulsarConsumer` Abstract Class làm gì?**

1. ✅ **Tự động subscribe** topic khi module init
2. ✅ **Deserialize** message từ Buffer → JSON object
3. ✅ **Error handling** tự động (log & throw)
4. ✅ **Logging** standardized
5. ✅ **Type-safe** với TypeScript generics

### **Khi nào dùng?**

- ✅ **90% cases**: Dùng `PulsarConsumer` abstract class
- ⚠️ **10% cases**: Dùng manual implementation cho complex logic

### **Trong flow Auth → User Service:**

```
Auth Service (Publisher)
   │
   ├─ producer.send(event)
   │
   ▼
Pulsar Topic: user-registered
   │
   ▼
User Service (Consumer)
   │
   ├─ PulsarConsumer.onModuleInit()
   ├─ PulsarConsumer.listener(message)
   ├─ deserialize<UserRegisteredEvent>(message)
   ├─ onMessage(event) ← Your business logic
   └─ userProfileService.createProfile(event)
```

**→ Clean, simple, maintainable!** 🚀
