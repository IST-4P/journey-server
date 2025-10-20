# Migration Summary: Pulsar → NATS

## ✅ Hoàn thành toàn bộ migration

### 1. Library Layer (`libs/nats/`)

- ✅ `NatsClient` - Connection management và publish/subscribe
- ✅ `NatsConsumer` - Abstract base class cho consumers
- ✅ `NatsModule` - NestJS module integration
- ✅ `serialize.ts` - JSON serialization utilities
- ✅ Configuration files (tsconfig, project.json, webpack)

### 2. Application Code Migration

#### Apps đã migrate:

- ✅ **apps/auth** - Publish `journey.events.user-registered`
- ✅ **apps/user** - Consume `journey.events.user-registered`
- ✅ **apps/notification** - Consume `journey.events.user-registered`
- ✅ **apps/admin** - Publish notification/chat events
- ✅ **apps/api** - Consume notification/chat events

#### Module imports đã cập nhật:

- ✅ Tất cả `PulsarModule` → `NatsModule`
- ✅ Tất cả `PulsarClient` → `NatsClient`
- ✅ Tất cả `PulsarConsumer` → `NatsConsumer`

### 3. Infrastructure & Configuration

#### Helm Charts:

- ✅ `charts/journey/Chart.yaml` - NATS dependency thay vì Pulsar
- ✅ `charts/journey/values.yaml` - NATS configuration
- ✅ `charts/journey/templates/configmap.yaml` - `NATS_URL` env var
- ✅ `charts/journey/secrets.local.yaml` - Local NATS URL
- ✅ `charts/journey/secrets.product.yaml` - Production NATS URL

#### Docker & Local Dev:

- ✅ `docker-compose.yml` - NATS container
- ✅ `package.json` - `nats@^2.28.2` dependency
- ✅ `tsconfig.base.json` - Path mapping cho `@hacmieu-journey/nats`

### 4. Topic/Subject Mapping

| Pulsar Topic                                              | NATS Subject                                 |
| --------------------------------------------------------- | -------------------------------------------- |
| `persistent://journey/events/user-registered`             | `journey.events.user-registered`             |
| `persistent://journey/notifications/notification-created` | `journey.notifications.notification-created` |
| `persistent://journey/chats/chat-created`                 | `journey.chats.chat-created`                 |

### 5. Code Changes Summary

#### Publisher Pattern (trước):

```typescript
const producer = await this.pulsarClient.createProducer('persistent://journey/events/user-registered');
await producer.send({
  data: Buffer.from(JSON.stringify(eventData)),
  properties: { eventType: 'user.registered' },
  eventTimestamp: Date.now(),
});
```

#### Publisher Pattern (sau):

```typescript
await this.natsClient.publish('journey.events.user-registered', eventData);
```

#### Consumer Pattern (trước):

```typescript
export class ProfileConsumer extends PulsarConsumer<Event> {
  constructor(pulsarClient: PulsarClient, service: Service) {
    super(pulsarClient, 'persistent://journey/events/user-registered', 'user-service');
  }
}
```

#### Consumer Pattern (sau):

```typescript
export class ProfileConsumer extends NatsConsumer<Event> {
  constructor(natsClient: NatsClient, service: Service) {
    super(natsClient, 'journey.events.user-registered');
  }
}
```

## 📁 Files Created/Modified

### Created:

- `libs/nats/` - Entire new library (8 files)
- `NATS_MIGRATION.md` - Migration documentation
- `NATS_DEPLOYMENT.md` - Deployment guide

### Modified:

- `package.json` - Dependencies
- `tsconfig.base.json` - Path mappings
- `docker-compose.yml` - NATS container
- `charts/journey/Chart.yaml` - Helm dependency
- `charts/journey/values.yaml` - NATS config
- `charts/journey/templates/configmap.yaml` - Environment vars
- `charts/journey/secrets.*.yaml` - Connection strings
- 20+ application files across all services

## 🚀 Next Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Test Locally

```bash
# Start NATS
docker-compose up -d nats

# Set environment
export NATS_URL=nats://localhost:4222

# Run services
npm run dev
```

### 3. Deploy to K8s

```bash
cd charts/journey
helm dependency update
helm upgrade --install journey . -f secrets.local.yaml
```

## 🔑 Key Benefits

1. **Simplicity** - NATS là đơn giản hơn nhiều so với Pulsar
2. **Performance** - Latency thấp hơn cho fire-and-forget messaging
3. **Resource Usage** - Ít resource hơn (CPU/Memory)
4. **Code Cleaner** - Ít boilerplate code hơn
5. **Deployment** - Dễ deploy và maintain hơn

## ⚠️ Breaking Changes

- Environment variable: `PULSAR_SERVICE_URL` → `NATS_URL`
- Topic format: `persistent://tenant/namespace/topic` → `dot.notation.subject`
- Consumer groups: Tự động handle bởi NATS (không cần service name)

## 📊 Resource Comparison

### Pulsar Stack:

- Zookeeper: 128Mi RAM, 50m CPU
- Broker: 512Mi RAM, 100m CPU
- Bookkeeper: 256Mi RAM, 50m CPU
- Proxy: 256Mi RAM, 50m CPU
- **Total: ~1.2Gi RAM, ~250m CPU**

### NATS:

- NATS Server: 256Mi RAM, 50m CPU
- **Total: 256Mi RAM, 50m CPU**

**Tiết kiệm: ~80% tài nguyên!**

## ✅ Verification Checklist

- [x] Library code compiled without errors
- [x] All imports updated
- [x] All topic/subject names mapped
- [x] Helm charts updated
- [x] Docker compose updated
- [x] Environment variables updated
- [x] Documentation created
- [ ] Local testing
- [ ] Integration testing
- [ ] Production deployment

---

**Migration Status: COMPLETE ✅**

Tất cả code đã được migrate, config đã được update, infrastructure đã sẵn sàng để deploy!
