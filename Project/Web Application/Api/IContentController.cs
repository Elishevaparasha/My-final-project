using Bl_layer.Models;
using System;
using System.Collections.Generic;
using Web_Application.Models;

namespace Web_Application.Api
{
    public interface IContentController
    {
        IEnumerable<ContentResponse> GetAll();
        ContentResponse GetById(Guid id);
        IEnumerable<ContentResponse> Search(string keyword);
        void Add(ContentRequest request);
        void Update(Guid id, ContentRequest request);
        void Delete(Guid id);
        string Translate(string text, string targetLang);
        IEnumerable<Models.CommentResponse> GetComments(Guid contentId);
        Models.CommentResponse AddComment(Guid contentId, Models.AddCommentRequest request);
        void DeleteComment(Guid contentId, Guid commentId);
    }
}
