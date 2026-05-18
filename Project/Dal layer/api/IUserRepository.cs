using Dal_layer.Models;
using System;
using System.Collections.Generic;

namespace Dal_layer.API
{
    public interface IUserRepository
    {
        List<User> GetAll();
        User GetById(Guid id);
        User GetByEmail(string email);
        User GetByVerificationToken(string token);
        void Add(User u);
        void Update(User u);
        void Delete(Guid id);
    }
}
