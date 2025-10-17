using System.Security.Claims;
using Grpc.Net.Client;
using Auth;

namespace Blog.Middleware;

/// <summary>
/// Middleware để xác thực request thông qua gRPC Auth Service
/// Gọi ValidateToken từ Auth service để verify access token
/// </summary>
public class GrpcAuthenticationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IConfiguration _configuration;
    private readonly ILogger<GrpcAuthenticationMiddleware> _logger;

    public GrpcAuthenticationMiddleware(
        RequestDelegate next,
        IConfiguration configuration,
        ILogger<GrpcAuthenticationMiddleware> logger)
    {
        _next = next;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Kiểm tra xem endpoint có yêu cầu authentication không
        var endpoint = context.GetEndpoint();
        var authorizeAttribute = endpoint?.Metadata.GetMetadata<Microsoft.AspNetCore.Authorization.AuthorizeAttribute>();
        var allowAnonymousAttribute = endpoint?.Metadata.GetMetadata<Microsoft.AspNetCore.Authorization.AllowAnonymousAttribute>();

        // Nếu endpoint cho phép anonymous hoặc không yêu cầu authorize thì skip
        if (allowAnonymousAttribute != null || authorizeAttribute == null)
        {
            await _next(context);
            return;
        }

        // Lấy access token từ header hoặc cookie
        var accessToken = ExtractAccessToken(context);

        if (string.IsNullOrEmpty(accessToken))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new { error = "Missing access token" });
            return;
        }

        // Gọi gRPC Auth Service để validate token
        var authServiceUrl = _configuration["Services:Auth:GrpcUrl"] 
            ?? throw new InvalidOperationException("Auth service URL not configured");

        try
        {
            using var channel = GrpcChannel.ForAddress(authServiceUrl);
            var client = new AuthService.AuthServiceClient(channel);

            var response = await client.ValidateTokenAsync(new ValidateTokenRequest
            {
                AccessToken = accessToken
            });

            if (!response.IsValid)
            {
                _logger.LogWarning("Token validation failed: {Error}", response.Error);
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsJsonAsync(new { error = response.Error });
                return;
            }

            // Tạo Claims từ token payload
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, response.UserId),
                new Claim(ClaimTypes.Role, response.Role),
                new Claim("uuid", response.Uuid),
                new Claim("iat", response.Iat.ToString()),
                new Claim("exp", response.Exp.ToString())
            };

            var identity = new ClaimsIdentity(claims, "GrpcAuth");
            context.User = new ClaimsPrincipal(identity);

            _logger.LogInformation("User {UserId} authenticated successfully", response.UserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating token with Auth service");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsJsonAsync(new { error = "Authentication service error" });
            return;
        }

        await _next(context);
    }

    /// <summary>
    /// Trích xuất access token từ Authorization header hoặc cookie
    /// </summary>
    private string? ExtractAccessToken(HttpContext context)
    {
        // Thử lấy từ Authorization header
        var authHeader = context.Request.Headers.Authorization.ToString();
        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return authHeader.Substring("Bearer ".Length).Trim();
        }

        // Thử lấy từ cookie
        if (context.Request.Cookies.TryGetValue("accessToken", out var token))
        {
            return token;
        }

        return null;
    }
}

/// <summary>
/// Extension methods để đăng ký middleware
/// </summary>
public static class GrpcAuthenticationMiddlewareExtensions
{
    public static IApplicationBuilder UseGrpcAuthentication(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<GrpcAuthenticationMiddleware>();
    }
}
