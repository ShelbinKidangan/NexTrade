using NexTrade.Core.Enums;

namespace NexTrade.Core.Entities;

public class ComplianceDocument : TenantEntity
{
    public ComplianceDocumentType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string? IssuingBody { get; set; }
    public DateTime? IssueDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public ComplianceDocumentStatus Status { get; set; } = ComplianceDocumentStatus.Pending;
    public DateTime? VerifiedAt { get; set; }
    public long? VerifiedBy { get; set; }
    public DocumentVisibility Visibility { get; set; } = DocumentVisibility.Private;
}
