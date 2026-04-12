using NexTrade.Core.Enums;

namespace NexTrade.Core.Entities;

public class Order : TenantEntity
{
    public long? QuoteId { get; set; }
    public Guid BuyerBusinessUid { get; set; }
    public Guid SellerBusinessUid { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public OrderStatus Status { get; set; } = OrderStatus.Created;
    public decimal TotalAmount { get; set; }
    public string CurrencyCode { get; set; } = "USD";
    public string? ShippingAddress { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }

    // Navigation
    public Quote? Quote { get; set; }
    public ICollection<OrderItem> Items { get; set; } = [];
    public ICollection<Invoice> Invoices { get; set; } = [];
}

public class OrderItem : ChildEntity
{
    public long OrderId { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? Specifications { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public int SortOrder { get; set; }

    // Navigation
    public Order Order { get; set; } = null!;
}

public class Invoice : ChildEntity
{
    public long OrderId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string CurrencyCode { get; set; } = "USD";
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Pending;
    public DateTime? DueDate { get; set; }
    public DateTime? PaidAt { get; set; }

    // Navigation
    public Order Order { get; set; } = null!;
}
