using Dal_layer.Models;
using System;
using System.Collections.Generic;

namespace Dal_layer.Api
{
    public interface IContentRepository
    {
        IEnumerable<Content> GetAll();
        Content GetById(Guid id);
        void Add(Content content);
        void Delete(Guid id);
        void Update(Content content);
    }
}
