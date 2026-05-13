using Bl_layer.Models;

namespace Web_Application.Models
{
    public class LoginResponse
    {
        public UserResponse User { get; set; }
        public string Token { get; set; }
    }
}
