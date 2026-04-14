using MassTransit;
using Microsoft.EntityFrameworkCore;
using NexTrade.Core.Interfaces;
using NexTrade.Infrastructure.Data;
using NexTrade.Infrastructure.Identity;
using NexTrade.Shared.Contracts.Rfq;

namespace NexTrade.Consumers;

public class RfqNotificationConsumer(AppDbContext db, IEmailSender email)
    : IConsumer<RfqPublishedEvent>,
      IConsumer<QuoteSubmittedEvent>,
      IConsumer<RfqAwardedEvent>
{
    public async Task Consume(ConsumeContext<RfqPublishedEvent> context)
    {
        var e = context.Message;
        if (e.TargetedSupplierUids.Count == 0) return;

        var recipients = await db.Users.IgnoreQueryFilters()
            .Where(u => e.TargetedSupplierUids.Contains(u.TenantId) && u.IsActive && u.Email != null)
            .GroupBy(u => u.TenantId)
            .Select(g => g.OrderBy(u => u.Id).First())
            .ToListAsync(context.CancellationToken);

        foreach (var user in recipients)
        {
            var subject = $"New RFQ invitation: {e.Title}";
            var body = $@"
<p>You've been invited by <strong>{e.BuyerBusinessName}</strong> to quote on:</p>
<h3>{e.Title}</h3>
<p>{e.Description}</p>
<p>Response deadline: {(e.ResponseDeadline?.ToString("yyyy-MM-dd") ?? "—")}</p>
<p><a href=""http://localhost:4000/rfqs/{e.RfqUid}"">View RFQ</a></p>";
            await email.SendAsync(user.Email!, subject, body, context.CancellationToken);
        }
    }

    public async Task Consume(ConsumeContext<QuoteSubmittedEvent> context)
    {
        var e = context.Message;
        var buyer = await FirstUserAsync(db, e.BuyerBusinessUid, context.CancellationToken);
        if (buyer?.Email is null) return;

        var subject = $"New quote on: {e.RfqTitle}";
        var body = $@"
<p><strong>{e.SupplierBusinessName}</strong> submitted a quote on your RFQ <strong>{e.RfqTitle}</strong>.</p>
<p>Total: {(e.TotalAmount.HasValue ? $"{e.CurrencyCode} {e.TotalAmount:N2}" : "—")}</p>
<p><a href=""http://localhost:4000/rfqs/{e.RfqUid}"">View quote</a></p>";
        await email.SendAsync(buyer.Email, subject, body, context.CancellationToken);
    }

    public async Task Consume(ConsumeContext<RfqAwardedEvent> context)
    {
        var e = context.Message;

        // Buyer notification (confirmation)
        var buyer = await FirstUserAsync(db, e.BuyerBusinessUid, context.CancellationToken);
        if (buyer?.Email is not null)
        {
            var body = $@"
<p>You awarded <strong>{e.WinningSupplierName}</strong> the RFQ <strong>{e.RfqTitle}</strong>.</p>
<p>Please confirm the deal so both sides have a shared record.</p>
<p><a href=""http://localhost:4000/rfqs/{e.RfqUid}"">View RFQ</a></p>";
            await email.SendAsync(buyer.Email, $"RFQ awarded: {e.RfqTitle}", body, context.CancellationToken);
        }

        // Winner notification
        var winner = await FirstUserAsync(db, e.WinningSupplierUid, context.CancellationToken);
        if (winner?.Email is not null)
        {
            var body = $@"
<p>Congratulations — you've been awarded the RFQ <strong>{e.RfqTitle}</strong>.</p>
<p>Please confirm the deal to anchor it for trust scoring.</p>
<p><a href=""http://localhost:4000/rfqs/{e.RfqUid}"">View RFQ</a></p>";
            await email.SendAsync(winner.Email, $"You won: {e.RfqTitle}", body, context.CancellationToken);
        }

        // Losers
        foreach (var loserUid in e.LosingSupplierUids)
        {
            var loser = await FirstUserAsync(db, loserUid, context.CancellationToken);
            if (loser?.Email is null) continue;
            var body = $@"
<p>The RFQ <strong>{e.RfqTitle}</strong> has been awarded to another supplier. Thanks for your quote.</p>";
            await email.SendAsync(loser.Email, $"RFQ closed: {e.RfqTitle}", body, context.CancellationToken);
        }
    }

    private static async Task<User?> FirstUserAsync(AppDbContext db, Guid tenantUid, CancellationToken ct) =>
        await db.Users.IgnoreQueryFilters()
            .Where(u => u.TenantId == tenantUid && u.IsActive && u.Email != null)
            .OrderBy(u => u.Id)
            .FirstOrDefaultAsync(ct);
}
