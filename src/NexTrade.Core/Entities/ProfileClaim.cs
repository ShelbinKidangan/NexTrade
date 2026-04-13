using NexTrade.Core.Enums;

namespace NexTrade.Core.Entities;

/// <summary>
/// The S2P warm-invite claim flow. An S2P customer's vendor list seeds draft businesses;
/// each draft business gets a ProfileClaim invite. When the supplier claims it, the Business
/// flips ProfileSource from S2PImport to Claimed and becomes discoverable to all buyers.
/// </summary>
public class ProfileClaim : BaseEntity
{
    public Guid BusinessUid { get; set; }

    // The S2P customer that seeded this profile; null if seeded from a government registry feed.
    public Guid? InvitedByBusinessUid { get; set; }

    public string InviteToken { get; set; } = string.Empty;
    public string RecipientEmail { get; set; } = string.Empty;
    public string? RecipientName { get; set; }

    public ProfileClaimStatus Status { get; set; } = ProfileClaimStatus.Pending;

    public DateTime? SentAt { get; set; }
    public DateTime? LastRemindedAt { get; set; }
    public DateTime? ClaimedAt { get; set; }
    public long? ClaimedByUserId { get; set; }
    public DateTime? ExpiresAt { get; set; }
}
