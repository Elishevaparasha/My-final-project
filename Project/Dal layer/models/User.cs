using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dal_layer.Models
{
    public class User
    {
        public Guid Id { get; set; }
        public string UserName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public Role Role { get; set; }
        public bool IsEmailVerified { get; set; }
        public bool IsSubscriber { get; set; }
        public DateTime? SubscriptionExpiryDate { get; set; }
        public int MonthlyWatchedSeconds { get; set; }
        public DateTime WatchResetDate { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public string RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiry { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}


