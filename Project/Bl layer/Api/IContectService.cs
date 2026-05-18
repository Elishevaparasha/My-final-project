using Bl_layer.Models;
using Dal_layer.Models;
using System.Collections.Generic;

namespace Bl_layer.Api
{
    public interface IContectService
    {
        IEnumerable<ContentResponse> GetAll();
        ContentResponse GetById(Guid id);
        IEnumerable<ContentResponse> Search(string keyword);
        void Add(Content content);
        void Update(Content content);
        void Delete(Guid id);
    }
}
