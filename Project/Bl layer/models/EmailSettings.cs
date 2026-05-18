namespace Bl_layer.Models
{
    public class EmailSettings
    {
        public string ApiKey { get; set; } = "";
        public string FromEmail { get; set; } = "";
        public string FromName { get; set; } = "אתר המרצה";
        public string BaseUrl { get; set; } = "https://localhost:7245";
    }
}
