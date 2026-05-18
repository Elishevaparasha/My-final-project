using Bl_layer.Api;
using Bl_layer.Models;
using Dal_layer.Models;
using System;
using System.Collections.Generic;
using Web_Application.Api;
using Web_Application.Models;

namespace Web_Application.Services
{
    public class ContentControllerService : IContentController
    {
        private readonly IContectService _contentService;

        public ContentControllerService(IContectService contentService)
        {
            _contentService = contentService;
        }

        public IEnumerable<ContentResponse> GetAll() => _contentService.GetAll();

        public ContentResponse GetById(Guid id) => _contentService.GetById(id);

        public IEnumerable<ContentResponse> Search(string keyword) => _contentService.Search(keyword);

        public void Add(ContentRequest request) => _contentService.Add(MapToContent(request));

        public void Update(Guid id, ContentRequest request)
        {
            var content = MapToContent(request);
            content.Id = id;
            _contentService.Update(content);
        }

        public void Delete(Guid id) => _contentService.Delete(id);

        private Content MapToContent(ContentRequest request)
        {
            if (request.ContentType == "Video")
                return new Video
                {
                    Id = Guid.NewGuid(),
                    Title = request.Title,
                    Description = request.Description,
                    UploadDate = DateTime.UtcNow,
                    VideoUrl = request.VideoUrl,
                    DurationSeconds = request.DurationSeconds ?? 0
                };

            return new Article
            {
                Id = Guid.NewGuid(),
                Title = request.Title,
                Description = request.Description,
                UploadDate = DateTime.UtcNow,
                Body = request.Body,
                ThumbnailUrl = request.ThumbnailUrl
            };
        }
    }
}
