# NATS Migration Summary

## Migration Overview

Migrated from Apache Pulsar to NATS for fire-and-forget messaging patterns.

## Topic Mapping

Pulsar topics converted to NATS subjects using dot notation:

| Pulsar Topic                                              | NATS Subject                                 |
| --------------------------------------------------------- | -------------------------------------------- |
| `persistent://journey/events/user-registered`             | `journey.events.user-registered`             |
| `persistent://journey/notifications/notification-created` | `journey.notifications.notification-created` |
| `persistent://journey/chats/chat-created`                 | `journey.chats.chat-created`                 |

## Changes Made

### 1. Library Migration (`libs/nats/`)

- Created new NATS library with similar API to Pulsar
- `NatsClient`: Connection management and pub/sub
- `NatsConsumer`: Abstract consumer base class
- `NatsModule`: NestJS module

### 2. Application Code

Migrated all services:

- `apps/auth/` - Publishing user-registered events
- `apps/user/` - Consuming user-registered events
- `apps/notification/` - Consuming user-registered events
- `apps/admin/` - Publishing notification/chat events
- `apps/api/` - Consuming notification/chat events

### 3. Infrastructure

- Updated `charts/journey/Chart.yaml`: NATS Helm dependency
- Updated `charts/journey/values.yaml`: NATS configuration
- Updated `charts/journey/templates/configmap.yaml`: `NATS_URL` env var
- Updated secrets: `natsUrl` instead of `pulsarUrl`

### 4. Dependencies

- `package.json`: Replaced `pulsar-client` with `nats@^2.28.2`
- `tsconfig.base.json`: Updated path mapping for `@hacmieu-journey/nats`

## Key Differences

1. **Connection**: NATS uses single connection vs Pulsar's broker-based
2. **Topics**: Dot notation subjects vs Pulsar's persistent://tenant/namespace/topic
3. **Publishing**: Direct `publish()` vs producer creation
4. **Consuming**: Automatic subscription vs explicit consumer groups
5. **Simplicity**: NATS is lighter and simpler for fire-and-forget patterns

## Deployment Steps

1. Install dependencies: `npm install`
2. Update Helm dependencies: `helm dependency update charts/journey`
3. Deploy NATS: Helm chart will deploy NATS automatically
4. Update environment variables to point to NATS URL
5. Restart all services

## NATS Connection

- Local: `nats://journey-nats:4222`
- Production: Same (within k8s cluster)
