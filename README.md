# HacMieu Journey - Kiến trúc Microservice

## Tổng quan

HacMieu Journey là ứng dụng thuê phương tiện (ô tô, xe máy) được xây dựng theo kiến trúc Microservice với:

- **gRPC** cho communication đồng bộ giữa các services
- **Apache Pulsar** cho event-driven messaging (asynchronous)
- **API Gateway (REST)** cho client
- **Minikube (Kubernetes)** cho local development và deployment

---

## Sơ đồ kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Web Browser  │  │ Mobile App   │  │  Admin Panel │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                  │                       │
│         └─────────────────┴──────────────────┘                       │
│                           │                                          │
│                      HTTP/REST                                       │
└───────────────────────────┼──────────────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────────────┐
│                      API GATEWAY (NestJS)                            │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ • Authentication & Authorization (JWT)                         │ │
│  │ • Rate Limiting & Throttling                                   │ │
│  │ • Request Routing & Load Balancing                             │ │
│  │ • REST → gRPC Translation                                      │ │
│  │ • Response Aggregation                                         │ │
│  │ • API Versioning                                               │ │
│  │ • Logging & Monitoring                                         │ │
│  └────────────────────────────────────────────────────────────────┘ │
└───────────────────────────┬──────────────────────────────────────────┘
                            │
                         gRPC (Synchronous)
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌──────▼───────┐
│  AUTH SERVICE  │  │ VEHICLE SERVICE│  │BOOKING SERVICE│
│   (NestJS)     │  │   (NestJS)     │  │  (NestJS)    │
├────────────────┤  ├────────────────┤  ├──────────────┤
│ • Register     │  │ • Car Mgmt     │  │ • Create     │
│ • Login        │  │ • Motorcycle   │  │ • Update     │
│ • OTP verify   │  │ • Search/Filter│  │ • Check-in   │
│ • JWT tokens   │  │ • Details      │  │ • Check-out  │
│ • Password     │  │ • Reviews      │  │ • History    │
└────┬───┬───────┘  └────┬───┬───────┘  └──┬───┬───────┘
     │   │               │   │              │   │
     │   │Publish        │   │Publish       │   │Publish
     │   │Events         │   │Events        │   │Events
     │   │               │   │              │   │
     │   └───────────────┼───┴──────────────┼───┘
     │                   │                  │
     │              ┌────▼──────────────────▼────┐
     │              │   APACHE PULSAR CLUSTER    │
     │              │  ┌──────────────────────┐  │
     │              │  │  Topics:             │  │
     │              │  │  • user.events       │  │
     │              │  │  • booking.events    │  │
     │              │  │  • payment.events    │  │
     │              │  │  • vehicle.events    │  │
     │              │  │  • notification.req  │  │
     │              │  └──────────────────────┘  │
     │              └────┬──────────────────┬────┘
     │                   │Subscribe         │Subscribe
     │                   │Events            │Events
     │                   │                  │
    ┌▼────┐         ┌────▼────┐        ┌───▼─────┐
    │ Auth │         │ Vehicle │        │Booking  │
    │  DB  │         │   DB    │        │  DB     │
    │(PostgreSQL)    │(PostgreSQL)      │(PostgreSQL)
    └──────┘         └─────────┘        └─────────┘

        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌──────▼───────┐
│  USER SERVICE  │  │PAYMENT SERVICE │  │ NOTIFICATION │
│   (NestJS)     │  │   (NestJS)     │  │   SERVICE    │
├────────────────┤  ├────────────────┤  ├──────────────┤
│ • Profile      │  │ • QR Payment   │  │ • Email      │
│ • Address      │  │ • Wallet       │  │ • Push Notif │
│ • License      │  │ • Deposit      │  │ • In-app     │
│ • Credit score │  │ • Refund       │  │ • SMS        │
└────┬───┬───────┘  └────┬───┬───────┘  └──┬───┬───────┘
     │   │               │   │              │   │
     │   │Subscribe      │   │Subscribe     │   │Subscribe
     │   │Events         │   │Events        │   │Events
     │   │               │   │              │   │
     │   └───────────────┴───┴──────────────┴───┘
     │                        │
     │                   (via Pulsar)
     │                        │
    ┌▼────┐         ┌────▼────┐        ┌───▼─────┐
    │ User │         │ Payment │        │ Notif   │
    │  DB  │         │   DB    │        │  DB     │
    │(PostgreSQL)    │(PostgreSQL)      │(MongoDB)│
    └──────┘         └─────────┘        └─────────┘

        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌──────▼───────┐
│COMPLAINT SERVICE│ │ PROMO SERVICE  │  │  CHAT SERVICE│
│   (NestJS)     │  │   (NestJS)     │  │  (NestJS)    │
├────────────────┤  ├────────────────┤  ├──────────────┤
│ • Create       │  │ • Promo codes  │  │ • WebSocket  │
│ • Update       │  │ • Discounts    │  │ • Real-time  │
│ • Close        │  │ • Validation   │  │ • Support    │
│ • Messaging    │  │ • Application  │  │ • History    │
└────────┬───────┘  └────────┬───────┘  └──────┬───────┘
         │                   │                  │
    ┌────▼────┐         ┌────▼────┐        ┌───▼─────┐
    │Complaint│         │ Promo   │        │  Chat   │
    │   DB    │         │   DB    │        │   DB    │
    │(PostgreSQL)│      │(PostgreSQL)│     │(MongoDB)│
    └─────────┘         └─────────┘        └─────────┘

┌─────────────────────────────────────────────────────────────────────┐
│          🚢 MINIKUBE (Local Kubernetes Cluster)                     │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │ • Container Orchestration                                      ││
│  │ • Auto-scaling (HPA)                                          ││
│  │ • Service Discovery                                            ││
│  │ • Load Balancing                                              ││
│  │ • ConfigMaps & Secrets                                        ││
│  │ • Persistent Volumes                                          ││
│  │ • Ingress Controller                                          ││
│  └────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

    ┌────▼────┐         ┌────▼────┐        ┌───▼─────┐
    │ Auth DB │         │ Vehicle │        │Booking  │
    │(PostgreSQL)│      │   DB    │        │  DB     │
    └─────────┘         │(PostgreSQL)│     │(PostgreSQL)│
                        └─────────┘        └─────────┘

        │                   │                   │

┌───────▼────────┐ ┌───────▼────────┐ ┌──────▼───────┐
│ USER SERVICE │ │PAYMENT SERVICE │ │ NOTIFICATION │
│ (NestJS) │ │ (NestJS) │ │ SERVICE │
├────────────────┤ ├────────────────┤ ├──────────────┤
│ • Profile │ │ • QR Payment │ │ • Email │
│ • Address │ │ • Wallet │ │ • Push Notif │
│ • License │ │ • Deposit │ │ • In-app │
│ • Credit score │ │ • Refund │ │ • SMS │
└────────┬───────┘ └────────┬───────┘ └──────┬───────┘
│ │ │
┌────▼────┐ ┌────▼────┐ ┌───▼─────┐
│ User DB │ │ Payment │ │ Notif │
│(PostgreSQL)│ │ DB │ │ DB │
└─────────┘ │(PostgreSQL)│ │(MongoDB)│
└─────────┘ └─────────┘

        │                   │                   │

┌───────▼────────┐ ┌───────▼────────┐ ┌──────▼───────┐
│COMPLAINT SERVICE│ │ PROMO SERVICE │ │ CHAT SERVICE│
│ (NestJS) │ │ (NestJS) │ │ (NestJS) │
├────────────────┤ ├────────────────┤ ├──────────────┤
│ • Create │ │ • Promo codes │ │ • WebSocket │
│ • Update │ │ • Discounts │ │ • Real-time │
│ • Close │ │ • Validation │ │ • Support │
│ • Messaging │ │ • Application │ │ • History │
└────────┬───────┘ └────────┬───────┘ └──────┬───────┘
│ │ │
┌────▼────┐ ┌────▼────┐ ┌───▼─────┐
│Complaint│ │ Promo │ │ Chat │
│ DB │ │ DB │ │ DB │
│(PostgreSQL)│ │(PostgreSQL)│ │(MongoDB)│
└─────────┘ └─────────┘ └─────────┘

```

---

## Chi tiết các Microservices

### 1. **API Gateway**

**Công nghệ:** NestJS + REST API

**Chức năng:**

- Điểm vào duy nhất cho tất cả client requests
- Chuyển đổi HTTP/REST → gRPC
- Authentication & Authorization (JWT)
- Rate limiting, caching
- Request routing & aggregation
- Logging & monitoring

**Endpoints mẫu:**

```

GET /api/v1/auth/login
POST /api/v1/auth/register
GET /api/v1/vehicles/cars
GET /api/v1/vehicles/motorcycles
POST /api/v1/bookings
PUT /api/v1/bookings/:id/check-in
DELETE /api/v1/bookings/:id
GET /api/v1/users/profile
POST /api/v1/payments/qr

````

---

### 2. **Auth Service**

**Database:** PostgreSQL (auth_db)

**Schema chính:**

```sql
users (id, email, phone, password_hash, role, created_at)
otp_codes (id, user_id, code, type, expires_at, verified)
refresh_tokens (id, user_id, token, expires_at)
````

**Chức năng:**

- Đăng ký/đăng nhập (email hoặc SĐT)
- Xác thực OTP qua email
- Quản lý JWT tokens (access + refresh)
- Đổi mật khẩu
- Quên mật khẩu

**gRPC Methods:**

```protobuf
service AuthService {
  rpc Register(RegisterRequest) returns (AuthResponse);
  rpc Login(LoginRequest) returns (AuthResponse);
  rpc VerifyOTP(OTPRequest) returns (OTPResponse);
  rpc RefreshToken(RefreshRequest) returns (AuthResponse);
  rpc ChangePassword(ChangePasswordRequest) returns (StatusResponse);
  rpc ResetPassword(ResetPasswordRequest) returns (StatusResponse);
}
```

---

### 3. **User Service**

**Database:** PostgreSQL (user_db)

**Schema chính:**

```sql
profiles (id, user_id, full_name, avatar_url, facebook_url, credit_score)
addresses (id, user_id, type, label, city, district, detail, is_default)
driver_licenses (id, user_id, license_number, full_name, dob, verified, image_url)
```

**Chức năng:**

- Quản lý hồ sơ cá nhân
- Quản lý địa chỉ (thêm/sửa/xóa)
- Xác thực giấy phép lái xe (upload ảnh + thông tin)
- Điểm tín nhiệm

**gRPC Methods:**

```protobuf
service UserService {
  rpc GetProfile(UserIdRequest) returns (ProfileResponse);
  rpc UpdateProfile(UpdateProfileRequest) returns (ProfileResponse);
  rpc AddAddress(AddAddressRequest) returns (AddressResponse);
  rpc GetAddresses(UserIdRequest) returns (AddressListResponse);
  rpc UploadLicense(LicenseRequest) returns (LicenseResponse);
  rpc VerifyLicense(LicenseIdRequest) returns (StatusResponse);
}
```

---

### 4. **Vehicle Service**

**Database:** PostgreSQL (vehicle_db)

**Schema chính:**

```sql
vehicles (id, type, name, brand, model, seats, fuel_type, fuel_consumption,
          price_per_hour, price_per_day, description, location_lat, location_lng,
          status, created_at)
vehicle_images (id, vehicle_id, url, order)
vehicle_amenities (id, vehicle_id, amenity_type, available)
reviews (id, vehicle_id, user_id, rating, comment, created_at)
```

**Chức năng:**

- Quản lý xe ô tô & xe máy
- Tìm kiếm & lọc xe (giá, số chỗ, hãng, khu vực...)
- Chi tiết xe (hình ảnh, tiện nghi, vị trí)
- Đánh giá xe (rating + comment)
- Phân trang

**gRPC Methods:**

```protobuf
service VehicleService {
  rpc GetVehicles(GetVehiclesRequest) returns (VehicleListResponse);
  rpc GetVehicleById(VehicleIdRequest) returns (VehicleResponse);
  rpc SearchVehicles(SearchRequest) returns (VehicleListResponse);
  rpc AddReview(ReviewRequest) returns (ReviewResponse);
  rpc GetReviews(VehicleIdRequest) returns (ReviewListResponse);
}
```

---

### 5. **Booking Service**

**Database:** PostgreSQL (booking_db)

**Schema chính:**

```sql
bookings (id, user_id, vehicle_id, start_time, end_time,
          pickup_type, pickup_address,
          rental_fee, insurance_fee, vat, deposit, discount, total,
          status, created_at)
booking_history (id, booking_id, action, notes, created_at)
check_in_out (id, booking_id, type, images, created_at)
```

**Chức năng:**

- Tạo đơn thuê xe
- Tính toán phí (thuê + bảo hiểm + VAT + cọc - giảm giá)
- Lịch sử thuê (đang thuê/đã thuê)
- Check-in/Check-out (upload 5-6 ảnh)
- Huỷ chuyến
- Trạng thái đơn thuê

**gRPC Methods:**

```protobuf
service BookingService {
  rpc CreateBooking(BookingRequest) returns (BookingResponse);
  rpc GetBookingHistory(UserIdRequest) returns (BookingListResponse);
  rpc CheckIn(CheckInRequest) returns (StatusResponse);
  rpc CheckOut(CheckOutRequest) returns (StatusResponse);
  rpc CancelBooking(BookingIdRequest) returns (StatusResponse);
}
```

---

### 6. **Payment Service**

**Database:** PostgreSQL (payment_db)

**Schema chính:**

```sql
wallets (id, user_id, bank_account, account_number, account_holder, balance)
transactions (id, booking_id, user_id, amount, type, status, qr_code_url, created_at)
deposits (id, booking_id, amount, status, refunded_at)
```

**Chức năng:**

- Tạo mã QR thanh toán
- Xử lý thanh toán (thế chấp 500k + tổng tiền)
- Quản lý ví điện tử
- Hoàn tiền cọc
- Lịch sử giao dịch

**gRPC Methods:**

```protobuf
service PaymentService {
  rpc GenerateQRCode(PaymentRequest) returns (QRCodeResponse);
  rpc ConfirmPayment(ConfirmRequest) returns (PaymentResponse);
  rpc GetWallet(UserIdRequest) returns (WalletResponse);
  rpc RefundDeposit(RefundRequest) returns (StatusResponse);
  rpc GetTransactions(UserIdRequest) returns (TransactionListResponse);
}
```

---

### 7. **Promo Service**

**Database:** PostgreSQL (promo_db)

**Schema chính:**

```sql
promo_codes (id, code, discount_type, discount_value, min_order, max_discount,
             valid_from, valid_to, usage_limit, used_count, active)
user_promos (id, user_id, promo_id, used_at)
```

**Chức năng:**

- Quản lý mã giảm giá
- Áp dụng mã giảm giá
- Kiểm tra tính hợp lệ (thời gian, số lần dùng, điều kiện)
- Danh sách mã available

**gRPC Methods:**

```protobuf
service PromoService {
  rpc GetAvailablePromos(UserIdRequest) returns (PromoListResponse);
  rpc ValidatePromo(ValidatePromoRequest) returns (PromoResponse);
  rpc ApplyPromo(ApplyPromoRequest) returns (DiscountResponse);
}
```

---

### 8. **Notification Service**

**Database:** MongoDB (notification_db)

**Collections:**

```javascript
notifications {
  _id, user_id, type, title, content,
  read, created_at, data
}
```

**Chức năng:**

- Gửi thông báo in-app
- Gửi email (OTP, xác nhận đặt xe, nhắc nhở)
- Push notification (mobile)
- SMS notification
- Đánh dấu đã đọc

**gRPC Methods:**

```protobuf
service NotificationService {
  rpc SendNotification(NotificationRequest) returns (StatusResponse);
  rpc GetNotifications(UserIdRequest) returns (NotificationListResponse);
  rpc MarkAsRead(NotificationIdRequest) returns (StatusResponse);
  rpc SendEmail(EmailRequest) returns (StatusResponse);
}
```

---

### 9. **Complaint Service**

**Database:** PostgreSQL (complaint_db)

**Schema chính:**

```sql
complaints (id, user_id, booking_id, title, description, status, created_at)
complaint_images (id, complaint_id, url)
complaint_messages (id, complaint_id, sender_id, message, created_at)
```

**Chức năng:**

- Tạo khiếu nại (tiêu đề + mô tả + ảnh)
- Nhắn tin trong khiếu nại (forum-style)
- Cập nhật trạng thái (đang mở/đã đóng)
- Lịch sử khiếu nại

**gRPC Methods:**

```protobuf
service ComplaintService {
  rpc CreateComplaint(ComplaintRequest) returns (ComplaintResponse);
  rpc GetComplaints(UserIdRequest) returns (ComplaintListResponse);
  rpc AddMessage(MessageRequest) returns (MessageResponse);
  rpc CloseComplaint(ComplaintIdRequest) returns (StatusResponse);
}
```

---

### 10. **Chat Service**

**Database:** MongoDB (chat_db)

**Collections:**

```javascript
chat_rooms {
  _id, user_id, support_id, status, created_at
}
messages {
  _id, room_id, sender_id, message, created_at, read
}
```

**Chức năng:**

- Chat real-time với support (WebSocket)
- Lịch sử chat
- Online/offline status
- Typing indicator

**gRPC Methods:**

```protobuf
service ChatService {
  rpc CreateChatRoom(ChatRoomRequest) returns (ChatRoomResponse);
  rpc SendMessage(ChatMessageRequest) returns (MessageResponse);
  rpc GetChatHistory(ChatRoomIdRequest) returns (MessageListResponse);
  rpc GetActiveChatRooms(EmptyRequest) returns (ChatRoomListResponse);
}
```

---

## Database Strategy: Mỗi Service 1 Database Riêng

### ✅ **Khuyến nghị: DATABASE PER SERVICE**

Trong kiến trúc microservice, **mỗi service NÊN có database riêng**:

#### **Lý do:**

1. **Độc lập (Loose Coupling)**

   - Mỗi service quản lý data của chính nó
   - Thay đổi schema không ảnh hưởng services khác
   - Deploy độc lập

2. **Scalability**

   - Scale database theo nhu cầu từng service
   - VD: Payment Service cần ACID → PostgreSQL
   - VD: Chat Service cần flexible schema → MongoDB

3. **Resilience**

   - Database của 1 service down không ảnh hưởng toàn hệ thống
   - Fault isolation

4. **Technology Freedom**
   - Chọn database phù hợp cho từng service
   - PostgreSQL: Auth, User, Vehicle, Booking, Payment, Promo, Complaint
   - MongoDB: Notification, Chat (NoSQL cho unstructured data)

#### **Thách thức:**

1. **Data Consistency**

   - Không có ACID transactions across services
   - **Giải pháp:** Saga Pattern (choreography/orchestration)
   - Event-driven architecture

2. **Data Duplication**

   - VD: User info có thể ở User DB và Booking DB
   - **Giải pháp:**
     - Lưu minimal data (chỉ user_id)
     - Gọi User Service khi cần full info
     - Event sourcing để sync data

3. **Queries phức tạp**
   - JOIN giữa nhiều databases không được
   - **Giải pháp:**
     - API Composition (Gateway gọi nhiều services)
     - CQRS pattern (tạo read-only database riêng)
     - Materialized views

---

## Communication Patterns

### 1. **Synchronous Communication: gRPC**

**Use Case:** Request-response pattern, cần kết quả ngay lập tức

```
API Gateway → Auth Service (validate token)
API Gateway → Vehicle Service (get vehicle details)
Booking Service → Vehicle Service (check availability)
Booking Service → Payment Service (create payment)
User Service → Auth Service (validate session)
```

**Ưu điểm:**

- Performance cao (binary protocol, HTTP/2)
- Type-safe với Protocol Buffers
- Bi-directional streaming support
- Built-in code generation

---

### 2. **Asynchronous Communication: Apache Pulsar**

**Use Case:** Event-driven, không cần response ngay, decoupling services

#### **Tại sao chọn Apache Pulsar thay vì Kafka/RabbitMQ?**

✅ **Multi-tenancy:** Hỗ trợ nhiều tenant, namespace isolation  
✅ **Geo-replication:** Built-in replication across data centers  
✅ **Tiered Storage:** Tự động offload old messages sang S3/GCS  
✅ **Native support:** Message queue + Pub/Sub trong 1 platform  
✅ **Pulsar Functions:** Serverless computing trên stream data  
✅ **Guaranteed ordering:** Per-key ordering  
✅ **Schema Registry:** Built-in schema management

#### **Pulsar Topics Structure:**

```yaml
persistent://tenant/namespace/topic

# HacMieu Journey Topics:
persistent://hacmieu/events/user-registered
persistent://hacmieu/events/booking-created
persistent://hacmieu/events/booking-confirmed
persistent://hacmieu/events/payment-completed
persistent://hacmieu/events/payment-failed
persistent://hacmieu/events/vehicle-status-changed
persistent://hacmieu/events/check-in-completed
persistent://hacmieu/events/check-out-completed
persistent://hacmieu/events/review-submitted
persistent://hacmieu/events/complaint-created
persistent://hacmieu/notifications/email-request
persistent://hacmieu/notifications/sms-request
persistent://hacmieu/notifications/push-request
```

#### **Event Flow Examples:**

**1. Booking Created Event:**

```javascript
// Producer: Booking Service
await pulsarClient
  .producer({
    topic: 'persistent://hacmieu/events/booking-created',
  })
  .send({
    properties: {
      eventType: 'booking.created',
      version: '1.0',
    },
    data: {
      bookingId: '123',
      userId: '456',
      vehicleId: '789',
      startTime: '2025-10-10T10:00:00Z',
      endTime: '2025-10-11T10:00:00Z',
      totalAmount: 500000,
    },
    timestamp: Date.now(),
  });

// Consumers:
// 1. Payment Service → Create payment record
// 2. Notification Service → Send confirmation email
// 3. Vehicle Service → Update vehicle status to 'BOOKED'
```

**2. Payment Completed Event:**

```javascript
// Producer: Payment Service
await pulsarClient
  .producer({
    topic: 'persistent://hacmieu/events/payment-completed',
  })
  .send({
    data: {
      paymentId: 'PAY-123',
      bookingId: '123',
      userId: '456',
      amount: 500000,
      method: 'QR_CODE',
      transactionId: 'TXN-789',
    },
  });

// Consumers:
// 1. Booking Service → Update booking status to 'CONFIRMED'
// 2. Notification Service → Send payment success notification
// 3. User Service → Update credit score
```

**3. Check-out Completed Event:**

```javascript
// Producer: Booking Service
await pulsarClient
  .producer({
    topic: 'persistent://hacmieu/events/check-out-completed',
  })
  .send({
    data: {
      bookingId: '123',
      userId: '456',
      vehicleId: '789',
      checkOutImages: ['url1', 'url2', 'url3'],
      checkOutTime: '2025-10-11T10:30:00Z',
    },
  });

// Consumers:
// 1. Payment Service → Process deposit refund
// 2. Vehicle Service → Update vehicle status to 'AVAILABLE'
// 3. Notification Service → Send review request
```

#### **Pulsar Consumer Groups:**

```typescript
// Payment Service subscribes to booking events
const consumer = await pulsarClient.subscribe({
  topic: 'persistent://hacmieu/events/booking-created',
  subscription: 'payment-service-subscription',
  subscriptionType: 'Shared', // Multiple consumers, load balanced
  subscriptionInitialPosition: 'Latest',
});

// Notification Service subscribes to multiple topics
const multiTopicConsumer = await pulsarClient.subscribe({
  topics: ['persistent://hacmieu/events/booking-created', 'persistent://hacmieu/events/payment-completed', 'persistent://hacmieu/events/check-out-completed'],
  subscription: 'notification-service-subscription',
  subscriptionType: 'Shared',
});
```

#### **Dead Letter Queue (DLQ) Pattern:**

```typescript
const consumer = await pulsarClient.subscribe({
  topic: 'persistent://hacmieu/notifications/email-request',
  subscription: 'email-processor',
  deadLetterPolicy: {
    maxRedeliverCount: 3,
    deadLetterTopic: 'persistent://hacmieu/dlq/email-failed',
  },
});

// Nếu email gửi fail 3 lần → move to DLQ để manual retry
```

---

### 3. **Event-Driven Architecture with Pulsar**

```javascript
// Event Schema (Avro format)
{
  "type": "record",
  "name": "BookingCreatedEvent",
  "namespace": "com.hacmieu.events",
  "fields": [
    {"name": "eventId", "type": "string"},
    {"name": "eventType", "type": "string"},
    {"name": "timestamp", "type": "long"},
    {"name": "bookingId", "type": "string"},
    {"name": "userId", "type": "string"},
    {"name": "vehicleId", "type": "string"},
    {"name": "totalAmount", "type": "double"}
  ]
}
```

**Saga Pattern với Pulsar:**

```
1. Booking Service → Publish 'booking.created'
2. Payment Service → Subscribe & Create payment
   → On Success: Publish 'payment.completed'
   → On Failure: Publish 'payment.failed'
3. If 'payment.failed':
   → Booking Service subscribes & Rollback booking
   → Notification Service → Send failure notification
```

---

## Luồng hoạt động chính

### **Quy trình thuê xe:**

```
1. User chọn xe → GET /api/v1/vehicles/:id
   Gateway → Vehicle Service (gRPC)

2. User click "Thuê xe" → Redirect to booking page

3. Apply promo code → POST /api/v1/promos/apply
   Gateway → Promo Service (gRPC)

4. Create booking → POST /api/v1/bookings
   Gateway → Booking Service (gRPC)
   Booking Service → Vehicle Service (check availability)
   Booking Service → Promo Service (validate discount)

5. Generate QR payment → POST /api/v1/payments/qr
   Gateway → Payment Service (gRPC)

6. User confirms payment → POST /api/v1/payments/confirm
   Payment Service → Booking Service (update status) [Event]
   Notification Service → Send confirmation email [Event]

7. Check-in → PUT /api/v1/bookings/:id/check-in
   Gateway → Booking Service (upload images)

8. Check-out → PUT /api/v1/bookings/:id/check-out
   Gateway → Booking Service (upload images)
   Booking Service → Payment Service (refund deposit) [Event]

9. Submit review → POST /api/v1/vehicles/:id/reviews
   Gateway → Vehicle Service (add review)
```

---

## Deployment Strategy với Minikube (Kubernetes)

### **Tại sao chọn Minikube?**

✅ **Local Development:** Kubernetes cluster chạy local, không cần cloud  
✅ **Cost-effective:** Free, tiết kiệm chi phí development  
✅ **Full K8s Features:** Hỗ trợ đầy đủ tính năng production Kubernetes  
✅ **Easy Setup:** Cài đặt đơn giản, phù hợp development & testing  
✅ **Multi-node Support:** Có thể test multi-node cluster locally

---

### **Architecture Overview trên Minikube:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    MINIKUBE CLUSTER                             │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              INGRESS CONTROLLER (NGINX)                   │ │
│  │  • Route traffic to services                              │ │
│  │  • TLS termination                                        │ │
│  │  • hacmieu.local → API Gateway                            │ │
│  └───────────────────────────┬───────────────────────────────┘ │
│                              │                                 │
│  ┌───────────────────────────▼───────────────────────────────┐ │
│  │         API GATEWAY SERVICE (LoadBalancer)                │ │
│  │  • 3 Replicas (High Availability)                         │ │
│  │  • Auto-scaling: min=2, max=5                             │ │
│  └───────────────────────────┬───────────────────────────────┘ │
│                              │                                 │
│              ┌───────────────┼───────────────┐                 │
│              │               │               │                 │
│  ┌───────────▼─────┐ ┌───────▼─────┐ ┌─────▼────────┐         │
│  │ Auth Service    │ │Vehicle Svc  │ │Booking Svc   │         │
│  │ (ClusterIP)     │ │(ClusterIP)  │ │(ClusterIP)   │         │
│  │ Replicas: 2     │ │Replicas: 3  │ │Replicas: 3   │         │
│  └─────┬───────────┘ └─────┬───────┘ └─────┬────────┘         │
│        │                   │               │                   │
│  ┌─────▼───────────┐ ┌─────▼───────┐ ┌─────▼────────┐         │
│  │User Service     │ │Payment Svc  │ │Notification  │         │
│  │(ClusterIP)      │ │(ClusterIP)  │ │Service       │         │
│  │Replicas: 2      │ │Replicas: 2  │ │(ClusterIP)   │         │
│  └─────┬───────────┘ └─────┬───────┘ │Replicas: 2   │         │
│        │                   │         └─────┬────────┘         │
│  ┌─────▼───────────┐ ┌─────▼───────┐ ┌─────▼────────┐         │
│  │Promo Service    │ │Complaint Svc│ │Chat Service  │         │
│  │(ClusterIP)      │ │(ClusterIP)  │ │(ClusterIP)   │         │
│  │Replicas: 1      │ │Replicas: 1  │ │Replicas: 2   │         │
│  └─────────────────┘ └─────────────┘ └──────────────┘         │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │           APACHE PULSAR CLUSTER (StatefulSet)             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │  Broker-0    │  │  Broker-1    │  │  Broker-2    │    │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │ BookKeeper-0 │  │ BookKeeper-1 │  │ BookKeeper-2 │    │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │ │
│  │  ┌──────────────┐                                         │ │
│  │  │  ZooKeeper   │  (3 nodes for HA)                      │ │
│  │  └──────────────┘                                         │ │
│  │  • PersistentVolume: 20GB per broker                     │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              DATABASES (StatefulSet)                      │ │
│  │  ┌──────────────────────────────────────────────────┐    │ │
│  │  │ PostgreSQL Cluster (3 replicas)                  │    │ │
│  │  │  • Auth DB, User DB, Vehicle DB, Booking DB      │    │ │
│  │  │  • Payment DB, Promo DB, Complaint DB            │    │ │
│  │  │  • PersistentVolume: 50GB                        │    │ │
│  │  │  • Backup to PV daily                            │    │ │
│  │  └──────────────────────────────────────────────────┘    │ │
│  │  ┌──────────────────────────────────────────────────┐    │ │
│  │  │ MongoDB Cluster (3 replicas - Replica Set)       │    │ │
│  │  │  • Notification DB, Chat DB                      │    │ │
│  │  │  • PersistentVolume: 30GB                        │    │ │
│  │  └──────────────────────────────────────────────────┘    │ │
│  │  ┌──────────────────────────────────────────────────┐    │ │
│  │  │ Redis (StatefulSet - 1 master + 2 replicas)      │    │ │
│  │  │  • Caching layer                                 │    │ │
│  │  │  • Session storage                               │    │ │
│  │  └──────────────────────────────────────────────────┘    │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │         MONITORING & OBSERVABILITY STACK                  │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐          │ │
│  │  │ Prometheus │  │  Grafana   │  │   Jaeger   │          │ │
│  │  │ (Metrics)  │  │(Dashboard) │  │ (Tracing)  │          │ │
│  │  └────────────┘  └────────────┘  └────────────┘          │ │
│  │  ┌─────────────────────────────────────────────┐         │ │
│  │  │ ELK Stack (Elasticsearch + Logstash + Kibana)│        │ │
│  │  └─────────────────────────────────────────────┘         │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

### **Kubernetes Resources Configuration:**

#### **1. Namespace:**

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: hacmieu-journey
  labels:
    app: hacmieu
    environment: development
```

---

#### **2. API Gateway Deployment:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: hacmieu-journey
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
        - name: api-gateway
          image: hacmieu/api-gateway:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: 'production'
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: jwt-secret
            - name: PULSAR_SERVICE_URL
              value: 'pulsar://pulsar-broker:6650'
          resources:
            requests:
              memory: '256Mi'
              cpu: '250m'
            limits:
              memory: '512Mi'
              cpu: '500m'
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              Port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
  namespace: hacmieu-journey
spec:
  type: LoadBalancer
  selector:
    app: api-gateway
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
  namespace: hacmieu-journey
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 2
  maxReplicas: 5
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

---

#### **3. Auth Service Deployment:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: hacmieu-journey
spec:
  replicas: 2
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
        - name: auth-service
          image: hacmieu/auth-service:latest
          ports:
            - containerPort: 5000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-secrets
                  key: auth-db-url
            - name: PULSAR_SERVICE_URL
              value: 'pulsar://pulsar-broker:6650'
            - name: REDIS_HOST
              value: 'redis-master'
          resources:
            requests:
              memory: '256Mi'
              cpu: '250m'
            limits:
              memory: '512Mi'
              cpu: '500m'
---
apiVersion: v1
kind: Service
metadata:
  name: auth-service
  namespace: hacmieu-journey
spec:
  type: ClusterIP
  selector:
    app: auth-service
  ports:
    - protocol: TCP
      port: 5000
      targetPort: 5000
```

---

#### **4. Apache Pulsar Deployment:**

```yaml
# ZooKeeper StatefulSet
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: pulsar-zookeeper
  namespace: hacmieu-journey
spec:
  serviceName: pulsar-zookeeper
  replicas: 3
  selector:
    matchLabels:
      app: pulsar-zookeeper
  template:
    metadata:
      labels:
        app: pulsar-zookeeper
    spec:
      containers:
        - name: zookeeper
          image: apachepulsar/pulsar:3.1.0
          command: ['bin/pulsar']
          args: ['zookeeper']
          ports:
            - containerPort: 2181
              name: client
            - containerPort: 2888
              name: follower
            - containerPort: 3888
              name: election
          volumeMounts:
            - name: data
              mountPath: /pulsar/data
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ['ReadWriteOnce']
        resources:
          requests:
            storage: 10Gi
---
# BookKeeper StatefulSet
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: pulsar-bookkeeper
  namespace: hacmieu-journey
spec:
  serviceName: pulsar-bookkeeper
  replicas: 3
  selector:
    matchLabels:
      app: pulsar-bookkeeper
  template:
    metadata:
      labels:
        app: pulsar-bookkeeper
    spec:
      containers:
        - name: bookkeeper
          image: apachepulsar/pulsar:3.1.0
          command: ['bin/pulsar']
          args: ['bookie']
          ports:
            - containerPort: 3181
          env:
            - name: PULSAR_MEM
              value: '-Xms512m -Xmx512m'
            - name: zkServers
              value: 'pulsar-zookeeper-0.pulsar-zookeeper:2181,pulsar-zookeeper-1.pulsar-zookeeper:2181,pulsar-zookeeper-2.pulsar-zookeeper:2181'
          volumeMounts:
            - name: data
              mountPath: /pulsar/data
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ['ReadWriteOnce']
        resources:
          requests:
            storage: 20Gi
---
# Pulsar Broker Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pulsar-broker
  namespace: hacmieu-journey
spec:
  replicas: 3
  selector:
    matchLabels:
      app: pulsar-broker
  template:
    metadata:
      labels:
        app: pulsar-broker
    spec:
      containers:
        - name: broker
          image: apachepulsar/pulsar:3.1.0
          command: ['bin/pulsar']
          args: ['broker']
          ports:
            - containerPort: 6650
              name: pulsar
            - containerPort: 8080
              name: http
          env:
            - name: PULSAR_MEM
              value: '-Xms512m -Xmx512m'
            - name: zookeeperServers
              value: 'pulsar-zookeeper-0.pulsar-zookeeper:2181'
            - name: configurationStoreServers
              value: 'pulsar-zookeeper-0.pulsar-zookeeper:2181'
---
apiVersion: v1
kind: Service
metadata:
  name: pulsar-broker
  namespace: hacmieu-journey
spec:
  type: ClusterIP
  selector:
    app: pulsar-broker
  ports:
    - name: pulsar
      protocol: TCP
      port: 6650
      targetPort: 6650
    - name: http
      protocol: TCP
      port: 8080
      targetPort: 8080
```

---

#### **5. PostgreSQL Deployment:**

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgresql
  namespace: hacmieu-journey
spec:
  serviceName: postgresql
  replicas: 1
  selector:
    matchLabels:
      app: postgresql
  template:
    metadata:
      labels:
        app: postgresql
    spec:
      containers:
        - name: postgresql
          image: postgres:15-alpine
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: db-secrets
                  key: postgres-password
            - name: PGDATA
              value: /var/lib/postgresql/data/pgdata
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ['ReadWriteOnce']
        resources:
          requests:
            storage: 50Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgresql
  namespace: hacmieu-journey
spec:
  type: ClusterIP
  selector:
    app: postgresql
  ports:
    - protocol: TCP
      port: 5432
      targetPort: 5432
```

---

#### **6. ConfigMap & Secrets:**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: hacmieu-journey
data:
  NODE_ENV: 'production'
  LOG_LEVEL: 'info'
  PULSAR_NAMESPACE: 'hacmieu/events'
  PULSAR_TENANT: 'hacmieu'
---
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: hacmieu-journey
type: Opaque
stringData:
  jwt-secret: 'your-super-secret-jwt-key-change-in-production'
  jwt-refresh-secret: 'your-refresh-token-secret'
---
apiVersion: v1
kind: Secret
metadata:
  name: db-secrets
  namespace: hacmieu-journey
type: Opaque
stringData:
  postgres-password: 'your-postgres-password'
  auth-db-url: 'postgresql://postgres:password@postgresql:5432/auth_db'
  user-db-url: 'postgresql://postgres:password@postgresql:5432/user_db'
  vehicle-db-url: 'postgresql://postgres:password@postgresql:5432/vehicle_db'
  booking-db-url: 'postgresql://postgres:password@postgresql:5432/booking_db'
  payment-db-url: 'postgresql://postgres:password@postgresql:5432/payment_db'
```

---

#### **7. Ingress Configuration:**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hacmieu-ingress
  namespace: hacmieu-journey
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: 'false'
spec:
  ingressClassName: nginx
  rules:
    - host: hacmieu.local
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api-gateway
                port:
                  number: 80
```

---

### **Minikube Setup Commands:**

```bash
# 1. Start Minikube với đủ resources
minikube start --cpus=4 --memory=8192 --disk-size=50g --driver=docker

# 2. Enable addons
minikube addons enable ingress
minikube addons enable metrics-server
minikube addons enable dashboard

# 3. Create namespace
kubectl create namespace hacmieu-journey

# 4. Apply configurations
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/postgresql.yaml
kubectl apply -f k8s/mongodb.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/pulsar/

# 5. Deploy services
kubectl apply -f k8s/services/auth-service.yaml
kubectl apply -f k8s/services/user-service.yaml
kubectl apply -f k8s/services/vehicle-service.yaml
kubectl apply -f k8s/services/booking-service.yaml
kubectl apply -f k8s/services/payment-service.yaml
kubectl apply -f k8s/services/notification-service.yaml
kubectl apply -f k8s/services/promo-service.yaml
kubectl apply -f k8s/services/complaint-service.yaml
kubectl apply -f k8s/services/chat-service.yaml

# 6. Deploy API Gateway
kubectl apply -f k8s/api-gateway.yaml

# 7. Deploy Ingress
kubectl apply -f k8s/ingress.yaml

# 8. Add to /etc/hosts (Windows: C:\Windows\System32\drivers\etc\hosts)
echo "$(minikube ip) hacmieu.local" | sudo tee -a /etc/hosts

# 9. Check status
kubectl get pods -n hacmieu-journey
kubectl get services -n hacmieu-journey
kubectl get ingress -n hacmieu-journey

# 10. Access dashboard
minikube dashboard

# 11. Get API Gateway URL
minikube service api-gateway -n hacmieu-journey --url

# 12. View logs
kubectl logs -f deployment/api-gateway -n hacmieu-journey

# 13. Scale services
kubectl scale deployment api-gateway --replicas=5 -n hacmieu-journey

# 14. Port forwarding (for local testing)
kubectl port-forward svc/api-gateway 3000:80 -n hacmieu-journey
kubectl port-forward svc/pulsar-broker 6650:6650 -n hacmieu-journey
```

---

### **Monitoring Commands:**

```bash
# Prometheus
kubectl port-forward svc/prometheus 9090:9090 -n hacmieu-journey

# Grafana
kubectl port-forward svc/grafana 3001:3000 -n hacmieu-journey

# Jaeger
kubectl port-forward svc/jaeger 16686:16686 -n hacmieu-journey

# Pulsar Manager UI
kubectl port-forward svc/pulsar-manager 7750:7750 -n hacmieu-journey
```

---

## Monitoring & Observability

1. **Logging:** ELK Stack (Elasticsearch, Logstash, Kibana)
2. **Tracing:** Jaeger / Zipkin (distributed tracing)
3. **Metrics:** Prometheus + Grafana
4. **Health Checks:** /health endpoint cho mỗi service
5. **API Documentation:** Swagger/OpenAPI cho Gateway

---

## Security

1. **API Gateway:**

   - JWT authentication
   - Rate limiting (防止 DDoS)
   - CORS configuration
   - API key validation

2. **Service-to-Service:**

   - Mutual TLS (mTLS) cho gRPC
   - Service mesh (Istio) optional

3. **Data:**
   - Encryption at rest (database)
   - Encryption in transit (TLS/SSL)
   - Sensitive data masking (password, card number)

---

## Kết luận

**HacMieu Journey** sử dụng kiến trúc microservice hiện đại với:

- ✅ **10 microservices** độc lập (NestJS + gRPC)
- ✅ **Database per service** (PostgreSQL + MongoDB)
- ✅ **API Gateway** (REST) cho client, **gRPC** cho inter-service communication
- ✅ **Apache Pulsar** cho event-driven messaging (thay thế Kafka/RabbitMQ)
- ✅ **Minikube (Kubernetes)** cho local development & deployment
- ✅ **Auto-scaling** với HPA (Horizontal Pod Autoscaler)
- ✅ **Service Discovery** & Load Balancing (K8s native)
- ✅ **Monitoring Stack** (Prometheus + Grafana + Jaeger + ELK)

---

### **Tech Stack Summary:**

| Component               | Technology           | Purpose                  |
| ----------------------- | -------------------- | ------------------------ |
| **Framework**           | NestJS               | Microservices framework  |
| **API Gateway**         | NestJS + Express     | REST API endpoint        |
| **Sync Communication**  | gRPC + Protobuf      | Fast inter-service calls |
| **Async Communication** | Apache Pulsar        | Event-driven messaging   |
| **Orchestration**       | Minikube (K8s)       | Container orchestration  |
| **Databases**           | PostgreSQL + MongoDB | Data persistence         |
| **Caching**             | Redis                | Session & data caching   |
| **Monitoring**          | Prometheus + Grafana | Metrics & visualization  |
| **Tracing**             | Jaeger               | Distributed tracing      |
| **Logging**             | ELK Stack            | Centralized logging      |
| **Ingress**             | NGINX                | Reverse proxy & routing  |

---

### **Kiến trúc này đảm bảo:**

✅ **Scalability:**

- Scale từng service riêng biệt với HPA
- Pulsar auto-scaling topics based on load
- Database replication & sharding ready

✅ **Resilience:**

- 1 service down không ảnh hưởng toàn bộ hệ thống
- Pulsar message persistence & retry mechanism
- K8s auto-restart failed pods
- Circuit breaker pattern với gRPC

✅ **High Availability:**

- Multiple replicas cho mỗi service
- Pulsar cluster (multi-broker, multi-bookie)
- Database replicas (PostgreSQL streaming replication, MongoDB replica set)
- Redis sentinel for failover

✅ **Performance:**

- gRPC binary protocol (nhanh hơn REST 5-10x)
- Pulsar zero-copy architecture
- Redis caching layer
- K8s resource limits & requests optimization

✅ **Maintainability:**

- Code base nhỏ, mỗi service tập trung 1 nghiệp vụ
- Clear separation of concerns
- Easy to onboard new developers
- Comprehensive monitoring & logging

✅ **Developer Experience:**

- Minikube cho local development (không cần cloud)
- Hot reload với Skaffold/Tilt
- Pulsar Functions cho serverless processing
- K8s dashboard cho visualization

✅ **Technology Diversity:**

- Chọn tech stack phù hợp cho từng service
- PostgreSQL cho ACID transactions
- MongoDB cho flexible schema
- Pulsar cho unified messaging (queue + pub/sub)

---

### **Next Steps để triển khai:**

1. ✅ Setup Minikube cluster local
2. ✅ Tạo Docker images cho từng service
3. ✅ Deploy Apache Pulsar cluster
4. ✅ Deploy databases (PostgreSQL, MongoDB, Redis)
5. ✅ Deploy microservices với K8s manifests
6. ✅ Configure Ingress & DNS
7. ✅ Setup monitoring stack
8. ✅ Load testing & optimization
9. ✅ CI/CD pipeline với GitHub Actions
10. ✅ Production deployment planning (chuyển sang cloud K8s cluster khi cần)

---

### **Ưu điểm của stack này:**

🚀 **Apache Pulsar vs Kafka:**

- Multi-tenancy built-in
- Geo-replication native
- Tiered storage (auto offload to S3)
- Better for microservices (Pulsar Functions)
- Easier operations

🚀 **Minikube vs Cloud K8s:**

- Zero cost development
- Full K8s features locally
- Easy to migrate to production K8s (EKS, GKE, AKS)
- Fast iteration cycle

🚀 **gRPC vs REST:**

- 5-10x faster
- Type-safe contracts
- Bi-directional streaming
- Better for microservices internal communication

---

**Kết luận:** Đây là kiến trúc production-ready, scalable, và maintainable cho HacMieu Journey! 🎉
