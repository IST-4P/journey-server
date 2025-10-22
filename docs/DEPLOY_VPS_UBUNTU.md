# Hướng dẫn Deploy Journey Application lên VPS Ubuntu

## Mục lục

1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Chuẩn bị VPS](#chuẩn-bị-vps)
3. [Cài đặt K3s (Lightweight Kubernetes)](#cài-đặt-k3s)
4. [Cài đặt Helm](#cài-đặt-helm)
5. [Deploy ứng dụng](#deploy-ứng-dụng)
6. [Cấu hình Domain & SSL](#cấu-hình-domain--ssl)
7. [Monitoring & Logging](#monitoring--logging)

---

## Yêu cầu hệ thống

### Cấu hình tối thiểu:

- **CPU**: 2 vCPU
- **RAM**: 4GB
- **Disk**: 40GB SSD
- **OS**: Ubuntu 22.04 LTS hoặc 24.04 LTS
- **Network**: Public IP

### Cấu hình khuyên dùng (Production):

- **CPU**: 4 vCPU
- **RAM**: 8GB
- **Disk**: 80GB SSD
- **OS**: Ubuntu 24.04 LTS
- **Network**: Public IP + Domain

### Chi phí ước tính:

| Provider     | Specs                      | Giá/tháng     |
| ------------ | -------------------------- | ------------- |
| Vultr        | 2 vCPU, 4GB RAM, 80GB SSD  | $12           |
| DigitalOcean | 2 vCPU, 4GB RAM, 80GB SSD  | $24           |
| Contabo      | 4 vCPU, 8GB RAM, 200GB SSD | €5.99 (~$6.5) |
| Hetzner      | 2 vCPU, 4GB RAM, 40GB SSD  | €4.5 (~$5)    |

---

## Chuẩn bị VPS

### 1. Kết nối SSH vào VPS

```bash
ssh root@<VPS_IP>
```

### 2. Update hệ thống

```bash
apt update && apt upgrade -y
```

### 3. Cài đặt các tools cơ bản

```bash
apt install -y curl wget git nano htop net-tools
```

### 4. Cấu hình Firewall (UFW)

```bash
# Cho phép SSH
ufw allow 22/tcp

# Cho phép HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Cho phép Kubernetes API (nếu cần truy cập từ ngoài)
ufw allow 6443/tcp

# Enable firewall
ufw enable
ufw status
```

### 5. Tắt Swap (bắt buộc cho Kubernetes)

```bash
swapoff -a
sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab
```

### 6. Cấu hình hostname

```bash
hostnamectl set-hostname journey-k8s
echo "127.0.0.1 journey-k8s" >> /etc/hosts
```

---

## Cài đặt K3s (Lightweight Kubernetes)

### Tại sao dùng K3s thay vì K8s đầy đủ?

- ✅ Nhẹ hơn (50MB binary vs 1GB+)
- ✅ Tiêu tốn ít RAM hơn (~512MB vs 2GB+)
- ✅ Tích hợp sẵn Ingress Controller (Traefik)
- ✅ Tích hợp sẵn Storage (Local Path Provisioner)
- ✅ Phù hợp cho single-node hoặc small cluster

### 1. Cài đặt K3s

```bash
# Cài K3s với Traefik Ingress disabled (dùng NGINX Ingress)
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable traefik" sh -

# Kiểm tra trạng thái
systemctl status k3s

# Kiểm tra nodes
k3s kubectl get nodes
```

### 2. Cấu hình kubectl

```bash
# Copy kubeconfig
mkdir -p ~/.kube
cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
chmod 600 ~/.kube/config

# Tạo alias cho kubectl
echo "alias kubectl='k3s kubectl'" >> ~/.bashrc
source ~/.bashrc

# Test
kubectl get nodes
```

Output mong muốn:

```
NAME          STATUS   ROLES                  AGE   VERSION
journey-k8s   Ready    control-plane,master   1m    v1.28.x+k3s1
```

---

## Cài đặt Helm

```bash
# Cài Helm 3
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Kiểm tra version
helm version
```

---

## Deploy ứng dụng

### 1. Clone source code

```bash
cd /opt
git clone https://github.com/IST-4P/journey-vehicle-server.git
cd journey-vehicle-server
git checkout service
```

### 2. Tạo secrets.production.yaml

```bash
cd charts/journey
nano secrets.production.yaml
```

Nội dung file:

```yaml
config:
  pulsarUrl: 'pulsar://journey-pulsar-proxy.pulsar:6650'
  authUrl: 'auth.journey:5000'
  userUrl: 'user.journey:5001'
  notificationUrl: 'notification.journey:5002'
  accessTokenExpiresIn: '1h'
  refreshTokenExpiresIn: '7d'
  otpExpires: '5m'

secrets:
  # THAY BẰNG DATABASE THẬT
  authDatabaseUrl: 'postgresql://user:password@host:5432/journey_auth?sslmode=require'
  userDatabaseUrl: 'postgresql://user:password@host:5432/journey_user?sslmode=require'
  notificationDatabaseUrl: 'postgresql://user:password@host:5432/journey_notification?sslmode=require'

  # TẠO SECRET MỚI CHO PRODUCTION
  accessTokenSecret: 'CHANGE_THIS_TO_RANDOM_STRING_32_CHARS'
  refreshTokenSecret: 'CHANGE_THIS_TO_RANDOM_STRING_32_CHARS'

  # Email API Key
  resendApiKey: 're_YOUR_RESEND_API_KEY'

ingress:
  enabled: true
  host: 'api.yourdomain.com'
  email: 'your-email@example.com'
```

**Lưu ý:** Tạo random secrets:

```bash
openssl rand -base64 32
```

### 3. Deploy Pulsar trước

```bash
helm install journey . \
  --namespace journey \
  --create-namespace \
  --set api.enabled=false \
  --set auth.enabled=false \
  --set user.enabled=false \
  --set notification.enabled=false

# Đợi Pulsar ready (5-10 phút)
kubectl get pods -n pulsar --watch
```

### 4. Tạo Pulsar tenant và namespace

```bash
# Tìm toolset pod
kubectl get pod -n pulsar | grep toolset

# Tạo tenant
kubectl exec -it journey-pulsar-toolset-0 -n pulsar -- \
  bin/pulsar-admin tenants create journey --allowed-clusters journey-pulsar

# Tạo namespace
kubectl exec -it journey-pulsar-toolset-0 -n pulsar -- \
  bin/pulsar-admin namespaces create journey/events

# Kiểm tra
kubectl exec -it journey-pulsar-toolset-0 -n pulsar -- \
  bin/pulsar-admin tenants list
```

### 5. Deploy tất cả services

```bash
helm upgrade journey . \
  -f secrets.production.yaml \
  --namespace journey \
  --set api.enabled=true \
  --set auth.enabled=true \
  --set user.enabled=true \
  --set notification.enabled=true

# Kiểm tra pods
kubectl get pods -n journey
```

Đợi tất cả pods **Running** (có thể mất 5-10 phút).

---

## Cấu hình Domain & SSL

### 1. Cài đặt NGINX Ingress Controller

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

helm install nginx-ingress ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.type=LoadBalancer
```

**Lưu ý VPS:** K3s không có LoadBalancer ngoài, dùng NodePort:

```bash
helm install nginx-ingress ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.type=NodePort \
  --set controller.service.nodePorts.http=30080 \
  --set controller.service.nodePorts.https=30443
```

### 2. Cấu hình Firewall cho NodePort

```bash
ufw allow 30080/tcp
ufw allow 30443/tcp
```

### 3. Cấu hình DNS

Vào DNS provider, tạo A Record:

```
Type: A
Name: api
Value: <VPS_PUBLIC_IP>
TTL: Auto
```

### 4. Cài đặt Cert-Manager (SSL)

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Đợi cert-manager ready
kubectl get pods -n cert-manager --watch
```

### 5. Deploy Ingress

```bash
# Update ingress enabled trong secrets.production.yaml
nano secrets.production.yaml
```

Sửa:

```yaml
ingress:
  enabled: true
  host: 'api.yourdomain.com' # Domain thật
  email: 'your-email@example.com'
```

```bash
# Deploy lại
helm upgrade journey . -f secrets.production.yaml --namespace journey
```

### 6. Kiểm tra SSL

```bash
kubectl get certificate -n journey
kubectl describe certificate api-tls-secret -n journey
```

Đợi certificate **READY: True** (1-2 phút).

### 7. Test API

```bash
# HTTP sẽ redirect sang HTTPS
curl http://api.yourdomain.com

# HTTPS với SSL
curl https://api.yourdomain.com
```

---

## Cấu hình Database

### Option 1: PostgreSQL trên cùng VPS (Dev/Staging)

```bash
# Cài PostgreSQL
apt install -y postgresql postgresql-contrib

# Tạo databases
sudo -u postgres psql << EOF
CREATE DATABASE journey_auth;
CREATE DATABASE journey_user;
CREATE DATABASE journey_notification;
CREATE USER journey_app WITH PASSWORD 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE journey_auth TO journey_app;
GRANT ALL PRIVILEGES ON DATABASE journey_user TO journey_app;
GRANT ALL PRIVILEGES ON DATABASE journey_notification TO journey_app;
EOF

# Cho phép kết nối từ localhost
echo "host    all             all             127.0.0.1/32            md5" >> /etc/postgresql/*/main/pg_hba.conf
systemctl restart postgresql
```

Connection string:

```
postgresql://journey_app:STRONG_PASSWORD_HERE@localhost:5432/journey_auth
```

### Option 2: Managed PostgreSQL (Production)

Dùng dịch vụ managed database:

- **Aiven** (Free tier 1GB)
- **ElephantSQL** (Free tier 20MB)
- **Supabase** (Free tier 500MB)
- **Neon** (Free tier 3GB)

---

## Monitoring & Logging

### 1. Xem logs pods

```bash
# Logs realtime
kubectl logs -f deployment/api -n journey
kubectl logs -f deployment/auth -n journey
kubectl logs -f deployment/user -n journey
kubectl logs -f deployment/notification -n journey

# Logs lỗi
kubectl logs deployment/auth -n journey --tail=100 | grep -i error
```

### 2. Xem resource usage

```bash
# CPU/RAM của pods
kubectl top pods -n journey
kubectl top pods -n pulsar

# CPU/RAM của node
kubectl top nodes
```

### 3. Cài đặt K9s (TUI cho Kubernetes)

```bash
# Cài K9s
wget https://github.com/derailed/k9s/releases/download/v0.31.7/k9s_Linux_amd64.tar.gz
tar -xzf k9s_Linux_amd64.tar.gz
mv k9s /usr/local/bin/
chmod +x /usr/local/bin/k9s

# Chạy K9s
k9s
```

### 4. Setup log aggregation (Optional)

```bash
# Cài Loki Stack (Grafana + Loki + Promtail)
helm repo add grafana https://grafana.github.io/helm-charts
helm install loki grafana/loki-stack \
  --namespace monitoring \
  --create-namespace \
  --set grafana.enabled=true

# Lấy Grafana admin password
kubectl get secret --namespace monitoring loki-grafana \
  -o jsonpath="{.data.admin-password}" | base64 --decode ; echo

# Port-forward Grafana
kubectl port-forward --namespace monitoring service/loki-grafana 3000:80
```

Truy cập: `http://localhost:3000` (admin / password từ lệnh trên)

---

## Backup & Recovery

### 1. Backup database

```bash
# Tạo script backup
cat > /opt/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"
mkdir -p $BACKUP_DIR

# Backup databases
pg_dump -U journey_app journey_auth > $BACKUP_DIR/journey_auth_$DATE.sql
pg_dump -U journey_app journey_user > $BACKUP_DIR/journey_user_$DATE.sql
pg_dump -U journey_app journey_notification > $BACKUP_DIR/journey_notification_$DATE.sql

# Xóa backup cũ hơn 7 ngày
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /opt/backup-db.sh
```

### 2. Cron job tự động backup

```bash
# Chạy backup mỗi ngày lúc 2AM
crontab -e
```

Thêm dòng:

```
0 2 * * * /opt/backup-db.sh >> /var/log/db-backup.log 2>&1
```

### 3. Backup Kubernetes configs

```bash
# Backup tất cả resources
kubectl get all --all-namespaces -o yaml > /opt/backups/k8s-all-resources.yaml

# Backup chỉ namespace journey
kubectl get all -n journey -o yaml > /opt/backups/journey-resources.yaml
```

---

## Troubleshooting

### 1. Pods bị CrashLoopBackOff

```bash
# Xem logs
kubectl logs <pod-name> -n journey --previous

# Xem events
kubectl describe pod <pod-name> -n journey

# Restart deployment
kubectl rollout restart deployment/<name> -n journey
```

### 2. Out of Memory

```bash
# Kiểm tra RAM
free -h
kubectl top nodes

# Giảm replicas tạm thời
kubectl scale deployment auth --replicas=0 -n journey
```

### 3. Disk đầy

```bash
# Kiểm tra disk
df -h

# Xóa Docker images cũ (nếu dùng Docker)
docker system prune -a

# Xóa logs K3s
rm -rf /var/lib/rancher/k3s/agent/containerd/io.containerd.*.v1.bolt/*.db-journal
```

### 4. Database connection failed

```bash
# Test connection từ pod
kubectl run test-db --rm -it --image=postgres:15 -- psql "postgresql://user:pass@host:5432/dbname"

# Kiểm tra network
kubectl exec -it <pod-name> -n journey -- ping <db-host>
```

---

## Upgrade & Maintenance

### 1. Update Docker images

```bash
# Build và push images mới
docker build -t caophi562005/journey-api:v1.0.1 ./apps/api
docker push caophi562005/journey-api:v1.0.1

# Update values.yaml
api:
  image: 'caophi562005/journey-api:v1.0.1'

# Deploy
helm upgrade journey . -f secrets.production.yaml --namespace journey
```

### 2. Update Helm chart

```bash
cd /opt/journey-vehicle-server
git pull origin service

helm upgrade journey ./charts/journey \
  -f ./charts/journey/secrets.production.yaml \
  --namespace journey
```

### 3. Rollback nếu lỗi

```bash
# Xem lịch sử deployment
helm history journey -n journey

# Rollback về revision trước
helm rollback journey <revision-number> -n journey
```

### 4. Update K3s

```bash
# Check version mới
curl -s https://api.github.com/repos/k3s-io/k3s/releases/latest | grep tag_name

# Update K3s
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION="v1.28.x+k3s1" sh -

# Restart
systemctl restart k3s
```

---

## Security Best Practices

### 1. Đổi SSH port

```bash
nano /etc/ssh/sshd_config
```

Sửa: `Port 22` → `Port 2222`

```bash
systemctl restart sshd
ufw allow 2222/tcp
ufw delete allow 22/tcp
```

### 2. Cài Fail2Ban

```bash
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

### 3. Setup SSH key only

```bash
# Copy SSH key từ máy local
ssh-copy-id root@<VPS_IP>

# Tắt password login
nano /etc/ssh/sshd_config
```

Sửa:

```
PasswordAuthentication no
PermitRootLogin prohibit-password
```

```bash
systemctl restart sshd
```

### 4. Network Policies

```bash
# Tạo file network-policy.yaml
kubectl apply -f - << EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all-ingress
  namespace: journey
spec:
  podSelector: {}
  policyTypes:
  - Ingress
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-from-ingress
  namespace: journey
spec:
  podSelector:
    matchLabels:
      app: api
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
EOF
```

---

## Chi phí vận hành ước tính

| Item                  | Specs           | Giá/tháng     |
| --------------------- | --------------- | ------------- |
| VPS Hetzner           | 4 vCPU, 8GB RAM | $5            |
| Database (Aiven Free) | 1GB PostgreSQL  | $0            |
| Domain (.xyz)         | 1 domain        | $1            |
| **TỔNG**              |                 | **~$6/tháng** |

---

## Kết luận

Bạn đã deploy thành công Journey Application lên VPS Ubuntu với:

- ✅ K3s Kubernetes cluster
- ✅ Pulsar message broker
- ✅ Auth, User, Notification, API services
- ✅ NGINX Ingress + SSL/HTTPS
- ✅ PostgreSQL database
- ✅ Monitoring & Logging

**Next steps:**

1. Setup CI/CD với GitHub Actions
2. Implement auto-scaling với HPA
3. Setup monitoring với Prometheus + Grafana
4. Backup tự động lên S3/R2

---

## Liên hệ & Support

- GitHub: https://github.com/IST-4P/journey-vehicle-server
- Issues: https://github.com/IST-4P/journey-vehicle-server/issues
