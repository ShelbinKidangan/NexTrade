using Microsoft.EntityFrameworkCore;
using NexTrade.Core.Entities;
using NexTrade.Core.Enums;
using NexTrade.Core.Interfaces;
using NexTrade.Infrastructure.Data;
using NexTrade.Shared;

namespace NexTrade.Infrastructure.Services;

public class ConversationService(AppDbContext db, IUnitOfWork uow, ITenantContext tenant)
{
    public record ConversationDto(
        Guid Uid, string Context, Guid? ContextRefUid, string? ContextRefTitle,
        List<ConversationParticipantDto> Participants,
        MessageDto? LastMessage, int UnreadCount, DateTime CreatedAt, DateTime UpdatedAt);

    public record ConversationParticipantDto(Guid BusinessUid, string BusinessName, bool IsVerified);

    public record MessageDto(
        long Id, Guid ConversationUid, long SenderUserId, Guid SenderBusinessUid,
        string SenderBusinessName, string Content, List<string> Attachments,
        DateTime? ReadAt, DateTime CreatedAt);

    public record SendMessageRequest(string Content, List<string>? Attachments);

    public record FindOrCreateRequest(Guid CounterpartyBusinessUid, ConversationContext Context, Guid? ContextRefUid);

    public record ReadUpToRequest(long MessageId);

    public record ConversationFilter(int Page = 1, int PageSize = 20, ConversationContext? Context = null);

    public record MessageFilter(int Page = 1, int PageSize = 50);

    // --- list convos for current tenant ---
    public async Task<PagedResult<ConversationDto>> ListAsync(ConversationFilter filter, CancellationToken ct)
    {
        var query = db.Conversations
            .IgnoreQueryFilters()
            .Where(c => c.ParticipantBusinessUids.Contains(tenant.TenantId));

        if (filter.Context is not null)
            query = query.Where(c => c.ContextType == filter.Context);

        query = query.OrderByDescending(c => c.UpdatedAt);

        var totalCount = await query.CountAsync(ct);
        var convos = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync(ct);

        var dtos = await MapManyAsync(convos, ct);
        return new PagedResult<ConversationDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    // --- single conversation ---
    public async Task<ServiceResult<ConversationDto>> GetAsync(Guid uid, CancellationToken ct)
    {
        var convo = await db.Conversations.IgnoreQueryFilters()
            .FirstOrDefaultAsync(c => c.Uid == uid, ct);
        if (convo is null)
            return ServiceResult<ConversationDto>.Fail("Conversation not found.", 404);
        if (!convo.ParticipantBusinessUids.Contains(tenant.TenantId))
            return ServiceResult<ConversationDto>.Fail("Not a participant.", 403);

        return ServiceResult<ConversationDto>.Ok((await MapManyAsync([convo], ct)).First());
    }

    // --- messages in a conversation ---
    public async Task<ServiceResult<PagedResult<MessageDto>>> GetMessagesAsync(
        Guid uid, MessageFilter filter, CancellationToken ct)
    {
        var convo = await db.Conversations.IgnoreQueryFilters()
            .FirstOrDefaultAsync(c => c.Uid == uid, ct);
        if (convo is null)
            return ServiceResult<PagedResult<MessageDto>>.Fail("Conversation not found.", 404);
        if (!convo.ParticipantBusinessUids.Contains(tenant.TenantId))
            return ServiceResult<PagedResult<MessageDto>>.Fail("Not a participant.", 403);

        var query = db.Messages
            .Where(m => m.ConversationId == convo.Id && m.DeletedAt == null)
            .OrderByDescending(m => m.CreatedAt);

        var totalCount = await query.CountAsync(ct);
        var messages = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync(ct);

        var senders = await GetBusinessNamesAsync(messages.Select(m => m.SenderBusinessUid), ct);

        return ServiceResult<PagedResult<MessageDto>>.Ok(new PagedResult<MessageDto>
        {
            Items = messages.Select(m => ToMessageDto(m, convo.Uid, senders)).ToList(),
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize,
        });
    }

    // --- send a message ---
    public async Task<ServiceResult<MessageDto>> SendAsync(
        Guid conversationUid, SendMessageRequest req, CancellationToken ct)
    {
        var convo = await db.Conversations.IgnoreQueryFilters()
            .FirstOrDefaultAsync(c => c.Uid == conversationUid, ct);
        if (convo is null)
            return ServiceResult<MessageDto>.Fail("Conversation not found.", 404);
        if (!convo.ParticipantBusinessUids.Contains(tenant.TenantId))
            return ServiceResult<MessageDto>.Fail("Not a participant.", 403);
        if (string.IsNullOrWhiteSpace(req.Content) && (req.Attachments is null || req.Attachments.Count == 0))
            return ServiceResult<MessageDto>.Fail("Message cannot be empty.");

        var message = new Message
        {
            ConversationId = convo.Id,
            SenderUserId = tenant.UserId ?? 0,
            SenderBusinessUid = tenant.TenantId,
            Content = req.Content ?? string.Empty,
            Attachments = req.Attachments ?? [],
        };
        db.Messages.Add(message);
        convo.UpdatedAt = DateTime.UtcNow;
        await uow.SaveChangesAsync(ct);

        var senders = await GetBusinessNamesAsync([message.SenderBusinessUid], ct);
        return ServiceResult<MessageDto>.Created(ToMessageDto(message, convo.Uid, senders));
    }

    // --- mark read up to message ---
    public async Task<ServiceResult> MarkReadAsync(Guid conversationUid, long upToMessageId, CancellationToken ct)
    {
        var convo = await db.Conversations.IgnoreQueryFilters()
            .FirstOrDefaultAsync(c => c.Uid == conversationUid, ct);
        if (convo is null) return ServiceResult.Fail("Conversation not found.", 404);
        if (!convo.ParticipantBusinessUids.Contains(tenant.TenantId))
            return ServiceResult.Fail("Not a participant.", 403);

        var now = DateTime.UtcNow;
        var unread = await db.Messages
            .Where(m => m.ConversationId == convo.Id
                && m.Id <= upToMessageId
                && m.SenderBusinessUid != tenant.TenantId
                && m.ReadAt == null)
            .ToListAsync(ct);

        foreach (var m in unread) m.ReadAt = now;
        await uow.SaveChangesAsync(ct);
        return ServiceResult.Ok();
    }

    // --- find or create ---
    public async Task<ServiceResult<ConversationDto>> FindOrCreateAsync(
        FindOrCreateRequest req, CancellationToken ct)
    {
        if (req.CounterpartyBusinessUid == tenant.TenantId)
            return ServiceResult<ConversationDto>.Fail("Cannot open a conversation with yourself.", 400);

        var counterparty = await db.Businesses.IgnoreQueryFilters()
            .FirstOrDefaultAsync(b => b.Uid == req.CounterpartyBusinessUid && b.IsActive, ct);
        if (counterparty is null)
            return ServiceResult<ConversationDto>.Fail("Counterparty not found.", 404);

        long? contextId = null;
        if (req.Context == ConversationContext.Rfq && req.ContextRefUid.HasValue)
        {
            var rfq = await db.Rfqs.IgnoreQueryFilters()
                .FirstOrDefaultAsync(r => r.Uid == req.ContextRefUid.Value, ct);
            if (rfq is null)
                return ServiceResult<ConversationDto>.Fail("Referenced RFQ not found.", 400);
            contextId = rfq.Id;
        }

        var uids = new[] { tenant.TenantId, req.CounterpartyBusinessUid }
            .OrderBy(u => u.ToString()).ToList();
        var key = $"{req.Context}:{contextId?.ToString() ?? "-"}:{string.Join(",", uids)}";

        var existing = await db.Conversations.IgnoreQueryFilters()
            .FirstOrDefaultAsync(c => c.ConversationKey == key, ct);

        if (existing is null)
        {
            existing = new Conversation
            {
                ParticipantBusinessUids = uids,
                ContextType = req.Context,
                ContextId = contextId,
                ConversationKey = key,
            };
            db.Conversations.Add(existing);
            await uow.SaveChangesAsync(ct);
        }

        return ServiceResult<ConversationDto>.Ok((await MapManyAsync([existing], ct)).First());
    }

    // --- mapping helpers ---

    private async Task<List<ConversationDto>> MapManyAsync(List<Conversation> convos, CancellationToken ct)
    {
        if (convos.Count == 0) return [];

        var businessUids = convos.SelectMany(c => c.ParticipantBusinessUids).Distinct().ToList();
        var businesses = await db.Businesses.IgnoreQueryFilters()
            .Where(b => businessUids.Contains(b.Uid))
            .Select(b => new { b.Uid, b.Name, b.IsVerified })
            .ToDictionaryAsync(b => b.Uid, ct);

        var convoIds = convos.Select(c => c.Id).ToList();

        var lastMessages = await db.Messages
            .Where(m => convoIds.Contains(m.ConversationId) && m.DeletedAt == null)
            .GroupBy(m => m.ConversationId)
            .Select(g => g.OrderByDescending(m => m.CreatedAt).First())
            .ToListAsync(ct);

        var senderUids = lastMessages.Select(m => m.SenderBusinessUid).Distinct().ToList();
        var senders = await GetBusinessNamesAsync(senderUids, ct);

        // unread counts: messages not by me and ReadAt == null
        var unread = await db.Messages
            .Where(m => convoIds.Contains(m.ConversationId)
                && m.SenderBusinessUid != tenant.TenantId
                && m.ReadAt == null
                && m.DeletedAt == null)
            .GroupBy(m => m.ConversationId)
            .Select(g => new { ConvoId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.ConvoId, x => x.Count, ct);

        // context ref title resolution
        var rfqIds = convos.Where(c => c.ContextType == ConversationContext.Rfq && c.ContextId.HasValue)
            .Select(c => c.ContextId!.Value).Distinct().ToList();
        var rfqs = rfqIds.Count == 0 ? [] : await db.Rfqs.IgnoreQueryFilters()
            .Where(r => rfqIds.Contains(r.Id))
            .ToDictionaryAsync(r => r.Id, r => new { r.Uid, r.Title }, ct);

        return convos.Select(c =>
        {
            var lastMsg = lastMessages.FirstOrDefault(m => m.ConversationId == c.Id);
            Guid? contextRefUid = null;
            string? contextRefTitle = null;
            if (c.ContextType == ConversationContext.Rfq && c.ContextId.HasValue && rfqs.TryGetValue(c.ContextId.Value, out var rfq))
            {
                contextRefUid = rfq.Uid;
                contextRefTitle = rfq.Title;
            }
            return new ConversationDto(
                c.Uid, c.ContextType.ToString(), contextRefUid, contextRefTitle,
                c.ParticipantBusinessUids
                    .Select(uid => businesses.TryGetValue(uid, out var b)
                        ? new ConversationParticipantDto(uid, b.Name, b.IsVerified)
                        : new ConversationParticipantDto(uid, "", false))
                    .ToList(),
                lastMsg is null ? null : ToMessageDto(lastMsg, c.Uid, senders),
                unread.GetValueOrDefault(c.Id),
                c.CreatedAt,
                c.UpdatedAt);
        }).ToList();
    }

    private MessageDto ToMessageDto(Message m, Guid convoUid, Dictionary<Guid, string> senderNames) =>
        new(m.Id, convoUid, m.SenderUserId, m.SenderBusinessUid,
            senderNames.GetValueOrDefault(m.SenderBusinessUid, ""),
            m.Content, m.Attachments, m.ReadAt, m.CreatedAt);

    private async Task<Dictionary<Guid, string>> GetBusinessNamesAsync(IEnumerable<Guid> uids, CancellationToken ct)
    {
        var list = uids.Distinct().ToList();
        if (list.Count == 0) return new();
        return await db.Businesses.IgnoreQueryFilters()
            .Where(b => list.Contains(b.Uid))
            .ToDictionaryAsync(b => b.Uid, b => b.Name, ct);
    }
}
