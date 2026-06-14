using Dal_layer.Models;
using System;
using System.Collections.Generic;

namespace Dal_layer.Api
{
    public interface ICommentRepository
    {
        IEnumerable<Comment> GetByContentId(Guid contentId);
        Comment Add(Comment comment);
        void Delete(Guid id);
    }
}