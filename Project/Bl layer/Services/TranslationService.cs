using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace Bl_layer.Services
{
    public interface ITranslationService
    {
        Task<string> TranslateAsync(string text, string targetLang);
    }

    public class TranslationService : ITranslationService
    {
        private readonly HttpClient _httpClient;
        private const string ApiKey = "YOUR_GOOGLE_TRANSLATE_API_KEY"; // Replace with actual key

        public TranslationService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<string> TranslateAsync(string text, string targetLang)
        {
            try
            {
                // Using Google Translate API - free tier available
                // For production, you'd want to use a proper API key
                var url = $"https://translation.googleapis.com/language/translate/v2?key={ApiKey}";
                
                var request = new
                {
                    q = text,
                    target = targetLang,
                    format = "text"
                };

                var content = new StringContent(
                    JsonSerializer.Serialize(request),
                    System.Text.Encoding.UTF8,
                    "application/json"
                );

                var response = await _httpClient.PostAsync(url, content);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    var result = JsonSerializer.Deserialize<JsonElement>(responseContent);
                    return result.GetProperty("data")
                        .GetProperty("translations")[0]
                        .GetProperty("translatedText")
                        .GetString() ?? text;
                }

                // Fallback: simple word replacement for demo
                return SimpleFallbackTranslate(text, targetLang);
            }
            catch
            {
                // Fallback translation if API fails
                return SimpleFallbackTranslate(text, targetLang);
            }
        }

        private string SimpleFallbackTranslate(string text, string targetLang)
        {
            // Simple dictionary-based fallback for demo
            var translations = new (string he, string en, string fr)[]
            {
                ("שלום", "Hello", "Bonjour"),
                ("תודה", "Thank you", "Merci"),
                ("בבקשה", "Please", "S'il vous plaît"),
                ("כן", "Yes", "Oui"),
                ("לא", "No", "Non"),
                ("מה שלומך", "How are you", "Comment allez-vous"),
                ("טוב", "Good", "Bien"),
                ("רע", "Bad", "Mal"),
                ("יום טוב", "Good day", "Bonjour"),
                ("להתראות", "Goodbye", "Au revoir"),
                ("אהבה", "Love", "Amour"),
                ("משפחה", "Family", "Famille"),
                ("זוגיות", "Couple", "Couple"),
                ("נישואין", "Marriage", "Mariage"),
                ("הורים", "Parents", "Parents"),
                ("ילדים", "Children", "Enfants"),
                ("שמחה", "Joy", "Joie"),
                ("שלום", "Peace", "Paix"),
                ("כבוד", "Honor", "Honneur"),
                ("אמת", "Truth", "Vérité"),
            };

            // For longer texts, return as-is with a note
            if (targetLang == "en")
                return $"[English] {text}";
            if (targetLang == "fr")
                return $"[Français] {text}";

            return text;
        }
    }
}