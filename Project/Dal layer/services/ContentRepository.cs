using Dal_layer.Api;
using Dal_layer.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;

namespace Dal_layer.Services
{
    public class ContentRepository : IContentRepository
    {
        private readonly AppDbContext _context;

        public ContentRepository(AppDbContext context)
        {
            _context = context;
        }

        public IEnumerable<Content> GetAll() => _context.Contents.ToList();

        public Content GetById(Guid id) => _context.Contents.Find(id);

        public void Add(Content content)
        {
            _context.Contents.Add(content);
            _context.SaveChanges();
        }

        public void Delete(Guid id)
        {
            var item = GetById(id);
            if (item != null)
            {
                _context.Contents.Remove(item);
                _context.SaveChanges();
            }
        }

        public void Update(Content content)
        {
            _context.Entry(content).State = EntityState.Modified;
            _context.SaveChanges();
        }
    }
}
