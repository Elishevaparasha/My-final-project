using System;
using System.Collections.Generic;
using Bl_layer.Models;

namespace Bl_layer.API
{
    public interface IUserService
    {
        UserResponse Register(RegisterRequest request);
        UserResponse Login(LoginRequest request);
        bool VerifyEmail(string token);
        bool ForgotPassword(ForgotPasswordRequest request);
        bool ChangePassword(ChangePasswordRequest request);
        UserResponse GetById(Guid id);
        List<UserResponse> GetAll();
        void Delete(Guid id);
        void UpdateSubscription(Guid id, bool isSubscriber);
        void UpdateWatchTime(Guid id, int seconds);
    }
}
