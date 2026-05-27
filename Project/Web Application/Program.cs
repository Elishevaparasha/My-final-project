using Bl_layer.Api;
using Bl_layer.Models;
using Bl_layer.Services;
using Dal_layer;
using Dal_layer.Api;
using Dal_layer.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Web_Application.Api;
using Web_Application.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

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

var emailSettings = new EmailSettings();
builder.Configuration.GetSection("Email").Bind(emailSettings);
builder.Services.AddSingleton(emailSettings);
builder.Services.AddSingleton<IEmailService, EmailService>();

builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<UserService>(provider =>
{
    var context = provider.GetRequiredService<AppDbContext>();
    var emailService = provider.GetRequiredService<IEmailService>();
    return new UserService(context, jwtKey, emailService);
});

builder.Services.AddScoped<IContentRepository, ContentRepository>();
builder.Services.AddScoped<IContectService, ContectServiceRepository>();
builder.Services.AddScoped<IContentController, ContentControllerService>();

// הגדרת ה-CORS המעודכנת שכוללת את הפורט הנוכחי שלך (4300)
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins("http://localhost:4200", "http://localhost:50455", "http://localhost:4300")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();