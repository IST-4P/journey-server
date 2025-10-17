using AuthGrpc;

namespace device.Grpc.Clients
{
    public interface IAuthGrpcClient
    {
        Task<(bool valid, string userId, string[] roles, string? reason)> ValidateTokenAsync(string token, CancellationToken ct = default);
    }

    public class AuthGrpcClient : IAuthGrpcClient
    {
        private readonly Auth.AuthClient _client;

        public AuthGrpcClient(Auth.AuthClient client)
        {
            _client = client;
        }

        public async Task<(bool valid, string userId, string[] roles, string? reason)> ValidateTokenAsync(string token, CancellationToken ct = default)
        {
            var reply = await _client.ValidateTokenAsync(new ValidateTokenRequest { Token = token }, cancellationToken: ct);
            return (reply.Valid, reply.UserId, reply.Roles.ToArray(), string.IsNullOrWhiteSpace(reply.Reason) ? null : reply.Reason);
        }
    }
}