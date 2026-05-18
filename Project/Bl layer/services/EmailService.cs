using System;
using Bl_layer.Api;
using Bl_layer.Models;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace Bl_layer.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        private readonly SendGridClient _client;

        public EmailService(EmailSettings settings)
        {
            _settings = settings;
            _client = new SendGridClient(settings.ApiKey);
        }

        public void SendVerificationEmail(string email, string token)
        {
            string link = $"{_settings.BaseUrl.TrimEnd('/')}/api/User/verify-email/{token}";
            Send(email, "אימות כתובת מייל",
                $"שלום,\n\nלאימות החשבון לחצי על הקישור:\n{link}\n\nאם לא נרשמתם — התעלמו ממייל זה.");
        }

        public void SendPasswordResetEmail(string email)
        {
            Send(email, "הסיסמה שונתה",
                "שלום,\n\nהסיסמה של החשבון שלך שונתה בהצלחה.\nאם לא ביצעתם שינוי — פנו למנהל האתר.");
        }

        public void SendLoginVerificationEmail(string email)
        {
            Send(email, "אימות התחברות",
                "שלום,\n\nזוהתה ניסיון התחברות לאחר תקופה ארוכה ללא כניסה.\n" +
                "אם זה אתם — התחברו שוב מהאתר. אם לא — התעלמו ממייל זה.");
        }

        private void Send(string toEmail, string subject, string bodyText)
        {
            var message = MailHelper.CreateSingleEmail(
                new EmailAddress(_settings.FromEmail, _settings.FromName),
                new EmailAddress(toEmail),
                subject,
                bodyText,
                null);

            var response = _client.SendEmailAsync(message).GetAwaiter().GetResult();
            if (!response.IsSuccessStatusCode)
            {
                string error = response.Body.ReadAsStringAsync().GetAwaiter().GetResult();
                throw new InvalidOperationException($"SendGrid failed: {response.StatusCode} — {error}");
            }
        }
    }
}
