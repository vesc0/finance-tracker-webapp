namespace FinanceTracker.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public decimal GoalAmount { get; set; } = 0.00m;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}