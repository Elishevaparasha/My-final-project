namespace Dal_layer.Models
{
    public class Video : Content
    {
        public string VideoUrl { get; set; }
        public int DurationSeconds { get; set; }
    }
}
