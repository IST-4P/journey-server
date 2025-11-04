flowchart TB
subgraph CLIENT["🌐 Client Layer"]
WEB["Web App"]
MOBILE["Mobile App"]
ADMIN_WEB["Admin Dashboard"]
end

    subgraph GATEWAY["🚪 API Gateway Layer"]
        API["API Gateway<br/>Port: 3000"]
        ADMIN_GW["Admin Gateway<br/>Port: 3100"]
    end

    subgraph SERVICES["⚙️ Microservices Layer"]
        direction TB
        subgraph NODEJS["Node.js Services (NestJS)"]
            AUTH["Auth Service<br/>gRPC: 5000"]
            USER["User Service<br/>gRPC: 5001"]
            NOTIFICATION["Notification Service<br/>gRPC: 5002"]
            CHAT["Chat Service<br/>gRPC: 5003"]
            VEHICLE["Vehicle Service<br/>gRPC: 5004"]
            BOOKING["Booking Service<br/>gRPC: 5008"]
            PAYMENT["Payment Service<br/>gRPC: 5009"]
        end

        subgraph DOTNET[".NET Services (ASP.NET Core)"]
            BLOG["Blog Service<br/>gRPC: 5005"]
            DEVICE["Device Service<br/>gRPC: 5006"]
            RENTAL["Rental Service<br/>gRPC: 5007"]
            REVIEW["Review Service<br/>gRPC: 5010"]
            COMPLAINT["Complaint Service<br/>gRPC: 5011"]
        end
    end    subgraph INFRA["💾 Infrastructure Layer"]
        direction LR
        POSTGRES[("PostgreSQL<br/>Database per Service")]
        REDIS[("Redis<br/>Cache & WebSocket")]
        NATS[("NATS JetStream<br/>Port: 4222")]
    end

    %% Client to Gateway
    WEB --> API
    MOBILE --> API
    ADMIN_WEB --> ADMIN_GW

    %% API Gateway to Services
    API -->|gRPC| AUTH
    API -->|gRPC| USER
    API -->|gRPC| BOOKING
    API -->|gRPC| PAYMENT
    API -->|gRPC| NOTIFICATION
    API -->|gRPC| CHAT
    API -->|gRPC| VEHICLE
    API -->|gRPC| BLOG
    API -->|gRPC| DEVICE
    API -->|gRPC| RENTAL
    API -->|gRPC| REVIEW

    %% Admin Gateway to Services
    ADMIN_GW -->|gRPC| AUTH
    ADMIN_GW -->|gRPC| USER
    ADMIN_GW -->|gRPC| BOOKING
    ADMIN_GW -->|gRPC| NOTIFICATION
    ADMIN_GW -->|gRPC| CHAT
    ADMIN_GW -->|gRPC| VEHICLE
    ADMIN_GW -->|gRPC| BLOG
    ADMIN_GW -->|gRPC| DEVICE

    %% Services to PostgreSQL
    AUTH -.->|SQL| POSTGRES
    USER -.->|SQL| POSTGRES
    BOOKING -.->|SQL| POSTGRES
    PAYMENT -.->|SQL| POSTGRES
    VEHICLE -.->|SQL| POSTGRES
    NOTIFICATION -.->|SQL| POSTGRES
    CHAT -.->|SQL| POSTGRES
    BLOG -.->|SQL| POSTGRES
    DEVICE -.->|SQL| POSTGRES
    RENTAL -.->|SQL| POSTGRES
    COMPLAINT -.->|SQL| POSTGRES
    REVIEW -.->|SQL| POSTGRES

    %% Services to NATS (Event-driven)
    REVIEW -->|Publish| NATS
    RENTAL -->|Publish| NATS
    BOOKING -->|Publish| NATS
    NATS -->|Subscribe| DEVICE
    NATS -->|Subscribe| PAYMENT
    NATS -->|Subscribe| NOTIFICATION

    %% Services to Redis
    API -.->|Cache| REDIS
    ADMIN_GW -.->|Cache| REDIS
    CHAT -.->|WebSocket| REDIS

    %% Inter-service gRPC calls
    RENTAL -.->|gRPC| USER
    RENTAL -.->|gRPC| DEVICE
    RENTAL -.->|gRPC| PAYMENT
    REVIEW -.->|gRPC| DEVICE
    REVIEW -.->|gRPC| VEHICLE
    REVIEW -.->|gRPC| RENTAL
    REVIEW -.->|gRPC| BOOKING

    classDef clientStyle fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    classDef gatewayStyle fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    classDef nodejsStyle fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    classDef dotnetStyle fill:#bbdefb,stroke:#1565c0,stroke-width:2px
    classDef infraStyle fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px

    class WEB,MOBILE,ADMIN_WEB clientStyle
    class API,ADMIN_GW gatewayStyle
    class AUTH,USER,BOOKING,PAYMENT,VEHICLE,NOTIFICATION,CHAT nodejsStyle
    class BLOG,DEVICE,RENTAL,COMPLAINT,REVIEW dotnetStyle
    class POSTGRES,REDIS,NATS infraStyle
