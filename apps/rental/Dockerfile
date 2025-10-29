# Stage 1: Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project file và restore dependencies
COPY apps/rental/rental.csproj apps/rental/
COPY libs/grpc/ libs/grpc/
RUN dotnet restore apps/rental/rental.csproj

# Copy toàn bộ source code
COPY apps/rental/ apps/rental/

# Build project
WORKDIR /src/apps/rental
RUN dotnet build rental.csproj -c Release -o /app/build

# Publish
RUN dotnet publish rental.csproj -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Copy published app từ build stage
COPY --from=build /app/publish .

# Expose gRPC port
EXPOSE 5007

# Set environment variables
ENV ASPNETCORE_URLS=http://+:5007
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5007/health || exit 1

# Run the application
ENTRYPOINT ["dotnet", "rental.dll"]