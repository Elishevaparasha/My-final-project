namespace Bl_layer.Models
{
    public class EmailSettings
    {
        public string ApiKey { get; set; } = "";
        public string FromEmail { get; set; } = "";
        public string FromName { get; set; } = "אתר המרצה";
        /// <summary>Gmail App Password (16 chars). When set, emails are sent via Gmail SMTP to any recipient.</summary>
        public string SmtpPassword { get; set; } = "";
        public string SmtpHost { get; set; } = "smtp.gmail.com";
        public int SmtpPort { get; set; } = 587;
        public string FrontendUrl { get; set; } = "http://localhost:4200";
        public string BaseUrl { get; set; } = "http://localhost:4200";
    }
}
