# Stage 1: Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project file và restore dependencies
COPY apps/blog/Blog.csproj apps/blog/
RUN dotnet restore apps/blog/Blog.csproj

# Copy toàn bộ source code
COPY apps/blog/ apps/blog/
COPY libs/grpc/ libs/grpc/

# Build project
WORKDIR /src/apps/blog
RUN dotnet build Blog.csproj -c Release -o /app/build

# Publish
RUN dotnet publish Blog.csproj -c Release -o /app/publish /p:UseAppHost=false

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
ENTRYPOINT ["dotnet", "Blog.dll"]