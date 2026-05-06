using System;
using System.Collections.Generic;

namespace Dal_layer.Models
{
    public abstract class Content
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string AuthorId { get; set; }
        public DateTime UploadDate { get; set; }
        public string IsPremium { get; set; }

        public int LikeCounts { get; set; }
    }
}
