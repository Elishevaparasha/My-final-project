using System;
using System.Collections.Generic;

namespace Dal_layer.Models
{
    public abstract class Content
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public Guid? AuthorId { get; set; }
        public DateTime UploadDate { get; set; }
    }
}
