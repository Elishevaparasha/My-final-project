using Dal_layer.API;
using Dal_layer.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

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

        public User GetByEmail(string email) => _context.Users.FirstOrDefault(u => u.Email == email);

        public void Add(User u)
        {
            _context.Users.Add(u);
            _context.SaveChanges();
        }

        public void Update(User u)
        {
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
