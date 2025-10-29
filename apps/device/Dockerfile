# Stage 1: Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project file và restore dependencies
COPY apps/device/device.csproj apps/device/
RUN dotnet restore apps/device/device.csproj

# Copy toàn bộ source code
COPY apps/device/ apps/device/
COPY libs/grpc/src/lib/proto/device.proto apps/device/Protos/

# Build project
WORKDIR /src/apps/device
RUN dotnet build device.csproj -c Release -o /app/build

# Publish
RUN dotnet publish device.csproj -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Copy published app từ build stage
COPY --from=build /app/publish .

# Expose gRPC port
EXPOSE 5005

# Set environment variables
ENV ASPNETCORE_URLS=http://+:5005
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5005/health || exit 1

# Run the application
ENTRYPOINT ["dotnet", "device.dll"]