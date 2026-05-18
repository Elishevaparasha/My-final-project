using Microsoft.EntityFrameworkCore;
using Dal_layer.Models;

namespace Dal_layer
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Content> Contents { get; set; }
        public DbSet<Video> Videos { get; set; }
        public DbSet<Article> Articles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().ToTable("Users").Property(u => u.Id).HasColumnName("id");
            modelBuilder.Entity<User>().Property(u => u.UserName).HasColumnName("user_name");
            modelBuilder.Entity<User>().Property(u => u.FirstName).HasColumnName("first_name");
            modelBuilder.Entity<User>().Property(u => u.LastName).HasColumnName("last_name");
            modelBuilder.Entity<User>().Property(u => u.Email).HasColumnName("email");
            modelBuilder.Entity<User>().Property(u => u.PasswordHash).HasColumnName("password_hash");
            modelBuilder.Entity<User>().Property(u => u.Role).HasColumnName("role");
            modelBuilder.Entity<User>().Property(u => u.IsEmailVerified).HasColumnName("is_email_verified");
            modelBuilder.Entity<User>().Property(u => u.IsSubscriber).HasColumnName("is_subscriber");
            modelBuilder.Entity<User>().Property(u => u.SubscriptionExpiryDate).HasColumnName("subscription_expiry_date");
            modelBuilder.Entity<User>().Property(u => u.MonthlyWatchedSeconds).HasColumnName("monthly_watched_seconds");
            modelBuilder.Entity<User>().Property(u => u.WatchResetDate).HasColumnName("watch_reset_date");
            modelBuilder.Entity<User>().Property(u => u.LastLoginDate).HasColumnName("last_login_date");
            modelBuilder.Entity<User>().Property(u => u.RefreshToken).HasColumnName("refresh_token");
            modelBuilder.Entity<User>().Property(u => u.RefreshTokenExpiry).HasColumnName("refresh_token_expiry");
            modelBuilder.Entity<User>().Property(u => u.EmailVerificationToken).HasColumnName("email_verification_token");
            modelBuilder.Entity<User>().Property(u => u.CreatedAt).HasColumnName("created_at");

<<<<<<< HEAD
            modelBuilder.Entity<Video>().ToTable("videos");
            modelBuilder.Entity<Article>().ToTable("articles");
=======
            modelBuilder.Entity<Content>().ToTable("contents");
            modelBuilder.Entity<Content>().Property(c => c.Id).HasColumnName("id");
            modelBuilder.Entity<Content>().Property(c => c.Title).HasColumnName("title");
            modelBuilder.Entity<Content>().Property(c => c.Description).HasColumnName("description");
            modelBuilder.Entity<Content>().Property(c => c.AuthorId).HasColumnName("author_id");
            modelBuilder.Entity<Content>().Property(c => c.UploadDate).HasColumnName("created_at");

            modelBuilder.Entity<Video>().ToTable("videos");
            modelBuilder.Entity<Video>().Property(v => v.VideoUrl).HasColumnName("video_url");
            modelBuilder.Entity<Video>().Property(v => v.DurationSeconds).HasColumnName("duration_seconds");

            modelBuilder.Entity<Article>().ToTable("articles");
            modelBuilder.Entity<Article>().Property(a => a.ThumbnailUrl).HasColumnName("thumbnail_url");
            modelBuilder.Entity<Article>().Property(a => a.Body).HasColumnName("body");
>>>>>>> origin/Tali_Main
        }
    }
}
