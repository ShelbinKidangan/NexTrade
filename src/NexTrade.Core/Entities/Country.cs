namespace NexTrade.Core.Entities;

public class Country : PlatformEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty; // ISO 3166-1 alpha-2
    public string Code3 { get; set; } = string.Empty; // ISO 3166-1 alpha-3
    public bool IsActive { get; set; } = true;
}

public class Currency : PlatformEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty; // ISO 4217
    public string Symbol { get; set; } = string.Empty;
    public int DecimalPlaces { get; set; } = 2;
    public bool IsActive { get; set; } = true;
}
