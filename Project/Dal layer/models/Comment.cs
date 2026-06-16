using System;

namespace Dal_layer.Models
{
    public class Comment
    {
        public Guid Id { get; set; }
        public Guid ContentId { get; set; }
        public Guid? ParentId { get; set; }
        public string AuthorName { get; set; }
        public Guid? AuthorId { get; set; }
        public string Text { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}