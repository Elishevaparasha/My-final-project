using Bl_layer.Api;
using Bl_layer.Models;
using Dal_layer.Api;
using Dal_layer.Models;
using System.Collections.Generic;
using System.Linq;

namespace Bl_layer.Services
{
    public class ContectServiceRepository : IContectService
    {
        private readonly IContentRepository _contentRepository;

        public ContectServiceRepository(IContentRepository contentRepository)
        {
            _contentRepository = contentRepository;
        }

        public IEnumerable<ContentResponse> GetAll()
        {
            return _contentRepository.GetAll().Select(MapToResponse);
        }

        public ContentResponse GetById(Guid id)
        {
            var content = _contentRepository.GetById(id);
            return content == null ? null : MapToResponse(content);
        }

        public IEnumerable<ContentResponse> Search(string keyword)
        {
            var words = keyword.ToLower().Split(' ');
            return _contentRepository.GetAll()
                .Where(c => words.All(w => c.Title.ToLower().Contains(w)))
                .Select(MapToResponse);
        }

        public void Add(Content content)
        {
            _contentRepository.Add(content);
        }

        public void Update(Content content)
        {
            _contentRepository.Update(content);
        }

        public void Delete(Guid id)
        {
            _contentRepository.Delete(id);
        }

        private ContentResponse MapToResponse(Content content)
        {
            var response = new ContentResponse
            {
                Id = content.Id,
                Title = content.Title,
                Description = content.Description,
                AuthorId = content.AuthorId,
                UploadDate = content.UploadDate
            };

            if (content is Video video)
            {
                response.ContentType = "Video";
                response.VideoUrl = video.VideoUrl;
                response.DurationSeconds = video.DurationSeconds;
            }
            else if (content is Article article)
            {
                response.ContentType = "Article";
                response.Body = article.Body;
                response.ThumbnailUrl = article.ThumbnailUrl;
            }

            return response;
        }
    }
}
