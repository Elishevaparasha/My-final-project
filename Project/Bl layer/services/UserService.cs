using System;
using System.Collections.Generic;
using Bl_layer.API;
using Bl_layer.Models;
using Dal_layer.Services;
using BCrypt.Net;


namespace Bl_layer.Services
{
    public class UserService : IUserService
    {
        private readonly UserRepository _repository;
        private readonly EmailService _emailService;


        public UserService()
        {
            _repository = new UserRepository();
            _emailService = new EmailService();
        }

        public UserResponse Register(RegisterRequest request)
        {
            if (_repository.GetByEmail(request.Email) != null) return null;
            Dal_layer.Models.User user = new Dal_layer.Models.User
            {
                Id = Guid.NewGuid(),
                UserName = request.UserName,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = Dal_layer.Models.Role.FreeUser,
                IsEmailVerified = false,
                IsSubscriber = false,
                MonthlyWatchedSeconds = 0,
                WatchResetDate = DateTime.Now,
                CreatedAt = DateTime.Now
            };

            _repository.Add(user);
            _emailService.SendVerificationEmail(user.Email);
            return GetById(user.Id);
        }
        public UserResponse Login(LoginRequest request)
        {
            Dal_layer.Models.User user = _repository.GetByEmail(request.Email);

            // ?????? ??????? ???? ??????? ?????
            if (user == null) return null;
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash)) return null;
            if (!user.IsEmailVerified) return null;

            // ?????? ?? ???? ???? ?????
            if (user.LastLoginDate.HasValue)
            {
                TimeSpan diff = DateTime.Now - user.LastLoginDate.Value;
                if (diff.TotalDays > 7)
                {
                    _emailService.SendLoginVerificationEmail(user.Email);
                    return null;
                }
            }
            user.LastLoginDate = DateTime.Now;
            _repository.Update(user);

            return GetById(user.Id);
        }
        public bool VerifyEmail(string token)
        {
            Dal_layer.Models.User user = _repository.GetByEmail(token);
            if (user == null) return false;
            user.IsEmailVerified = true;
            _repository.Update(user);
            return true;
        }
        public bool ForgotPassword(ForgotPasswordRequest request)
        {
            Dal_layer.Models.User user = _repository.GetByEmail(request.Email);
            if (user == null) return false;
            if (user.RefreshToken != request.ResetToken) return false;
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.RefreshToken = null;
            _repository.Update(user);
            _emailService.SendPasswordResetEmail(request.Email);
            return true;
        }
        public bool ChangePassword(ChangePasswordRequest request)
        {
            Dal_layer.Models.User user = _repository.GetByEmail(request.Email);
            if (user == null) return false;
            if (!BCrypt.Net.BCrypt.Verify(request.OldPassword, user.PasswordHash)) return false;
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            _repository.Update(user);
            return true;
        }
        public UserResponse GetById(Guid id)
        {
            Dal_layer.Models.User user = _repository.GetById(id);
            return new UserResponse
            {
                Id = user.Id,
                UserName = user.UserName,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Role = user.Role,
                IsEmailVerified = user.IsEmailVerified,
                IsSubscriber = user.IsSubscriber,
                SubscriptionExpiryDate = user.SubscriptionExpiryDate,
                MonthlyWatchedSeconds = user.MonthlyWatchedSeconds,
                LastLoginDate = user.LastLoginDate,
                CreatedAt = user.CreatedAt
            };
        }

        public List<UserResponse> GetAll()
        {
            List<Dal_layer.Models.User> users = _repository.GetAll();
            List<UserResponse> result = new List<UserResponse>();

            foreach (var user in users)
            {
                result.Add(new UserResponse
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Role = user.Role,
                    IsEmailVerified = user.IsEmailVerified,
                    IsSubscriber = user.IsSubscriber,
                    SubscriptionExpiryDate = user.SubscriptionExpiryDate,
                    MonthlyWatchedSeconds = user.MonthlyWatchedSeconds,
                    LastLoginDate = user.LastLoginDate,
                    CreatedAt = user.CreatedAt
                });
            }

            return result;
        }
        public void Delete(Guid id) {
            _repository.Delete(id);
        }

        public void UpdateSubscription(Guid id, bool isSubscriber) {
            Dal_layer.Models.User user = _repository.GetById(id);
            user.IsSubscriber = isSubscriber;
            _repository.Update(user);
        }
        public void UpdateWatchTime(Guid id, int seconds) {
            Dal_layer.Models.User user = _repository.GetById(id);
            user.MonthlyWatchedSeconds += seconds;
            _repository.Update(user);
        }
    }
}
