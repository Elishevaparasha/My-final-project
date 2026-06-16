namespace Web_Application.Models
{
    public class ContentRequest
    {

        public string Title { get; set; }
        public string Description { get; set; }
        public string ContentType { get; set; } // "Video" or "Article"

        // Video-specific
        public string? VideoUrl { get; set; }
        public int? DurationSeconds { get; set; }

        // Article-specific
        public string? Body { get; set; }
        public string? ThumbnailUrl { get; set; }
    }
}
