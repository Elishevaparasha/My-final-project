using Dal_layer.API;
using Dal_layer.Models;
using Microsoft.EntityFrameworkCore;

namespace Dal_layer.Services
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public List<User> GetAll() => _context.Users.ToList();

        public User GetById(Guid id) => _context.Users.Find(id);

        public User GetByEmail(string email)
        {
            string normalized = (email ?? "").Trim().ToLowerInvariant();
            const int maxAttempts = 3;
            for (int attempt = 1; attempt <= maxAttempts; attempt++)
            {
                try
                {
                    return _context.Users.AsNoTracking()
                        .FirstOrDefault(u => u.Email.ToLower() == normalized);
                }
                catch when (attempt < maxAttempts)
                {
                    System.Threading.Thread.Sleep(400 * attempt);
                    _context.ChangeTracker.Clear();
                }
            }

            return _context.Users.AsNoTracking()
                .FirstOrDefault(u => u.Email.ToLower() == normalized);
        }

        public User GetByVerificationToken(string token) =>
            _context.Users.FirstOrDefault(u => u.EmailVerificationToken == token);

        public void Add(User u)
        {
            _context.Users.Add(u);
            _context.SaveChanges();
        }

        public void Update(User u)
        {
            u.CreatedAt = DateTime.SpecifyKind(u.CreatedAt, DateTimeKind.Utc);
            u.WatchResetDate = DateTime.SpecifyKind(u.WatchResetDate, DateTimeKind.Utc);
            if (u.LastLoginDate.HasValue)
                u.LastLoginDate = DateTime.SpecifyKind(u.LastLoginDate.Value, DateTimeKind.Utc);
            if (u.SubscriptionExpiryDate.HasValue)
                u.SubscriptionExpiryDate = DateTime.SpecifyKind(u.SubscriptionExpiryDate.Value, DateTimeKind.Utc);
            if (u.RefreshTokenExpiry.HasValue)
                u.RefreshTokenExpiry = DateTime.SpecifyKind(u.RefreshTokenExpiry.Value, DateTimeKind.Utc);
            _context.Entry(u).State = EntityState.Modified;
            _context.SaveChanges();
        }

        public void Delete(Guid id)
        {
            var temp = _context.Users.Find(id);
            if (temp != null)
            {
                _context.Users.Remove(temp);
                _context.SaveChanges();
            }
        }
    }
}
