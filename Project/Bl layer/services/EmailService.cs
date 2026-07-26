using System;
using System.IO;
using Bl_layer.Api;
using Bl_layer.Models;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace Bl_layer.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        private readonly SendGridClient? _sendGrid;

        public EmailService(EmailSettings settings)
        {
            _settings = settings;
            _sendGrid = IsValidApiKey(settings.ApiKey) ? new SendGridClient(settings.ApiKey) : null;
        }

        public bool CanSendRealEmail =>
            HasSmtp() || (IsValidApiKey(_settings.ApiKey) && IsValidFromEmail(_settings.FromEmail));

        public void SendVerificationEmail(string email, string token)
        {
            string frontend = GetFrontendBaseUrl();
            string link = $"{frontend}/verify-email/{token}";
            Send(email, "אימות כתובת מייל",
                $"שלום,\n\nלאימות החשבון לחצי על הקישור:\n{link}\n\nאם לא נרשמתם — התעלמו ממייל זה.");
        }

        public void SendPasswordResetCodeEmail(string email, string code)
        {
            Send(email, "קוד לאיפוס סיסמה",
                $"שלום,\n\nקוד האיפוס שלך הוא:\n\n{code}\n\n" +
                "הזיני את הקוד באתר יחד עם סיסמה חדשה.\n" +
                "הקוד תקף ל-30 דקות.\nאם לא ביקשתם לאפס סיסמה — התעלמו ממייל זה.");
        }

        public void SendPasswordResetEmail(string email)
        {
            Send(email, "הסיסמה שונתה",
                "שלום,\n\nהסיסמה של החשבון שלך שונתה בהצלחה.\nאם לא ביצעתם שינוי — פנו למנהל האתר.");
        }

        public void SendLoginVerificationEmail(string email)
        {
            Send(email, "התראת התחברות",
                "שלום,\n\nזוהתה התחברות לחשבון שלך לאחר תקופה ארוכה ללא כניסה.\n" +
                "אם זה לא אתם — שנו מיד את הסיסמה ופנו למנהל האתר.");
        }

        private string GetFrontendBaseUrl()
        {
            string url = !string.IsNullOrWhiteSpace(_settings.FrontendUrl)
                ? _settings.FrontendUrl
                : _settings.BaseUrl;
            return (url ?? "http://localhost:4200").TrimEnd('/');
        }

        private bool HasSmtp() =>
            IsValidFromEmail(_settings.FromEmail)
            && !string.IsNullOrWhiteSpace(_settings.SmtpPassword)
            && !_settings.SmtpPassword.Contains("REPLACE", StringComparison.OrdinalIgnoreCase);

        private static bool IsValidApiKey(string? key)
        {
            key = key?.Trim() ?? "";
            if (string.IsNullOrWhiteSpace(key)) return false;
            if (key.Contains("placeholder", StringComparison.OrdinalIgnoreCase)) return false;
            if (key.Contains("REPLACE_WITH", StringComparison.OrdinalIgnoreCase)) return false;
            if (key.StartsWith("<", StringComparison.Ordinal)) return false;
            return key.StartsWith("SG.", StringComparison.Ordinal);
        }

        private static bool IsValidFromEmail(string? email)
        {
            email = email?.Trim() ?? "";
            if (string.IsNullOrWhiteSpace(email)) return false;
            if (email.Contains("example.com", StringComparison.OrdinalIgnoreCase)) return false;
            if (email.Contains("REPLACE_WITH", StringComparison.OrdinalIgnoreCase)) return false;
            if (email.StartsWith("<", StringComparison.Ordinal)) return false;
            return email.Contains('@');
        }

        private void Send(string toEmail, string subject, string bodyText)
        {
            toEmail = (toEmail ?? "").Trim();
            if (string.IsNullOrWhiteSpace(toEmail) || !toEmail.Contains('@'))
                throw new InvalidOperationException("כתובת נמען לא תקינה");

            Console.WriteLine($"==== EMAIL SEND ====");
            Console.WriteLine($"From: {_settings.FromEmail}");
            Console.WriteLine($"To:   {toEmail}");
            Console.WriteLine($"Subject: {subject}");

            // Prefer Gmail SMTP — works for ANY recipient. SendGrid+Gmail From often only delivers to yourself.
            if (HasSmtp())
            {
                SendViaSmtp(toEmail, subject, bodyText);
                Console.WriteLine($"OK (SMTP) → {toEmail}");
                Console.WriteLine("====================");
                return;
            }

            if (_sendGrid != null && IsValidFromEmail(_settings.FromEmail))
            {
                try
                {
                    var message = MailHelper.CreateSingleEmail(
                        new EmailAddress(_settings.FromEmail, _settings.FromName),
                        new EmailAddress(toEmail),
                        subject,
                        bodyText,
                        null);

                    var response = _sendGrid.SendEmailAsync(message).GetAwaiter().GetResult();
                    if (response.IsSuccessStatusCode)
                    {
                        Console.WriteLine($"OK (SendGrid) → {toEmail}");
                        Console.WriteLine("====================");
                        return;
                    }

                    string error = response.Body.ReadAsStringAsync().GetAwaiter().GetResult();
                    WriteFallbackEmail(toEmail, subject, bodyText, $"SendGrid {response.StatusCode}: {error}");
                    throw new InvalidOperationException($"שליחת המייל ל-{toEmail} נכשלה: {response.StatusCode}");
                }
                catch (InvalidOperationException)
                {
                    throw;
                }
                catch (Exception ex)
                {
                    WriteFallbackEmail(toEmail, subject, bodyText, ex.Message);
                    throw;
                }
            }

            WriteFallbackEmail(toEmail, subject, bodyText, "No SMTP/SendGrid configured");
            throw new InvalidOperationException(
                "שליחת מייל לא מוגדרת. הוסיפי Email:SmtpPassword (סיסמת אפליקציה של Gmail) ב-appsettings.json");
        }

        private void SendViaSmtp(string toEmail, string subject, string bodyText)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_settings.FromName, _settings.FromEmail));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;
            message.Body = new TextPart("plain") { Text = bodyText };

            using var client = new SmtpClient();
            client.Connect(_settings.SmtpHost, _settings.SmtpPort, SecureSocketOptions.StartTls);
            client.Authenticate(_settings.FromEmail, _settings.SmtpPassword);
            client.Send(message);
            client.Disconnect(true);
        }

        private void WriteFallbackEmail(string toEmail, string subject, string bodyText, string reason)
        {
            string dir = Path.Combine(AppContext.BaseDirectory, "email-outbox");
            Directory.CreateDirectory(dir);
            string file = Path.Combine(dir, $"{DateTime.UtcNow:yyyyMMdd_HHmmss_fff}_{Guid.NewGuid():N}.txt");
            string content =
                $"To: {toEmail}\nFrom: {_settings.FromEmail}\nSubject: {subject}\nReason: {reason}\nSentAtUtc: {DateTime.UtcNow:o}\n\n{bodyText}\n";
            File.WriteAllText(file, content);

            Console.WriteLine($"FALLBACK Reason: {reason}");
            Console.WriteLine(bodyText);
            Console.WriteLine($"Saved to: {file}");
            Console.WriteLine("====================");
        }
    }
}
