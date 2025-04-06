using Microsoft.AspNetCore.Mvc;
using FinanceTracker.Infrastructure.Persistence;
using FinanceTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace FinanceTracker.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] User user)
    {
        if (user == null || string.IsNullOrWhiteSpace(user.Email) || string.IsNullOrWhiteSpace(user.PasswordHash))
            return BadRequest(new { message = "Invalid user data." });

        if (await _context.Users.AnyAsync(u => u.Email == user.Email))
            return BadRequest(new { message = "User already exists." });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "User registered successfully." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] User loginUser)
    {
        if (loginUser == null || string.IsNullOrWhiteSpace(loginUser.Email) || string.IsNullOrWhiteSpace(loginUser.PasswordHash))
            return BadRequest(new { message = "Invalid login data." });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginUser.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(loginUser.PasswordHash, user.PasswordHash))
            return Unauthorized(new { message = "Invalid credentials." });

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"] ?? throw new InvalidOperationException("JWT secret key is missing"));

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()) }),
            Expires = DateTime.UtcNow.AddHours(1),
            Issuer = _configuration["JwtSettings:Issuer"],
            Audience = _configuration["JwtSettings:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        // Store the token in an HttpOnly cookie.
        Response.Cookies.Append("jwtToken", tokenString, new CookieOptions
        {
            HttpOnly = true,
            Secure = false, // set to true if using HTTPS in production
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddHours(1)
        });

        return Ok(new { Token = tokenString, message = "Login successful." });
    }

    [HttpPut("update")]
    public async Task<IActionResult> UpdateProfile([FromBody] User updatedUser)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { message = "User not authenticated." });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id.ToString() == userId);
        if (user == null)
            return NotFound(new { message = "User not found." });

        // Check if the new email is already in use by another user
        if (!string.IsNullOrWhiteSpace(updatedUser.Email) && updatedUser.Email != user.Email)
        {
            var emailExists = await _context.Users.AnyAsync(u => u.Email == updatedUser.Email && u.Id.ToString() != userId);
            if (emailExists)
            {
                return BadRequest(new { message = "Email is already in use." });
            }
            user.Email = updatedUser.Email;
        }

        user.Name = updatedUser.Name ?? user.Name;

        if (!string.IsNullOrWhiteSpace(updatedUser.PasswordHash))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(updatedUser.PasswordHash);
        }

        if (updatedUser.GoalAmount > 0)
        {
            user.GoalAmount = updatedUser.GoalAmount;
        }

        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Profile updated successfully." });
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { message = "User not authenticated." });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id.ToString() == userId);
        if (user == null)
            return NotFound(new { message = "User not found." });

        return Ok(new
        {
            user.Name,
            user.Email,
            user.GoalAmount
        });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        // Remove the JWT token cookie.
        Response.Cookies.Append("jwtToken", "", new CookieOptions
        {
            HttpOnly = true,
            Secure = false, // Set to true if using HTTPS in production
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddDays(-1) // Expire the cookie
        });

        return Ok(new { message = "Logout successful." });
    }
}