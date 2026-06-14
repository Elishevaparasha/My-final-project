using Dal_layer.Api;
using Dal_layer.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Dal_layer.Services
{
    public class CommentRepository : ICommentRepository
    {
        private readonly AppDbContext _context;

        public CommentRepository(AppDbContext context)
        {
            _context = context;
        }

        public IEnumerable<Comment> GetByContentId(Guid contentId)
        {
            return _context.Comments
                .Where(c => c.ContentId == contentId)
                .OrderBy(c => c.CreatedAt)
                .ToList();
        }

        public Comment Add(Comment comment)
        {
            comment.Id = Guid.NewGuid();
            comment.CreatedAt = DateTime.UtcNow;
            _context.Comments.Add(comment);
            _context.SaveChanges();
            return comment;
        }

        public void Delete(Guid id)
        {
            var comment = _context.Comments.Find(id);
            if (comment != null)
            {
                // Delete replies first
                var replies = _context.Comments.Where(c => c.ParentId == id);
                _context.Comments.RemoveRange(replies);
                _context.Comments.Remove(comment);
                _context.SaveChanges();
            }
        }
    }
}