using AuthGrpc;

namespace Blog.Grpc.Clients
{
    public interface IAuthGrpcClient
    {
        Task<(bool valid, string userId, string role, string? error)> ValidateTokenAsync(string token, CancellationToken ct = default);
    }

    public class AuthGrpcClient : IAuthGrpcClient
    {
        private readonly AuthService.AuthServiceClient _client;

        public AuthGrpcClient(AuthService.AuthServiceClient client)
        {
            _client = client;
        }

        public async Task<(bool valid, string userId, string role, string? error)> ValidateTokenAsync(string token, CancellationToken ct = default)
        {
            var response = await _client.ValidateTokenAsync(new ValidateTokenRequest { AccessToken = token }, cancellationToken: ct);
            return (response.IsValid, response.UserId ?? string.Empty, response.Role ?? string.Empty, string.IsNullOrWhiteSpace(response.Error) ? null : response.Error);
        }
    }
}