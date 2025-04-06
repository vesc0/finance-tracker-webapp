using FinanceTracker.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FinanceTracker.API.Controllers;

[ApiController]
[Route("api/analytics")]
[Authorize] // Requires user to be authenticated
public class AnalyticsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AnalyticsController(AppDbContext context)
    {
        _context = context;
    }

    // Returns summary analytics: total income, expenses, due, net worth, and user's goal
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        // Get the logged-in user's ID from the JWT claims
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var totalIncome = await _context.Transactions
            .Where(t => t.UserId == userId && t.Type == "income" && t.Status == "completed")
            .SumAsync(t => t.Amount);

        var totalExpenses = await _context.Transactions
            .Where(t => t.UserId == userId && t.Type == "expense" && t.Status == "completed")
            .SumAsync(t => t.Amount);

        var netWorth = totalIncome - totalExpenses;

        var totalDue = await _context.Transactions
            .Where(t => t.UserId == userId && t.Type == "income" && t.Status == "awaiting")
            .SumAsync(t => t.Amount) - await _context.Transactions
            .Where(t => t.UserId == userId && t.Type == "expense" && t.Status == "awaiting")
            .SumAsync(t => t.Amount);

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        var goalAmount = user?.GoalAmount ?? 0;

        return Ok(new
        {
            TotalIncome = totalIncome,
            TotalExpenses = totalExpenses,
            TotalDue = totalDue,
            NetWorth = netWorth,
            GoalAmount = goalAmount,
        });
    }

    // Returns income and expense totals grouped by month for the last 6 months
    [HttpGet("monthly")]
    public async Task<IActionResult> GetMonthlyReport()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);

        var monthlyData = await _context.Transactions
            .Where(t => t.UserId == userId &&
                        t.Date >= sixMonthsAgo &&
                        (t.Type == "income" || t.Type == "expense") &&
                        t.Status == "completed")
            .GroupBy(t => new { t.Date.Year, t.Date.Month, t.Type })
            .Select(g => new
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                MonthName = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM"),
                Type = g.Key.Type,
                TotalAmount = g.Sum(t => t.Amount)
            })
            .OrderBy(g => g.Year).ThenBy(g => g.Month)
            .ToListAsync();

        return Ok(monthlyData);
    }

    // Returns total expense amounts grouped by category
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategoryReport()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var categoryData = await _context.Transactions
            .Where(t => t.UserId == userId && t.Type == "expense" && t.Status == "completed")
            .GroupBy(t => t.Category)
            .Select(g => new
            {
                Category = g.Key,
                TotalAmount = g.Sum(t => t.Amount)
            })
            .ToListAsync();

        return Ok(categoryData);
    }
}