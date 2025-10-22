# 🚗 HacMieu Journey - Microservices Architecture

## 📋 Tổng quan dự án

**HacMieu Journey** là nền tảng cho thuê phương tiện (ô tô và xe máy) với các tính năng:

- Đăng ký/Đăng nhập với OTP
- Tìm kiếm và lọc xe (ô tô, xe máy)
- Đặt xe và thanh toán
- Quản lý hồ sơ, lịch sử thuê
- Đánh giá xe
- Hệ thống chat real-time
- Khiếu nại
- Thông báo real-time

---

## 🏗️ KIẾN TRÚC MICROSERVICES

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  Web App (React/Vue)  │  Mobile App (React Native/Flutter)      │
└──────────────┬──────────────────────────────────────────────────┘
               │
               │ HTTP/WebSocket/GraphQL
               ▼
┌──────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (GraphQL)                          │
│  - Route requests                                                 │
│  - Authentication middleware                                      │
│  - Rate limiting                                                  │
│  - Load balancing                                                 │
└──────────────┬───────────────────────────────────────────────────┘
               │
               │ gRPC (Synchronous) ←→ Services
               │
    ┌──────────┼──────────┬──────────┬──────────┬──────────┐
    │          │          │          │          │          │
    ▼          ▼          ▼          ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Auth   │ │ User   │ │Vehicle │ │Booking │ │Payment │ │Review  │
│Service │ │Service │ │Service │ │Service │ │Service │ │Service │
└───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘
    │          │          │          │          │          │
    └──────────┴──────────┴──────────┴──────────┴──────────┘
                          │
                          │ Pulsar (Asynchronous Events)
                          │
    ┌─────────────────────┴──────────────────────────────────┐
    │                                                         │
    ▼                 ▼                 ▼                    ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Email   │    │Notification│   │ Analytics│    │  Chat    │
│ Service  │    │  Service   │   │  Service │    │ Service  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                      │
                      │ WebSocket
                      ▼
                 ┌──────────┐
                 │ Clients  │
                 └──────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                           │
├──────────────────────────────────────────────────────────────────┤
│  PostgreSQL  │  Redis  │  Pulsar  │  S3/MinIO  │  Elasticsearch  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🎯 CHI TIẾT CÁC MICROSERVICES

### **1. AUTH SERVICE** 🔐

**Nhiệm vụ**: Quản lý xác thực và phân quyền

**APIs (gRPC)**:

- `ValidateToken(token)` → UserInfo
- `Register(email, password, phone, name)` → User
- `Login(email/phone, password)` → Token + RefreshToken
- `SendOTP(email, type)` → Success
- `VerifyOTP(email, otp, type)` → Success
- `RefreshToken(refreshToken)` → NewToken
- `ChangePassword(userId, oldPassword, newPassword)` → Success

**Events Published (Pulsar)**:

- `user.registered` → Email Service gửi welcome email
- `otp.sent` → Email Service gửi OTP
- `password.changed` → Notification Service thông báo

**Database**: PostgreSQL

- Users table
- OTP verification codes
- Refresh tokens

**Tại sao dùng gRPC?**
✅ API Gateway cần verify token **NGAY LẬP TỨC** trước khi cho request đi tiếp
✅ Các service khác cần validate user permission **ĐỒNG BỘ**

---

### **2. USER SERVICE** 👤

**Nhiệm vụ**: Quản lý thông tin người dùng, hồ sơ, địa chỉ

**APIs (gRPC)**:

- `GetUserProfile(userId)` → Profile
- `UpdateProfile(userId, data)` → Profile
- `UploadAvatar(userId, image)` → ImageURL
- `VerifyDriverLicense(userId, licenseData, images)` → Success
- `GetAddresses(userId)` → Address[]
- `AddAddress(userId, address)` → Address
- `UpdateAddress(addressId, data)` → Address
- `DeleteAddress(addressId)` → Success
- `UpdateBankAccount(userId, bankData)` → BankAccount
- `GetCreditScore(userId)` → Score

**Events Published (Pulsar)**:

- `user.profile.updated` → Analytics Service
- `driver.license.verified` → Notification Service
- `address.added` → Analytics Service

**Database**: PostgreSQL

- User profiles
- Addresses
- Bank accounts
- Driver licenses

**Tại sao dùng gRPC?**
✅ Booking Service cần lấy thông tin user **NGAY** để validate booking
✅ Payment Service cần bank info **ĐỒNG BỘ** để xử lý refund

---

### **3. VEHICLE SERVICE** 🚗🏍️

**Nhiệm vụ**: Quản lý xe (ô tô, xe máy), tìm kiếm, lọc

**APIs (gRPC)**:

- `SearchVehicles(filters, pagination)` → Vehicle[]
- `GetVehicleDetail(vehicleId)` → VehicleDetail
- `CheckAvailability(vehicleId, startTime, endTime)` → Boolean
- `ReserveVehicle(vehicleId, bookingId)` → Success
- `ReleaseVehicle(vehicleId, bookingId)` → Success
- `GetVehiclesByLocation(lat, lng, radius)` → Vehicle[]

**Filters**: Giá, số chỗ, hãng xe, loại xe (số sàn/tự động), khu vực, nhiên liệu...

**Events Published (Pulsar)**:

- `vehicle.reserved` → Analytics Service
- `vehicle.released` → Analytics Service

**Events Consumed (Pulsar)**:

- `booking.confirmed` → Reserve vehicle
- `booking.cancelled` → Release vehicle
- `booking.completed` → Release vehicle

**Database**: PostgreSQL + Elasticsearch

- Vehicles (cars, motorcycles)
- Vehicle features
- Availability calendar
- Vehicle images (S3/MinIO)

**Tại sao dùng gRPC?**
✅ Booking Service cần check availability **NGAY** trước khi tạo booking
✅ Search cần response **NHANH** để UX tốt

---

### **4. BOOKING SERVICE** 📅

**Nhiệm vụ**: Quản lý đặt xe, lịch sử thuê, check-in/out

**APIs (gRPC)**:

- `CreateBooking(userId, vehicleId, startTime, endTime, insurance)` → Booking
- `GetBookingDetail(bookingId)` → BookingDetail
- `GetUserBookings(userId, status)` → Booking[]
- `CancelBooking(bookingId, userId)` → Success
- `CheckIn(bookingId, images[])` → Success
- `CheckOut(bookingId, images[])` → Success
- `CalculateFees(vehicleId, duration, insurance, discountCode)` → Fees

**Events Published (Pulsar)**:

- `booking.created` → Payment Service tạo payment
- `booking.created` → Notification Service thông báo
- `booking.created` → Vehicle Service reserve xe
- `booking.cancelled` → Payment Service refund deposit
- `booking.cancelled` → Vehicle Service release xe
- `booking.confirmed` → Email Service gửi confirmation
- `booking.check_in` → Analytics Service
- `booking.check_out` → Analytics Service
- `booking.completed` → Notification Service (yêu cầu review)

**Events Consumed (Pulsar)**:

- `payment.deposit.success` → Confirm booking
- `payment.deposit.failed` → Cancel booking

**Database**: PostgreSQL

- Bookings
- Check-in/out images (S3)
- Booking history

**Tại sao dùng gRPC?**
✅ User cần biết **NGAY** booking có thành công không
✅ Calculate fees cần **ĐỒNG BỘ** trước khi show cho user

**Tại sao dùng Pulsar?**
✅ Sau khi booking → gửi email, notification **KHÔNG CẦN ĐỢI**
✅ Reserve vehicle có thể retry nếu fail
✅ 1 booking event → nhiều consumers xử lý (email, notification, analytics)

---

### **5. PAYMENT SERVICE** 💳

**Nhiệm vụ**: Xử lý thanh toán, hoàn tiền, cọc xe

**APIs (gRPC)**:

- `CreatePayment(bookingId, amount, type)` → Payment + QRCode
- `ConfirmPayment(paymentId, transactionId)` → Success
- `GetPaymentStatus(paymentId)` → Status
- `RefundDeposit(bookingId, userId)` → Success
- `GetUserPayments(userId, status)` → Payment[]

**Events Published (Pulsar)**:

- `payment.deposit.success` → Booking Service confirm booking
- `payment.deposit.failed` → Booking Service cancel booking
- `payment.completed` → Notification Service
- `payment.refunded` → Notification Service
- `payment.pending` (delayed 15min) → Self consume để auto cancel

**Events Consumed (Pulsar)**:

- `payment.pending` → Auto cancel nếu chưa thanh toán
- `booking.cancelled` → Refund deposit
- `booking.completed` → Transfer money to owner

**Database**: PostgreSQL

- Payments
- Transactions
- Deposits

**Tại sao dùng gRPC?**
✅ Booking Service cần tạo payment **NGAY** để show QR code
✅ Check payment status **ĐỒNG BỘ**

**Tại sao dùng Pulsar?**
✅ Auto cancel payment sau 15 phút (delayed message)
✅ Gửi notification sau khi payment success **ASYNC**
✅ Retry logic nếu refund fail

---

### **6. REVIEW SERVICE** ⭐

**Nhiệm vụ**: Quản lý đánh giá xe

**APIs (gRPC)**:

- `CreateReview(userId, vehicleId, bookingId, rating, comment)` → Review
- `GetVehicleReviews(vehicleId, pagination)` → Review[]
- `GetUserReviews(userId)` → Review[]
- `UpdateReview(reviewId, data)` → Review
- `DeleteReview(reviewId)` → Success

**Events Published (Pulsar)**:

- `review.created` → Notification Service (thông báo chủ xe)
- `review.created` → Analytics Service

**Database**: PostgreSQL

- Reviews

**Tại sao dùng gRPC?**
✅ Get reviews cần **NHANH** để hiển thị trong vehicle detail

---

### **7. DISCOUNT SERVICE** 🎫

**Nhiệm vụ**: Quản lý mã giảm giá

**APIs (gRPC)**:

- `GetAvailableDiscounts(userId)` → Discount[]
- `ValidateDiscountCode(code, userId, amount)` → DiscountValue
- `ApplyDiscount(code, bookingId)` → Success

**Events Published (Pulsar)**:

- `discount.applied` → Analytics Service

**Database**: PostgreSQL

- Discount codes
- Usage history

**Tại sao dùng gRPC?**
✅ Validate discount code **NGAY** khi user apply
✅ Calculate final price **ĐỒNG BỘ**

---

### **8. COMPLAINT SERVICE** 📢

**Nhiệm vụ**: Quản lý khiếu nại

**APIs (gRPC)**:

- `CreateComplaint(userId, bookingId, title, description, images)` → Complaint
- `GetComplaints(userId, status)` → Complaint[]
- `GetComplaintDetail(complaintId)` → ComplaintDetail
- `UpdateComplaint(complaintId, data)` → Complaint
- `CloseComplaint(complaintId)` → Success
- `SendMessage(complaintId, userId, message)` → Message
- `GetMessages(complaintId, pagination)` → Message[]

**Events Published (Pulsar)**:

- `complaint.created` → Notification Service (thông báo admin)
- `complaint.message.sent` → Notification Service (real-time)

**Database**: PostgreSQL

- Complaints
- Complaint messages
- Complaint images (S3)

**Tại sao dùng gRPC?**
✅ Get complaint detail **NGAY** khi user click
✅ Send message **ĐỒNG BỘ** để user thấy ngay

---

### **9. EMAIL SERVICE** 📧

**Nhiệm vụ**: Gửi email (OTP, welcome, confirmation, notification)

**Events Consumed (Pulsar)**:

- `user.registered` → Send welcome email
- `otp.sent` → Send OTP email
- `booking.confirmed` → Send booking confirmation
- `payment.completed` → Send payment receipt
- `booking.cancelled` → Send cancellation notice

**Tại sao dùng Pulsar?**
✅ Gửi email **KHÔNG CẦN ĐỢI** → async
✅ Retry nếu email service down
✅ Không block user experience

---

### **10. NOTIFICATION SERVICE** 🔔

**Nhiệm vụ**: Gửi thông báo real-time (WebSocket)

**APIs (gRPC)**:

- `GetManyNotifications(userId, pagination)` → Notification[]
- `MarkAsRead(notificationId)` → Success
- `MarkAllAsRead(userId)` → Success

**Events Consumed (Pulsar)**:

- `booking.created` → Push notification
- `payment.completed` → Push notification
- `review.created` → Push notification (chủ xe)
- `complaint.message.sent` → Push notification (real-time)
- `booking.check_in` → Push notification (admin)

**WebSocket**: Push notification real-time đến client

**Database**: PostgreSQL

- Notifications

**Tại sao dùng Pulsar?**
✅ 1 event → push notification đến nhiều users
✅ Async, không block business logic
✅ Fan-out pattern

---

### **11. CHAT SERVICE** 💬

**Nhiệm vụ**: Chat real-time giữa user và admin/owner

**APIs (gRPC)**:

- `GetChatRooms(userId)` → ChatRoom[]
- `GetMessages(roomId, pagination)` → Message[]
- `SendMessage(roomId, userId, message)` → Message

**WebSocket**: Real-time messaging

**Events Published (Pulsar)**:

- `chat.message.sent` → Notification Service (nếu offline)

**Database**: PostgreSQL + Redis

- Chat rooms
- Messages
- Online status (Redis)

**Tại sao dùng WebSocket + Pulsar?**
✅ WebSocket cho real-time nếu user online
✅ Pulsar để lưu message và gửi notification nếu offline

---

### **12. ANALYTICS SERVICE** 📊

**Nhiệm vụ**: Thu thập và phân tích dữ liệu

**Events Consumed (Pulsar)**:

- `booking.created`
- `booking.cancelled`
- `booking.completed`
- `review.created`
- `payment.completed`
- `vehicle.reserved`
- `user.registered`
- `discount.applied`

**Database**: PostgreSQL + Elasticsearch

- Analytics data
- Reports

**Tại sao dùng Pulsar?**
✅ Track events **ASYNC** không ảnh hưởng performance
✅ Có thể replay events để re-calculate analytics

---

### **13. MEDIA SERVICE** 🖼️

**Nhiệm vụ**: Upload, resize, optimize ảnh

**APIs (gRPC)**:

- `UploadImage(file, type)` → URL
- `DeleteImage(url)` → Success

**Events Published (Pulsar)**:

- `image.uploaded` → Self consume để resize

**Events Consumed (Pulsar)**:

- `image.uploaded` → Resize ảnh (thumbnail, medium, large)

**Storage**: S3 / MinIO

**Tại sao dùng Pulsar?**
✅ Resize ảnh **ASYNC** (heavy processing)
✅ User không cần đợi resize xong

---

## 🔄 LUỒNG NGHIỆP VỤ CHI TIẾT

### **Flow 1: Đăng ký User**

```
1. Client → API Gateway: POST /register
2. API Gateway → Auth Service (gRPC): Register()
3. Auth Service: Create user in DB
4. Auth Service → Pulsar: Publish "user.registered"
5. Email Service ← Pulsar: Consume "user.registered"
6. Email Service: Send welcome email (async)
7. Auth Service → API Gateway: Return user + token
8. API Gateway → Client: Response
```

**Dùng gRPC**: Register cần response ngay
**Dùng Pulsar**: Gửi email async

---

### **Flow 2: Gửi OTP**

```
1. Client → API Gateway: POST /send-otp
2. API Gateway → Auth Service (gRPC): SendOTP()
3. Auth Service: Create OTP in DB
4. Auth Service → Pulsar: Publish "otp.sent"
5. Email Service ← Pulsar: Consume "otp.sent"
6. Email Service: Send OTP email (async)
7. Auth Service → API Gateway: Success
8. API Gateway → Client: Response
```

---

### **Flow 3: Tìm kiếm xe**

```
1. Client → API Gateway: GET /vehicles?filters
2. API Gateway → Vehicle Service (gRPC): SearchVehicles()
3. Vehicle Service: Query Elasticsearch
4. Vehicle Service → API Gateway: Return vehicles
5. API Gateway → Client: Response
```

**Dùng gRPC**: Cần response nhanh, đồng bộ

---

### **Flow 4: Xem chi tiết xe**

```
1. Client → API Gateway: GET /vehicles/:id
2. API Gateway → Vehicle Service (gRPC): GetVehicleDetail()
3. API Gateway → Review Service (gRPC): GetVehicleReviews()
4. API Gateway: Merge data
5. API Gateway → Client: Response
```

**Dùng gRPC**: Cần data ngay để render UI

---

### **Flow 5: Tạo Booking (PHỨC TẠP)**

```
1. Client → API Gateway: POST /bookings
2. API Gateway → Auth Service (gRPC): ValidateToken()
3. API Gateway → Vehicle Service (gRPC): CheckAvailability()
4. API Gateway → Discount Service (gRPC): ValidateDiscountCode()
5. API Gateway → Booking Service (gRPC): CreateBooking()
6. Booking Service: Save booking to DB (status: PENDING_DEPOSIT)
7. Booking Service → Pulsar: Publish "booking.created"

   ┌─ Payment Service ← Consume "booking.created"
   │  → Create payment record
   │  → Generate QR code
   │  → Return to Booking Service (via callback/event)
   │
   ├─ Vehicle Service ← Consume "booking.created"
   │  → Reserve vehicle temporarily
   │
   ├─ Notification Service ← Consume "booking.created"
   │  → Push notification to user (WebSocket)
   │
   └─ Analytics Service ← Consume "booking.created"
      → Track booking event

8. Booking Service → API Gateway: Return booking + payment info
9. API Gateway → Client: Response (with QR code)
```

**Dùng gRPC**: Validate token, check availability, create booking cần ĐỒNG BỘ
**Dùng Pulsar**: Tạo payment, reserve vehicle, gửi notification ASYNC

---

### **Flow 6: Thanh toán Deposit**

```
1. User scan QR and pay
2. Payment Gateway (VNPay/MoMo) → Webhook → Payment Service
3. Payment Service: Update payment status = COMPLETED
4. Payment Service → Pulsar: Publish "payment.deposit.success"
5. Booking Service ← Consume "payment.deposit.success"
6. Booking Service: Update booking status = CONFIRMED
7. Booking Service → Pulsar: Publish "booking.confirmed"

   ┌─ Email Service ← Consume "booking.confirmed"
   │  → Send confirmation email
   │
   ├─ Notification Service ← Consume "booking.confirmed"
   │  → Push notification "Đặt xe thành công"
   │
   └─ Vehicle Service ← Consume "booking.confirmed"
      → Confirm vehicle reservation
```

**Dùng Pulsar**:

- 1 event → multiple consumers
- Gửi email, notification ASYNC
- Retry nếu fail

---

### **Flow 7: Auto Cancel Payment (Delayed)**

```
1. Booking Service → Pulsar: Publish "payment.pending" (deliverAfter: 15min)
2. ... 15 minutes later ...
3. Payment Service ← Consume "payment.pending"
4. Payment Service: Check if payment completed
5. If NOT completed:
   - Update payment status = CANCELLED
   - Pulsar: Publish "payment.cancelled"
6. Booking Service ← Consume "payment.cancelled"
7. Booking Service: Cancel booking
8. Vehicle Service ← Consume "booking.cancelled"
9. Vehicle Service: Release vehicle
```

**Dùng Pulsar**: Delayed message (Pulsar hỗ trợ deliverAfter)

---

### **Flow 8: Check-in xe**

```
1. Client → API Gateway: POST /bookings/:id/check-in (with images)
2. API Gateway → Media Service (gRPC): UploadImages()
3. Media Service: Upload to S3
4. Media Service → Pulsar: Publish "image.uploaded" (for resize)
5. Media Service → API Gateway: Return URLs
6. API Gateway → Booking Service (gRPC): CheckIn()
7. Booking Service: Update status = IN_PROGRESS
8. Booking Service → Pulsar: Publish "booking.check_in"
9. Notification Service ← Consume: Push notification
10. API Gateway → Client: Success
```

**Dùng gRPC**: Upload ảnh và check-in cần ĐỒNG BỘ
**Dùng Pulsar**: Resize ảnh ASYNC

---

### **Flow 9: Check-out và Đánh giá**

```
1. Client → API Gateway: POST /bookings/:id/check-out (with images)
2. (Similar to check-in flow)
3. Booking Service: Update status = COMPLETED
4. Booking Service → Pulsar: Publish "booking.completed"

   ┌─ Payment Service ← Consume "booking.completed"
   │  → Transfer money to vehicle owner
   │  → Refund deposit to user
   │
   ├─ Notification Service ← Consume "booking.completed"
   │  → Push "Vui lòng đánh giá xe"
   │
   └─ Analytics Service ← Consume "booking.completed"
      → Track completion

5. Client → API Gateway: POST /reviews
6. API Gateway → Review Service (gRPC): CreateReview()
7. Review Service → Pulsar: Publish "review.created"
8. Notification Service ← Consume: Notify vehicle owner
```

---

### **Flow 10: Chat Real-time**

```
1. Client connect WebSocket → Chat Service
2. Client send message → Chat Service
3. Chat Service: Save to DB
4. Chat Service: Check if receiver online
   - If online: Send via WebSocket
   - If offline: Publish to Pulsar
5. Notification Service ← Consume: Push notification
```

**Dùng WebSocket**: Real-time chat
**Dùng Pulsar**: Notification cho offline users

---

## 📊 BẢNG PHÂN LOẠI gRPC vs PULSAR

| Service A → Service B        | Protocol   | Sync/Async | Lý do                      |
| ---------------------------- | ---------- | ---------- | -------------------------- |
| Gateway → Auth               | **gRPC**   | Sync       | Validate token ngay        |
| Gateway → Vehicle            | **gRPC**   | Sync       | Get data để response       |
| Gateway → Booking            | **gRPC**   | Sync       | Create booking cần confirm |
| Gateway → Payment            | **gRPC**   | Sync       | Get payment info ngay      |
| Booking → Vehicle (reserve)  | **Pulsar** | Async      | Có thể retry               |
| Booking → Payment (create)   | **Pulsar** | Async      | Tạo payment async          |
| Payment → Booking (confirm)  | **Pulsar** | Async      | Event-driven               |
| Any → Email                  | **Pulsar** | Async      | Gửi email không cần đợi    |
| Any → Notification           | **Pulsar** | Async      | Push notification async    |
| Any → Analytics              | **Pulsar** | Async      | Track events async         |
| Media → Self (resize)        | **Pulsar** | Async      | Heavy processing           |
| Payment → Self (auto cancel) | **Pulsar** | Async      | Delayed message            |

---

## 🗄️ DATABASE DESIGN

### **Auth Service DB**

```sql
- users (id, email, phone, password_hash, name, created_at)
- otp_verifications (email, code, type, expires_at)
- refresh_tokens (user_id, token, expires_at)
```

### **User Service DB**

```sql
- user_profiles (user_id, avatar_url, facebook_url, credit_score)
- driver_licenses (user_id, license_number, full_name, dob, images, verified_at)
- addresses (user_id, type, label, city, district, detail, is_default)
- bank_accounts (user_id, bank_name, account_number, account_holder)
```

### **Vehicle Service DB**

```sql
- vehicles (id, type, name, brand, model, seats, fuel_type, transmission, price_per_hour, price_per_day, location, lat, lng, status)
- vehicle_images (vehicle_id, url, order)
- vehicle_features (vehicle_id, feature_name)
- vehicle_availability (vehicle_id, date, is_available)
```

### **Booking Service DB**

```sql
- bookings (id, user_id, vehicle_id, start_time, end_time, status, total_amount, deposit_amount, insurance_fee, vat, discount_amount)
- booking_checkins (booking_id, type, images, created_at)
```

### **Payment Service DB**

```sql
- payments (id, booking_id, user_id, type, amount, status, qr_code, transaction_id)
```

### **Review Service DB**

```sql
- reviews (id, user_id, vehicle_id, booking_id, rating, comment, created_at)
```

### **Discount Service DB**

```sql
- discounts (id, code, type, value, min_amount, max_discount, valid_from, valid_to, usage_limit)
- discount_usage (discount_id, user_id, booking_id, used_at)
```

### **Complaint Service DB**

```sql
- complaints (id, user_id, booking_id, title, description, images, status)
- complaint_messages (complaint_id, user_id, message, created_at)
```

### **Notification Service DB**

```sql
- notifications (id, user_id, title, content, type, is_read, created_at)
```

### **Chat Service DB**

```sql
- chat_rooms (id, user_id, admin_id, created_at)
- chat_messages (room_id, sender_id, message, created_at)
```

---

## 🚀 TECH STACK

### **Backend**

- **Framework**: NestJS (TypeScript)
- **Monorepo**: NX
- **Sync Communication**: gRPC
- **Async Communication**: Apache Pulsar
- **API Gateway**: Apollo GraphQL Gateway
- **Validation**: nestjs-zod
- **ORM**: Prisma

### **Databases**

- **Main DB**: PostgreSQL
- **Cache**: Redis
- **Search**: Elasticsearch
- **Message Queue**: Apache Pulsar

### **Storage**

- **Object Storage**: MinIO / AWS S3

### **Real-time**

- **WebSocket**: Socket.io

### **DevOps**

- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana

---

## 📈 SCALABILITY STRATEGY

### **Horizontal Scaling**

- Mỗi service có thể scale độc lập
- Load balancing với Kubernetes

### **Caching Strategy**

- Redis cache cho vehicle search
- CDN cho images

### **Database Optimization**

- Read replicas cho PostgreSQL
- Sharding nếu cần
- Elasticsearch cho full-text search

### **Message Queue**

- Pulsar partitioning cho high throughput
- Consumer groups cho parallel processing

---

## 🔒 SECURITY

- **JWT**: Access token (15min) + Refresh token (30 days)
- **API Gateway**: Rate limiting, CORS
- **gRPC**: TLS encryption
- **Database**: Encrypted at rest
- **Sensitive Data**: Hashing (passwords), Encryption (bank info)

---

## 📝 TÓM TẮT

### **Khi nào dùng gRPC?**

✅ Cần response ngay để tiếp tục logic
✅ Validate dữ liệu đồng bộ
✅ Client-facing requests cần low latency

### **Khi nào dùng Pulsar?**

✅ Fire-and-forget (email, notification)
✅ Event-driven architecture
✅ Heavy processing (resize image)
✅ Delayed tasks (auto cancel)
✅ Fan-out pattern (1 event → N consumers)
✅ Retry logic cần thiết

### **Lợi ích của kiến trúc này:**

- 🔧 **Maintainable**: Mỗi service độc lập
- 📈 **Scalable**: Scale từng service riêng
- 🚀 **Fast**: gRPC cho sync, Pulsar cho async
- 🛡️ **Resilient**: Retry, dead letter queue
- 🔄 **Event-driven**: Loose coupling giữa services
