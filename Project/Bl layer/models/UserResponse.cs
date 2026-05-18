<<<<<<< HEAD
﻿using System;
=======
using System;
>>>>>>> origin/Tali_Main
using Dal_layer.Models;

namespace Bl_layer.Models
{
    public class UserResponse
    {
        public Guid Id { get; set; }
        public string UserName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public Role Role { get; set; }
        public bool IsEmailVerified { get; set; }
        public bool IsSubscriber { get; set; }
        public DateTime? SubscriptionExpiryDate { get; set; }
        public int MonthlyWatchedSeconds { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
