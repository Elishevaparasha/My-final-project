using Bl_layer.Api;
using Bl_layer.Models;
using Bl_layer.Services;
using Dal_layer;
using Dal_layer.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// חיבור ל-DB
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// הגדרת JWT Authentication
var jwtKey = builder.Configuration["JwtSecretKey"];
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

builder.Services.AddAuthorization();

// הגדרות מייל (SendGrid / Twilio)
var emailSettings = new EmailSettings();
builder.Configuration.GetSection("Email").Bind(emailSettings);
builder.Services.AddSingleton(emailSettings);
builder.Services.AddSingleton<IEmailService, EmailService>();

// רישום השירותים
builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<UserService>(provider =>
{
    var context = provider.GetRequiredService<AppDbContext>();
    var emailService = provider.GetRequiredService<IEmailService>();
    return new UserService(context, jwtKey, emailService);
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
