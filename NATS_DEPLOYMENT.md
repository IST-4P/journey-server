# NATS Deployment Guide

## Local Development

### 1. Start NATS with Docker Compose

```bash
docker-compose up -d nats
```

NATS will be available at:

- Client connection: `nats://localhost:4222`
- Monitoring: `http://localhost:8222`

### 2. Set Environment Variable

```bash
# .env or export
NATS_URL=nats://localhost:4222
```

### 3. Run Services

```bash
npm run dev
```

## Kubernetes Deployment

### 1. Update Helm Dependencies

```bash
cd charts/journey
helm dependency update
```

### 2. Deploy to Kubernetes

```bash
# Local deployment
helm upgrade --install journey . -f secrets.local.yaml

# Production deployment
helm upgrade --install journey . -f secrets.product.yaml
```

### 3. Verify NATS Deployment

```bash
# Check NATS pod
kubectl get pods -l app.kubernetes.io/name=nats

# Check NATS service
kubectl get svc journey-nats

# View NATS logs
kubectl logs -l app.kubernetes.io/name=nats
```

### 4. Test NATS Connection

```bash
# Port forward to access NATS monitoring
kubectl port-forward svc/journey-nats 8222:8222

# Access monitoring at http://localhost:8222
```

## Environment Variables

All services need:

```
NATS_URL=nats://journey-nats:4222  # In Kubernetes
NATS_URL=nats://localhost:4222      # Local development
```

## Migration from Pulsar

If migrating from existing Pulsar deployment:

1. **Gradual Migration** (recommended):

   - Deploy NATS alongside Pulsar
   - Update services one by one
   - Monitor both systems
   - Remove Pulsar when all services migrated

2. **Clean Migration**:
   - Stop all services
   - Remove Pulsar deployment
   - Deploy NATS
   - Deploy updated services

## NATS Configuration

Current configuration in `values.yaml`:

```yaml
nats:
  enabled: true
  nats:
    jetstream:
      enabled: false # We don't need JetStream for fire-and-forget
    limits:
      maxConnections: 100
      maxSubscriptions: 100
  container:
    resources:
      requests:
        cpu: 50m
        memory: 128Mi
      limits:
        cpu: 200m
        memory: 256Mi
```

## Troubleshooting

### NATS Connection Issues

```bash
# Check NATS logs
kubectl logs -l app.kubernetes.io/name=nats

# Check service connectivity
kubectl run -it --rm debug --image=alpine --restart=Never -- sh
# Inside pod:
apk add curl
curl http://journey-nats:8222/varz
```

### Service Connection Issues

```bash
# Check service logs
kubectl logs -l app=auth
kubectl logs -l app=user
kubectl logs -l app=notification

# Look for NATS connection errors
kubectl logs -l app=auth | grep -i nats
```

## Performance Tuning

For high-load scenarios, adjust:

```yaml
nats:
  nats:
    limits:
      maxConnections: 1000
      maxSubscriptions: 1000
      maxPayload: 1048576 # 1MB
  container:
    resources:
      requests:
        cpu: 200m
        memory: 512Mi
      limits:
        cpu: 1000m
        memory: 1Gi
```

## Monitoring

NATS provides built-in monitoring at port 8222:

- `/varz` - General server info
- `/connz` - Connection info
- `/routez` - Route info
- `/subsz` - Subscription info

Access via port-forward:

```bash
kubectl port-forward svc/journey-nats 8222:8222
curl http://localhost:8222/varz
```
