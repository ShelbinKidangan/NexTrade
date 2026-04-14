namespace NexTrade.Shared.Contracts.Rfq;

public record RfqPublishedEvent(
    Guid RfqUid,
    Guid BuyerBusinessUid,
    string BuyerBusinessName,
    string Title,
    string? Description,
    string Visibility,
    DateTime? ResponseDeadline,
    IReadOnlyList<Guid> TargetedSupplierUids);

public record QuoteSubmittedEvent(
    Guid QuoteUid,
    Guid RfqUid,
    string RfqTitle,
    Guid BuyerBusinessUid,
    Guid SupplierBusinessUid,
    string SupplierBusinessName,
    decimal? TotalAmount,
    string? CurrencyCode);

public record RfqAwardedEvent(
    Guid RfqUid,
    string RfqTitle,
    Guid BuyerBusinessUid,
    Guid WinningQuoteUid,
    Guid WinningSupplierUid,
    string WinningSupplierName,
    IReadOnlyList<Guid> LosingSupplierUids);
