using System;

namespace Bl_layer.Models
{
    public class ContentResponse
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public Guid? AuthorId { get; set; }
        public DateTime UploadDate { get; set; }
        public string ContentType { get; set; }

        // Video-specific
        public string VideoUrl { get; set; }
        public int? DurationSeconds { get; set; }

        // Article-specific
        public string Body { get; set; }
        public string ThumbnailUrl { get; set; }
    }
}
