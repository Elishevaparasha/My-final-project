using Microsoft.AspNetCore.Mvc;
using Bl_layer.Services;
using Bl_layer.Models;
using Web_Application.Models;
using Microsoft.AspNetCore.Authorization;
using System;

namespace Web_Application.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly UserService _userService;

        public UserController(UserService userService)
        {
            _userService = userService;
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest request)
        {
            UserResponse result = _userService.Register(request);
            if (result == null) return BadRequest("המייל כבר קיים במערכת");
            return Ok(result);
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            string token = _userService.Login(request);
            if (token == null) return BadRequest("מייל או סיסמה שגויים");
            UserResponse user = _userService.GetByEmail(request.Email);
            return Ok(new LoginResponse { Token = token, User = user });
        }

        [HttpGet("verify-email/{token}")]
        public IActionResult VerifyEmail(string token)
        {
            bool result = _userService.VerifyEmail(token);
            if (!result) return BadRequest("הקישור אינו תקין או פג תוקף");
            return Ok("המייל אומת בהצלחה");
        }

        [HttpPost("forgot-password")]
        public IActionResult ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            bool result = _userService.ForgotPassword(request);
            if (!result) return BadRequest("הפרטים שהוזנו שגויים");
            return Ok("הסיסמה שונתה בהצלחה");
        }
        [Authorize]
        [HttpPost("change-password")]
        public IActionResult ChangePassword([FromBody] ChangePasswordRequest request)
        {
            bool result = _userService.ChangePassword(request);
            if (!result) return BadRequest("הסיסמה הישנה שגויה");
            return Ok("הסיסמה שונתה בהצלחה");
        }
        [Authorize]
        [HttpGet("{id}")]
        public IActionResult GetById(Guid id)
        {
            UserResponse result = _userService.GetById(id);
            if (result == null) return NotFound("המשתמש לא נמצא");
            return Ok(result);
        }
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(_userService.GetAll());
        }
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public IActionResult Delete(Guid id)
        {
            _userService.Delete(id);
            return Ok("המשתמש נמחק בהצלחה");
        }
        [Authorize(Roles = "Admin")]
        [HttpPut("subscription/{id}")]
        public IActionResult UpdateSubscription(Guid id, [FromBody] bool isSubscriber)
        {
            _userService.UpdateSubscription(id, isSubscriber);
            return Ok("המנוי עודכן בהצלחה");
        }
        [Authorize]
        [HttpPut("watch-time/{id}")]
        public IActionResult UpdateWatchTime(Guid id, [FromBody] int seconds)
        {
            _userService.UpdateWatchTime(id, seconds);
            return Ok();
        }
    }
}
