# 🚗 Journey Vehicle Server

## 📋 Tổng quan

**Journey Vehicle Server** là hệ thống backend microservices cho nền tảng cho thuê xe và thiết bị du lịch. Hệ thống được xây dựng với kiến trúc microservices hiện đại, sử dụng kết hợp Node.js (NestJS) và .NET (ASP.NET Core), với gRPC làm giao thức giao tiếp chính và NATS JetStream cho event-driven messaging.

### 🎯 Mục tiêu hệ thống

- **Quản lý cho thuê xe**: Hỗ trợ đặt xe, booking, check-in/check-out
- **Quản lý thiết bị**: Cho thuê thiết bị du lịch (camera, GPS, v.v.) và combo
- **Hệ thống thanh toán**: Xử lý thanh toán, cọc, hoàn tiền
- **Đánh giá & Phản hồi**: Review, rating, xử lý khiếu nại
- **Giao tiếp thời gian thực**: Chat, notifications, websocket

---

## 🏗️ Kiến trúc Hệ thống

### Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐        │
│  │   Web App   │  │  Mobile App │  │ Admin Dashboard   │        │
│  └──────┬──────┘  └──────┬──────┘  └────────┬─────────┘        │
└─────────┼─────────────────┼───────────────────┼─────────────────┘
          │                 │                   │
          ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                           │
│  ┌──────────────────┐              ┌──────────────────┐         │
│  │   API Gateway    │              │  Admin Gateway   │         │
│  │   Port: 3000     │              │   Port: 3100     │         │
│  └────────┬─────────┘              └────────┬─────────┘         │
└───────────┼──────────────────────────────────┼──────────────────┘
            │                                  │
            ▼                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Microservices Layer                           │
│                                                                  │
│  Node.js Services (NestJS)     │     .NET Services (C#)         │
│  ┌─────────────────────────┐   │   ┌─────────────────────────┐ │
│  │ Auth         (gRPC 5000)│   │   │ Blog        (gRPC 5005) │ │
│  │ User         (gRPC 5001)│   │   │ Device      (gRPC 5006) │ │
│  │ Notification (gRPC 5002)│   │   │ Rental      (gRPC 5007) │ │
│  │ Chat         (gRPC 5003)│   │   │ Review      (gRPC 5010) │ │
│  │ Vehicle      (gRPC 5004)│   │   │ Complaint   (gRPC 5011) │ │
│  │ Booking      (gRPC 5008)│   │   └─────────────────────────┘ │
│  │ Payment      (gRPC 5009)│   │                                │
│  └─────────────────────────┘   │                                │
└─────────────────────────────────────────────────────────────────┘
            │                                  │
            ▼                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐      │
│  │ PostgreSQL   │  │    Redis     │  │  NATS JetStream  │      │
│  │ (Per Service)│  │ (Cache/WS)   │  │   (Port 4222)    │      │
│  └──────────────┘  └──────────────┘  └──────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### Đặc điểm kiến trúc

- **Microservices Architecture**: Mỗi service độc lập, dễ scale và maintain
- **Polyglot Architecture**: Node.js cho business logic phức tạp, .NET cho performance cao
- **gRPC Communication**: Giao tiếp nội bộ giữa các services qua gRPC
- **Event-Driven**: Sử dụng NATS JetStream cho event sourcing và async messaging
- **Database per Service**: Mỗi service có database riêng (PostgreSQL)
- **API Gateway Pattern**: Centralized entry point cho clients
- **Clean Architecture**: Áp dụng trong từng service (.NET services)

---

## 🧩 Microservices Chi tiết

### Node.js Services (NestJS + TypeScript)

#### 1. **Auth Service** (Port 5000)
- **Chức năng**: 
  - Xác thực người dùng (JWT tokens)
  - Đăng ký, đăng nhập, đăng xuất
  - Quản lý session và refresh tokens
  - OAuth integration (Google, Facebook)
- **Tech Stack**: NestJS, Passport, JWT, Bcrypt
- **Database**: `journey-auth` (users, sessions, tokens)

#### 2. **User Service** (Port 5001)
- **Chức năng**:
  - Quản lý thông tin người dùng
  - Hồ sơ cá nhân (Profile, Avatar, Bio)
  - Giấy phép lái xe (Driver License verification)
  - Địa chỉ giao nhận
  - Tài khoản ngân hàng
  - Credit score
- **Database Models**:
  - `Profile` (fullName, email, phone, role, avatarUrl, creditScore, bio, birthDate, gender)
  - `DriverLicense` (licenseNumber, class, issueDate, expiryDate, images, verification status)
  - `Address` (city, ward, detail, latitude, longitude)
  - `BankAccount` (bankName, accountNumber, accountHolder)
- **Enums**: `Role` (USER, ADMIN, SUPER_ADMIN), `Gender`, `LicenseClass` (A1, A2, B1, B2, C, D, E, F)

#### 3. **Vehicle Service** (Port 5004)
- **Chức năng**:
  - Quản lý danh mục xe (cars, motorcycles)
  - Thông tin xe (brand, model, specs)
  - Giá thuê theo giờ/ngày
  - Vị trí xe (GPS coordinates)
  - Tình trạng xe (ACTIVE, INACTIVE, MAINTENANCE, RESERVED, RENTED)
  - Tìm kiếm xe theo location, price, rating
  - Features và availability management
- **Database Models**:
  - `Vehicle` (type, name, brandId, modelId, licensePlate, seats, fuelType, transmission, pricePerHour, pricePerDay, location, city, ward, latitude, longitude, status, totalTrips, averageRating)
  - `VehicleBrand` (name, logoUrl, country)
  - `VehicleModel` (name, brandId, year, description)
  - `VehicleFeature` (name, icon, description)
  - `VehicleAvailability` (startTime, endTime, isAvailable)
- **Enums**: `VehicleType` (CAR, MOTORCYCLE), `VehicleStatus`, `TransmissionType` (MANUAL, AUTOMATIC), `FuelType` (GASOLINE, DIESEL, ELECTRIC, HYBRID)

#### 4. **Booking Service** (Port 5008)
- **Chức năng**:
  - Tạo đơn đặt xe
  - Quản lý lifecycle đơn hàng (PENDING → DEPOSIT_PAID → FULLY_PAID → ONGOING → COMPLETED)
  - Check-in/Check-out
  - Gia hạn thuê (Extension)
  - Tính toán chi phí (rental, insurance, VAT, discount, deposit, collateral)
  - Xử lý penalties (damage, overtime)
  - Quản lý thời gian thuê
  - History tracking
- **Database Models**:
  - `Booking` (userId, vehicleId, status, startTime, endTime, duration, pickupAddress, pickupLat, pickupLng, fees, deposit, collateral, totalAmount, refundAmount, penalties, paymentStatus, notes, damageReported)
  - `CheckInOut` (bookingId, type, timestamp, location, vehicleCondition, fuelLevel, odometerReading, images, notes)
  - `BookingHistory` (bookingId, action, performedBy, timestamp, details)
  - `BookingExtension` (bookingId, requestedEndTime, approvedEndTime, additionalFee, status, reason)
- **Enums**: `BookingStatus`, `CheckType`, `PaymentStatus`, `HistoryAction`, `ExtensionStatus`
- **Business Logic**:
  - Tính phí thuê: `rentalFee = vehicleFeeHour × duration`
  - Phí bảo hiểm: 10% rental fee
  - VAT: 10% (rental + insurance)
  - Tiền cọc: 500,000 VND
  - Tiền thẻ chấp: 3,000,000 VND
  - Phí quá giờ: vehicleFeeHour × 1.5

#### 5. **Payment Service** (Port 5009)
- **Chức năng**:
  - Xử lý thanh toán (VNPay, Momo integration)
  - Tạo mã thanh toán (payment code)
  - Tracking trạng thái thanh toán
  - Refund management
  - Transaction history
- **Database Models**:
  - `Payment` (sequenceNumber, paymentCode, userId, type, bookingId, rentalId, amount, status)
  - `Refund` (paymentId, userId, refundCode, amount, reason, status, processedAt)
- **Enums**: `PaymentStatus` (PENDING, PAID, FAILED), `PaymentType` (DEVICE, VEHICLE), `RefundStatus`, `RefundReason`
- **Payment Code Format**: `YYYY-MM-DDxxxxxx` (18 characters)

#### 6. **Notification Service** (Port 5002)
- **Chức năng**:
  - Push notifications
  - In-app notifications
  - Email notifications (Resend integration)
  - Notification history
- **Database Models**:
  - `Notification` (userId, type, title, content, read, bookingId, vehicleId, paymentId)
- **Notification Types**: WELCOME, BOOKING_CREATED, BOOKING_CONFIRMED, BOOKING_CANCELLED, PAYMENT_SUCCESS, PAYMENT_FAILED, CHECK_IN_REMINDER, CHECK_OUT_REMINDER, REFUND_PROCESSED, REVIEW_REQUEST, PROMO_AVAILABLE, SYSTEM_ANNOUNCEMENT, COMPLAINT_UPDATE

#### 7. **Chat Service** (Port 5003)
- **Chức năng**:
  - Real-time chat giữa users
  - Chat history
  - WebSocket support
- **Database Models**:
  - `Chat` (fromUserId, toUserId, content, createdAt)
- **Real-time**: Socket.io với Redis adapter

### .NET Services (ASP.NET Core + C#)

#### 8. **Device Service** (Port 5006)
- **Framework**: .NET 9.0, EF Core, gRPC, NATS
- **Chức năng**:
  - Quản lý thiết bị du lịch (camera, GPS, phụ kiện)
  - Quản lý combo thiết bị
  - Categories
  - Inventory management
  - Review integration
- **Database Models** (EF Core):
  - `Device` (Id, Name, Brand, Description, Price, Information, Quantity, Status, Images, TotalReviewIds, CategoryId)
  - `Category` (Id, Name, LogoUrl)
  - `Combo` (Id, Name, Price, Description, Images, TotalReviewIds, Status)
  - `ComboDevice` (ComboId, DeviceId, Quantity)
- **NATS Integration**:
  - Consumer: Lắng nghe `review.created` event
  - Action: Update device rating khi có review mới

#### 9. **Rental Service** (Port 5007)
- **Framework**: .NET 9.0, EF Core, gRPC, NATS, AutoMapper
- **Chức năng**:
  - Cho thuê thiết bị và combo
  - Multi-item rental (thuê nhiều items trong 1 đơn)
  - Deposit-based payment (chỉ thanh toán deposit 20%, không cần thanh toán full)
  - Rental lifecycle management
  - Extension management
  - Refund calculation (100% nếu hủy trước 7 ngày, 50% nếu 3-7 ngày, 0% nếu < 3 ngày)
  - History tracking với status changes
- **Database Models** (EF Core):
  - `Rental` (Id, UserId, Items (JSON array), RentalFee, Deposit, DiscountPercent, MaxDiscount, TotalPrice, TotalQuantity, Status, StartDate, EndDate, ActualEndDate, ReviewId, RentalExtensionId)
  - `RentalExtension` (Id, NewEndDate, AdditionalFee, Reason, Status)
  - `RentalHistory` (Id, RentalId, Status, ChangedAt, ChangedBy, Notes)
- **Item Structure** (JSON):
  ```json
  {
    "targetId": "guid",
    "isCombo": boolean,
    "quantity": number
  }
  ```
- **Enums**: `RentalStatus` (PENDING, APPROVED, ONGOING, COMPLETED, CANCELLED, EXPIRED, OVERDUE), `ExtensionStatus`
- **NATS Events Published**:
  - `rental.created`: Khi tạo đơn thuê mới
  - `rental.updated`: Khi cập nhật thông tin
  - `rental.completed`: Khi hoàn thành đơn thuê
  - `rental.cancelled`: Khi hủy đơn (bao gồm refund info)
- **NATS Stream**: `RENTAL` (retention 30 days)
- **Business Logic**:
  - Deposit calculation: 20% of total item prices
  - Refund calculation: Dựa vào thời gian hủy trước startDate
  - Status transitions: PENDING → APPROVED → ONGOING → COMPLETED

#### 10. **Review Service** (Port 5010)
- **Framework**: .NET 9.0, EF Core, gRPC, NATS
- **Chức năng**:
  - Đánh giá xe/thiết bị/combo
  - Rating 1-5 sao
  - Upload ảnh review
  - Update limit (tối đa 2 lần)
  - Integration với Vehicle/Device services
- **Database Models** (EF Core):
  - `Review` (Id, BookingId, RentalId, VehicleId, DeviceId, ComboId, UserId, Rating, Title, Type, Content, Images, UpdateCount)
- **Enums**: `ReviewType` (Device, Vehicle, Combo)
- **NATS Events Published**:
  - `review.created`: Khi tạo review mới (bao gồm rating, deviceId/vehicleId/comboId)
- **NATS Stream**: `REVIEW`
- **Constraints**:
  - Rating: 1-5
  - Title: max 200 chars
  - Content: max 2000 chars
  - UpdateCount: max 2 lần

#### 11. **Complaint Service** (Port 5011)
- **Framework**: .NET 9.0, EF Core, gRPC, NATS, AutoMapper
- **Chức năng**:
  - Xử lý khiếu nại từ khách hàng
  - Liên kết với Rental hoặc Booking
  - Admin response
  - Evidence management (upload ảnh)
  - Status tracking
- **Database Models** (EF Core):
  - `ComplaintEntity` (Id, UserId, RentalId, BookingId, DeviceId, VehicleId, ComboId, Type, Title, Content, EvidenceImages, Status, AdminResponse, CreatedAt, UpdatedAt, ResolvedAt)
- **Enums**: 
  - `ComplaintStatus` (Pending, Processing, Resolved, Rejected)
  - `ComplaintType` (Device, Vehicle, Combo, Service, Other)
- **NATS Events Published**:
  - `complaint.created`: Khi tạo khiếu nại mới
  - `complaint.updated`: Khi cập nhật status
  - `complaint.resolved`: Khi resolve/reject
  - `complaint.deleted`: Khi xóa khiếu nại
- **NATS Stream**: `COMPLAINT` (retention 90 days)
- **Proto Integration**: Client cho Rental, Booking, Device, User services

#### 12. **Blog Service** (Port 5005)
- **Framework**: .NET, EF Core, gRPC
- **Chức năng**:
  - Quản lý blog posts
  - Content management
  - SEO optimization
- **Database**: `journey-blog`

---

## 🔧 Tech Stack

### Backend Technologies

#### Node.js Stack
- **Framework**: NestJS 11.0
- **Language**: TypeScript 5.9
- **ORM**: Prisma 6.17
- **API**: REST + gRPC (@grpc/grpc-js)
- **Authentication**: Passport, JWT
- **WebSocket**: Socket.io 4.8 + Redis adapter
- **Build Tool**: Nx 21.6 (monorepo)

#### .NET Stack
- **Framework**: ASP.NET Core 9.0
- **Language**: C# 12
- **ORM**: Entity Framework Core 9.0
- **Database Driver**: Npgsql.EntityFrameworkCore.PostgreSQL 9.0
- **gRPC**: Grpc.AspNetCore 2.70, Google.Protobuf 3.29
- **Messaging**: NATS.Client 2.4 (Core + JetStream)
- **Mapping**: AutoMapper 12.0
- **Config**: DotNetEnv 3.1

### Infrastructure

#### Databases
- **PostgreSQL**: Main database cho tất cả services
  - Database per service pattern
  - Connection pooling
  - SSL/TLS encryption
- **Redis**: 
  - Session storage
  - Cache layer
  - WebSocket adapter (Socket.io)
  - Pub/Sub

#### Message Broker
- **NATS JetStream**:
  - Event streaming
  - Async messaging
  - At-least-once delivery
  - Stream persistence
  - Consumer groups

#### Communication Protocols
- **gRPC**: Internal service-to-service communication
  - Proto3 syntax
  - Strongly-typed contracts
  - Bi-directional streaming support
- **HTTP/REST**: Client-facing API (via Gateway)
- **WebSocket**: Real-time features (Chat, Notifications)

#### Development Tools
- **Nx**: Monorepo management và build orchestration
- **Docker Compose**: Local development environment
- **Prisma Studio**: Database GUI
- **ESLint + Prettier**: Code quality và formatting
- **Jest**: Unit testing

---

## 📊 Database Schema

### Database Separation Strategy

Mỗi service có database riêng để đảm bảo:
- **Loose Coupling**: Services không phụ thuộc trực tiếp vào database của nhau
- **Independent Scaling**: Scale database theo nhu cầu của từng service
- **Technology Freedom**: Có thể dùng database khác nhau nếu cần
- **Fault Isolation**: Lỗi database ở 1 service không ảnh hưởng toàn bộ hệ thống

---

## 🔄 NATS JetStream Event Architecture

### NATS Streams Configuration

| Stream | Subjects | Retention | Max Age | Services |
|--------|----------|-----------|---------|----------|
| **RENTAL** | rental.created<br/>rental.updated<br/>rental.completed<br/>rental.cancelled | Workqueue | 30 days | Rental (Publisher) |
| **REVIEW** | review.created | Workqueue | 30 days | Review (Publisher)<br/>Device (Consumer)<br/>Vehicle (Consumer) |
| **COMPLAINT** | complaint.created<br/>complaint.updated<br/>complaint.resolved<br/>complaint.deleted | Workqueue | 90 days | Complaint (Publisher) |

### Event Flow Examples

#### 1. Rental Created Event Flow
```
User creates rental
        ↓
Rental Service → rental.created event
        ↓
NATS JetStream (RENTAL stream)
        ↓
[Potential Consumers]
        ├→ Notification Service (send confirmation)
        ├→ Payment Service (create payment record)
        └→ Device Service (update inventory)
```

**Event Payload** (`rental.created`):
```json
{
  "rentalId": "uuid",
  "userId": "uuid",
  "items": [
    { "targetId": "device-uuid", "isCombo": false, "quantity": 2 },
    { "targetId": "combo-uuid", "isCombo": true, "quantity": 1 }
  ],
  "deposit": 500000,
  "totalPrice": 2500000,
  "startDate": "2024-01-15T10:00:00Z",
  "endDate": "2024-01-20T10:00:00Z",
  "status": "PENDING"
}
```

#### 2. Review Created Event Flow
```
User submits review
        ↓
Review Service → review.created event
        ↓
NATS JetStream (REVIEW stream)
        ↓
Consumers:
        ├→ Device Service (update device rating)
        ├→ Vehicle Service (update vehicle rating)
        └→ Notification Service (notify reviewed user)
```

**Event Payload** (`review.created`):
```json
{
  "reviewId": "uuid",
  "userId": "uuid",
  "deviceId": "uuid", // hoặc vehicleId hoặc comboId
  "rating": 5,
  "type": "Device", // Device | Vehicle | Combo
  "title": "Excellent camera!",
  "content": "The camera quality is amazing...",
  "createdAt": "2024-01-20T15:30:00Z"
}
```

**Device Consumer Logic**:
```csharp
// Device Service lắng nghe review.created
private async Task HandleReviewCreatedAsync(ReviewCreatedEvent reviewEvent)
{
    if (!string.IsNullOrEmpty(reviewEvent.DeviceId)) {
        var device = await _deviceRepository.GetByIdAsync(reviewEvent.DeviceId);
        
        // Add review ID to device's review list
        device.TotalReviewIds.Add(reviewEvent.ReviewId);
        
        // Recalculate average rating (call Review Service)
        var newRating = await CalculateAverageRating(device.TotalReviewIds);
        device.AverageRating = newRating;
        
        await _deviceRepository.UpdateAsync(device);
    }
}
```

#### 3. Complaint Resolution Event Flow
```
Admin resolves complaint
        ↓
Complaint Service → complaint.resolved event
        ↓
NATS JetStream (COMPLAINT stream)
        ↓
Consumers:
        ├→ Notification Service (notify user về resolution)
        ├→ User Service (có thể update credit score nếu cần)
        └→ Analytics Service (track complaint metrics)
```

**Event Payload** (`complaint.resolved`):
```json
{
  "complaintId": "uuid",
  "userId": "uuid",
  "rentalId": "uuid",
  "status": "Resolved", // hoặc "Rejected"
  "adminResponse": "We have refunded 100% of your deposit...",
  "resolvedAt": "2024-01-21T09:00:00Z"
}
```

#### 4. Rental Cancellation with Refund
```
User cancels rental
        ↓
Rental Service
        ├→ Calculate refund (100%/50%/0%)
        └→ rental.cancelled event
                ↓
        NATS JetStream (RENTAL stream)
                ↓
        Consumers:
                ├→ Payment Service (process refund)
                ├→ Device Service (release inventory)
                └→ Notification Service (send cancellation email)
```

**Event Payload** (`rental.cancelled`):
```json
{
  "rentalId": "uuid",
  "userId": "uuid",
  "cancelledAt": "2024-01-10T14:00:00Z",
  "refundAmount": 500000,
  "refundPercent": 100, // 100% refund nếu cancel >7 ngày trước
  "reason": "User requested cancellation"
}
```

### Event Sourcing Benefits

1. **Loose Coupling**: Services không phụ thuộc trực tiếp vào nhau
2. **Async Processing**: Xử lý background tasks không block main flow
3. **Audit Trail**: Track mọi thay đổi trong hệ thống
4. **Scalability**: Dễ dàng thêm consumers mới khi cần
5. **Resilience**: Messages được persist, không bị mất khi service down
6. **Event Replay**: Có thể replay events để rebuild state

---

## 🔌 gRPC Services & Proto Contracts

---

## 🚀 Port Assignments

### Services Ports
| Service | gRPC Port | HTTP Port (if any) |
|---------|-----------|-------------------|
| Auth | 5000 | - |
| User | 5001 | - |
| Notification | 5002 | - |
| Chat | 5003 | - |
| Vehicle | 5004 | - |
| Blog | 5005 | - |
| Device | 5006 | - |
| Rental | 5007 | - |
| Booking | 5008 | - |
| Payment | 5009 | - |
| Review | 5010 | - |
| Complaint | 5011 | - |
| **API Gateway** | - | 3000 |
| **Admin Gateway** | - | 3100 |

### Infrastructure Ports
| Component | Port | Purpose |
|-----------|------|---------|
| **NATS** | 4222 | Client connections |
| **NATS Monitoring** | 8222 | HTTP monitoring interface |
| **PostgreSQL** | 5432 | Database connections |
| **Redis** | 6379 | Cache & WebSocket |

---

## 🔐 Security Features

### Authentication & Authorization
- **JWT Tokens**: Access & Refresh tokens
- **Role-based Access Control** (RBAC): USER, ADMIN, SUPER_ADMIN
- **Passport Strategies**: Local, JWT, OAuth (Google, Facebook)
- **Session Management**: Redis-based session store

### Data Security
- **Password Hashing**: Bcrypt với salt rounds
- **Database Encryption**: PostgreSQL SSL/TLS
- **Sensitive Data Masking**: Passwords, payment info trong logs
- **Input Validation**: Zod schemas (Node.js), Data Annotations (.NET)

### API Security
- **CORS**: Configured origins
- **Rate Limiting**: Prevent abuse
- **gRPC Interceptors**: Authentication, logging, error handling
- **API Gateway**: Centralized security layer


---

## 📈 Monitoring & Observability

### Logging
- **Structured Logging**: JSON format
- **Log Levels**: ERROR, WARN, INFO, DEBUG
- **Log Aggregation**: Centralized logging (future: ELK stack)
- **Request Tracing**: Correlation IDs

### NATS Monitoring
- **Monitoring UI**: http://localhost:8222
- **Stream Health**: Track message counts, consumers
- **Performance Metrics**: Publish/Subscribe rates

### Performance Metrics
- **Database Queries**: Indexed fields, query optimization
- **gRPC Call Duration**: Interceptor-based timing
- **Cache Hit Rates**: Redis monitoring
- **Error Rates**: Track error frequency per service

---

## 🔄 Data Flow Examples

### Complete Booking Flow
```
1. User searches vehicles
   ├→ API Gateway → Vehicle Service (gRPC)
   └→ Returns available vehicles with filters

2. User creates booking
   ├→ API Gateway → Booking Service (gRPC)
   ├→ Booking Service → Vehicle Service (check availability)
   ├→ Booking Service → User Service (verify driver license)
   └→ Booking Service creates booking (status: PENDING)

3. User pays deposit
   ├→ API Gateway → Payment Service (gRPC)
   ├→ Payment Service → External payment gateway (VNPay/Momo)
   ├→ Payment callback → Payment Service updates status
   └→ Payment Service → Booking Service (update booking to DEPOSIT_PAID)

4. Check-in time arrives
   ├→ Notification Service → sends reminder
   └→ User arrives, admin checks in
       ├→ Booking Service → create CheckInOut record
       └→ Booking Service → update status to ONGOING

5. Check-out
   ├→ Admin inspects vehicle (damage check, fuel, odometer)
   ├→ Booking Service → calculate final amount (with penalties if any)
   ├→ Booking Service → update status to COMPLETED
   └→ Notification Service → request review
```

### Complete Rental Flow
```
1. User browses devices/combos
   └→ API Gateway → Device Service (gRPC)

2. User creates rental (multi-item)
   ├→ API Gateway → Rental Service (gRPC)
   ├→ Rental Service validates items availability
   ├→ Rental Service calculates deposit (20% of total)
   ├→ Rental Service creates rental (status: PENDING)
   └→ NATS: publish rental.created event

3. User pays deposit
   ├→ Payment Service processes payment
   ├→ Payment Service → Rental Service (confirm payment)
   ├→ Rental Service updates status to APPROVED
   └→ NATS: publish rental.updated event

4. Admin ships items
   ├→ Rental Service updates status to ONGOING
   └→ NATS: publish rental.updated event

5. User returns items
   ├→ Admin inspects items (damage check)
   ├→ Rental Service updates status to COMPLETED
   ├→ Rental Service creates RentalHistory record
   ├→ NATS: publish rental.completed event
   └→ Review Service → prompt user for review

6. User submits review
   ├→ Review Service creates review
   ├→ NATS: publish review.created event
   └→ Device Service updates rating (consumer)
```

### Complaint Resolution Flow
```
1. User encounters issue during rental/booking
   └→ User navigates to complaints section

2. User creates complaint
   ├→ API Gateway → Complaint Service (gRPC)
   ├→ Complaint Service fetches rental/booking data
   ├→ Complaint Service creates complaint (status: PENDING)
   ├→ Complaint Service uploads evidence images (S3)
   └→ NATS: publish complaint.created event
       └→ Notification Service → notify admin

3. Admin reviews complaint
   ├→ Admin Gateway → Complaint Service
   ├→ Admin updates status to PROCESSING
   └→ NATS: publish complaint.updated event

4. Admin resolves complaint
   ├→ Admin adds response and decision
   ├→ Complaint Service updates status to RESOLVED
   ├→ NATS: publish complaint.resolved event
   └→ Notification Service → notify user
       ├→ If refund needed → Payment Service processes
       └→ User Service may update credit score
```

---

## 🧪 Testing Strategy

### Manual & API Testing
- **Postman**: Used for manual and collection-based API testing (authentication, CRUD, and error handling).


---

## 🏆 System Achievements

### Scalability
- **Horizontal Scaling**: Mỗi service có thể scale độc lập
- **Load Balancing**: gRPC built-in load balancing
- **Database Sharding**: Ready for future implementation

### Performance
- **gRPC**: 10-15x faster than REST trong internal communication
- **Caching**: Redis caching cho frequent queries
- **Connection Pooling**: Database connection pools
- **Event-Driven**: Async processing không block main flow

### Reliability
- **Circuit Breaker**: Graceful degradation khi service down
- **Retry Mechanism**: Automatic retry với exponential backoff
- **Message Persistence**: NATS JetStream đảm bảo message không mất
- **Database Transactions**: ACID compliance

### Maintainability
- **Clean Architecture**: Separation of concerns trong .NET services
- **Monorepo**: Nx workspace quản lý tất cả services
- **Type Safety**: TypeScript (Node.js) + C# (.NET)
- **Code Generation**: Proto → gRPC clients/servers tự động

---

## 📚 Documentation & Resources

### Internal Documentation
- `ARCHITECTURE_DIAGRAM.md` - System architecture visualization
- `NATS_INTEGRATION_SUMMARY.md` - NATS event flows
- Proto files - Service contracts and data models

### External Documentation
- [NestJS Documentation](https://docs.nestjs.com/)
- [gRPC Documentation](https://grpc.io/docs/)
- [NATS JetStream](https://docs.nats.io/nats-concepts/jetstream)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Entity Framework Core](https://docs.microsoft.com/ef/core/)

---

## 👥 Team & Contributors

**Project**: Journey Vehicle Server  
**Organization**: DATT-ITS  
**Type**: Microservices Platform for Vehicle & Device Rental

---

## 📄 License

MIT License

---

## 🔮 Future Enhancements

### Planned Features
- [ ] **GraphQL Gateway**: Alternative to REST API
- [ ] **Machine Learning**: Price optimization, demand forecasting
- [ ] **Mobile Apps**: React Native for iOS/Android
- [ ] **Admin Dashboard**: React-based admin panel
- [ ] **Analytics Service**: Business intelligence & reporting
- [ ] **Recommendation Engine**: Personalized vehicle/device suggestions
- [ ] **Multi-language Support**: i18n for international expansion
- [ ] **Advanced Search**: Elasticsearch integration
- [ ] **Live Tracking**: Real-time vehicle location tracking
- [ ] **Insurance Integration**: Third-party insurance APIs

### Infrastructure Improvements
- [ ] **Kubernetes**: Container orchestration
- [ ] **Service Mesh**: Istio for advanced traffic management
- [ ] **Distributed Tracing**: OpenTelemetry integration
- [ ] **ELK Stack**: Elasticsearch, Logstash, Kibana for logging
- [ ] **Prometheus + Grafana**: Metrics and monitoring
- [ ] **CI/CD Pipeline**: GitHub Actions / GitLab CI
- [ ] **Blue-Green Deployment**: Zero-downtime deployments

---

**Last Updated**: November 2025  
**Version**: 1.0.0

---

