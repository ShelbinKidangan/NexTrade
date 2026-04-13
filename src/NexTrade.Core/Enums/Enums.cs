namespace NexTrade.Core.Enums;

public enum CatalogItemType
{
    Product,
    Service
}

public enum CatalogItemStatus
{
    Draft,
    Published,
    Archived
}

public enum PricingType
{
    Fixed,
    Range,
    ContactForQuote
}

public enum MediaType
{
    Image,
    Document,
    Video
}

public enum RfqVisibility
{
    Public,
    Targeted
}

public enum RfqStatus
{
    Draft,
    Open,
    Closed,
    Awarded,
    Cancelled
}

public enum QuoteStatus
{
    Draft,
    Submitted,
    Revised,
    Accepted,
    Rejected,
    Withdrawn
}

public enum ConnectionType
{
    Follow,
    ConnectionRequest,
    Connected
}

public enum ConnectionStatus
{
    Pending,
    Accepted,
    Rejected
}

public enum ComplianceDocumentType
{
    BusinessLicense,
    TaxRegistration,
    IsoCert,
    Insurance,
    AuditReport,
    Other
}

public enum ComplianceDocumentStatus
{
    Pending,
    Verified,
    Rejected,
    Expired
}

public enum DocumentVisibility
{
    Private,
    SharedOnRequest,
    Public
}

public enum ConversationContext
{
    General,
    Rfq
}

public enum CompanySize
{
    Micro,      // 1-9
    Small,      // 10-49
    Medium,     // 50-249
    Large,      // 250-999
    Enterprise  // 1000+
}

public enum UserRole
{
    Admin,
    CatalogManager,
    Sales,
    Procurement,
    Member
}

public enum ProfileSource
{
    SelfRegistered,
    S2PImport,
    Claimed
}

public enum ProfileClaimStatus
{
    Pending,
    Accepted,
    Revoked,
    Expired
}

public enum GovernmentRegistrySource
{
    MCA,
    GST,
    DGFT,
    GeM,
    Udyam,
    MSME,
    Other
}
