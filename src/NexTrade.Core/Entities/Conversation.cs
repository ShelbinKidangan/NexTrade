using NexTrade.Core.Enums;

namespace NexTrade.Core.Entities;

/// <summary>
/// Cross-tenant messaging thread between businesses. PRD allows N participants via
/// ParticipantBusinessUids; MVP expects two but the list shape leaves room to grow.
/// Uniqueness is enforced via a deterministic ConversationKey (sorted uids + context).
/// </summary>
public class Conversation : BaseEntity
{
    public List<Guid> ParticipantBusinessUids { get; set; } = [];
    public ConversationContext ContextType { get; set; } = ConversationContext.General;
    public long? ContextId { get; set; }

    /// <summary>Deterministic key: "{ctx}:{ctxId}:{sortedUidsJoined}" — used for the uniqueness index.</summary>
    public string ConversationKey { get; set; } = string.Empty;

    // Navigation
    public ICollection<Message> Messages { get; set; } = [];
}

public class Message : ChildEntity
{
    public long ConversationId { get; set; }
    public long SenderUserId { get; set; }
    public string Content { get; set; } = string.Empty;

    /// <summary>JSONB list of attachment blob URLs.</summary>
    public List<string> Attachments { get; set; } = [];

    public DateTime? ReadAt { get; set; }

    // Navigation
    public Conversation Conversation { get; set; } = null!;
}
