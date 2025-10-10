using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Admin.Models
{
    public class AuthDto
    {

        public string Id { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Name { get; set; }
        public string Role { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

    }

    public enum Role
    {
        USER,
        ADMIN
    }
    
    public class VerificationCode
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string email { get; set; }
        public string code { get; set; }
        public VerificationCode verificationCode { get; set; }

    }

    public class RefreshToken
    {
        public string Id { get; set; }
        public string UserId { get; set; }
        public string Token { get; set; }
        public DateTime ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }


}