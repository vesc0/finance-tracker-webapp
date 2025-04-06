using FinanceTracker.Infrastructure.Persistence;
using FinanceTracker.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FinanceTracker.API.Controllers;

[ApiController]
[Route("api/transactions")]
[Authorize] // Requires user to be authenticated
public class TransactionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public TransactionsController(AppDbContext context)
    {
        _context = context;
    }

    // Add a new transaction
    [HttpPost]
    public async Task<IActionResult> AddTransaction([FromBody] Transaction transaction)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        transaction.UserId = userId;

        if (transaction.Date == default)
        {
            return BadRequest("Transaction date is required.");
        }

        if (transaction.Category.ToLower() == "add new" && !string.IsNullOrWhiteSpace(transaction.Note))
        {
            transaction.Category = char.ToUpper(transaction.Note[0]) + transaction.Note.Substring(1).ToLower();
        }

        if (transaction.Amount < 0)
        {
            return BadRequest("Transaction amount cannot be negative.");
        }

        if (transaction.Note?.Length > 100)
        {
            return BadRequest("Note must be 100 characters or less.");
        }

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        return Ok(transaction);
    }

    // Get all transactions for the authenticated user
    [HttpGet]
    public async Task<IActionResult> GetTransactions()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var transactions = await _context.Transactions
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.Status == "awaiting") // Prioritize awaiting status
            .ThenByDescending(t => t.Date) // Then sort by date descending
            .ToListAsync();

        return Ok(transactions);
    }

    // Get single transaction by ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetTransaction(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var transaction = await _context.Transactions.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (transaction == null)
            return NotFound("Transaction not found.");

        return Ok(transaction);
    }

    // Update transaction by ID
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTransaction(int id, [FromBody] Transaction updatedTransaction)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var transaction = await _context.Transactions.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (transaction == null)
            return NotFound("Transaction not found.");

        transaction.Type = updatedTransaction.Type;
        transaction.Category = updatedTransaction.Category;
        transaction.Amount = updatedTransaction.Amount;
        transaction.Method = updatedTransaction.Method;
        transaction.Status = updatedTransaction.Status;
        transaction.Note = updatedTransaction.Note;
        transaction.Date = updatedTransaction.Date;

        if (transaction.Category.ToLower() == "add new" && !string.IsNullOrWhiteSpace(transaction.Note))
        {
            transaction.Category = char.ToUpper(transaction.Note[0]) + transaction.Note.Substring(1).ToLower();
        }

        if (transaction.Amount < 0)
        {
            return BadRequest("Transaction amount cannot be negative.");
        }

        if (transaction.Note?.Length > 100)
        {
            return BadRequest("Note must be 100 characters or less.");
        }

        await _context.SaveChangesAsync();
        return Ok(transaction);
    }

    // Remove transaction by ID
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTransaction(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var transaction = await _context.Transactions.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (transaction == null)
            return NotFound("Transaction not found.");

        _context.Transactions.Remove(transaction);
        await _context.SaveChangesAsync();

        return Ok("Transaction deleted successfully.");
    }
}