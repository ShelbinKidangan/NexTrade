using NexTrade.Core.Enums;

namespace NexTrade.Core.Entities;

/// <summary>
/// Cross-tenant messaging thread between businesses.
/// </summary>
public class Conversation : BaseEntity
{
    public Guid BusinessAUid { get; set; }
    public Guid BusinessBUid { get; set; }
    public ConversationContext ContextType { get; set; } = ConversationContext.General;
    public long? ContextId { get; set; }

    // Navigation
    public ICollection<Message> Messages { get; set; } = [];
}

public class Message : ChildEntity
{
    public long ConversationId { get; set; }
    public long SenderUserId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime? ReadAt { get; set; }

    // Navigation
    public Conversation Conversation { get; set; } = null!;
}
