using Bl_layer.Api;
using Bl_layer.Models;
using Bl_layer.Services;
using Dal_layer.Api;
using Dal_layer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Web_Application.Api;
using Web_Application.Models;

namespace Web_Application.Services
{
    public class ContentControllerService : IContentController
    {
        private readonly IContectService _contentService;
        private readonly ICommentRepository _commentRepository;
        private readonly ITranslationService _translationService;

        public ContentControllerService(
            IContectService contentService,
            ICommentRepository commentRepository,
            ITranslationService translationService)
        {
            _contentService = contentService;
            _commentRepository = commentRepository;
            _translationService = translationService;
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

        public string Translate(string text, string targetLang)
        {
            var result = _translationService.TranslateAsync(text, targetLang).Result;
            return result;
        }

        public IEnumerable<Models.CommentResponse> GetComments(Guid contentId)
        {
            return _commentRepository.GetByContentId(contentId).Select(MapCommentToResponse);
        }

        public Models.CommentResponse AddComment(Guid contentId, Models.AddCommentRequest request)
        {
            var comment = new Comment
            {
                ContentId = contentId,
                Text = request.Text,
                ParentId = request.ParentId,
                AuthorName = "User", // In production, get from auth
                AuthorId = null
            };

            var added = _commentRepository.Add(comment);
            return MapCommentToResponse(added);
        }

        public void DeleteComment(Guid contentId, Guid commentId)
        {
            _commentRepository.Delete(commentId);
        }

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

        private Models.CommentResponse MapCommentToResponse(Comment comment)
        {
            return new Models.CommentResponse
            {
                Id = comment.Id,
                ContentId = comment.ContentId,
                ParentId = comment.ParentId,
                AuthorName = comment.AuthorName,
                Text = comment.Text,
                CreatedAt = comment.CreatedAt
            };
        }
    }
}