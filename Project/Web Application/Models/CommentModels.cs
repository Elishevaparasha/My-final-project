using System;

namespace Web_Application.Models
{
    public class CommentResponse
    {
        public Guid Id { get; set; }
        public Guid ContentId { get; set; }
        public Guid? ParentId { get; set; }
        public string AuthorName { get; set; }
        public string Text { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AddCommentRequest
    {
        public string Text { get; set; }
        public Guid? ParentId { get; set; }
    }

    public class TranslateRequest
    {
        public string Text { get; set; }
        public string TargetLang { get; set; }
    }
}