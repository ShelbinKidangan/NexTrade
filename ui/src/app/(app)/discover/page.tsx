"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search, LayoutGrid, List, Sparkles, X,
  BadgeCheck, Star, MapPin, Package, Wrench, Clock, TrendingUp,
  ArrowRight, Filter, Bookmark, Eye, Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BusinessCard } from "@/components/app/business-card";
import {
  mockBusinesses, mockCatalogItems, mockCatalogMeta, getCatalogSeller,
} from "@/lib/mock-data";
import type { CatalogItemDto } from "@/lib/types";

const tabs = [
  { key: "businesses", label: "Businesses", icon: BadgeCheck },
  { key: "products", label: "Products", icon: Package },
  { key: "services", label: "Services", icon: Wrench },
] as const;

type TabKey = (typeof tabs)[number]["key"];

const trendingSearches = [
  "CNC machining ISO 9001",
  "food-grade packaging pouches",
  "solar EPC 1MW",
  "PCB assembly prototype",
  "3PL warehousing Chennai",
];

export default function DiscoverPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("businesses");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [pricingFilter, setPricingFilter] = useState<Set<string>>(new Set());
  const [minTrust, setMinTrust] = useState(0);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"relevance" | "trust" | "newest">("relevance");

  const togglePricing = (p: string) => {
    setPricingFilter((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  const allIndustries = useMemo(
    () => Array.from(new Set(mockBusinesses.map((b) => b.industry).filter(Boolean))).sort() as string[],
    []
  );
  const allLocations = useMemo(
    () => Array.from(new Set(mockBusinesses.map((b) => b.city).filter(Boolean))).sort() as string[],
    []
  );
  const allCategories = useMemo(
    () => Array.from(new Set(mockCatalogItems.map((i) => i.category).filter(Boolean))).sort() as string[],
    []
  );

  const filteredBusinesses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mockBusinesses
      .filter((b) => {
        if (verifiedOnly && !b.isVerified) return false;
        if (industryFilter && b.industry !== industryFilter) return false;
        if (locationFilter && b.city !== locationFilter) return false;
        if (b.trustScore < minTrust) return false;
        if (!q) return true;
        return (
          b.name.toLowerCase().includes(q) ||
          (b.industry ?? "").toLowerCase().includes(q) ||
          (b.about ?? "").toLowerCase().includes(q) ||
          b.capabilities.some((c) => c.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (sortBy === "trust") return b.trustScore - a.trustScore;
        if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return 0;
      });
  }, [search, verifiedOnly, industryFilter, locationFilter, minTrust, sortBy]);

  const publishedItems = useMemo(
    () => mockCatalogItems.filter((i) => i.status === "Published"),
    []
  );

  const filterCatalog = (type: "Product" | "Service") => {
    const q = search.trim().toLowerCase();
    return publishedItems.filter((i) => {
      if (i.type !== type) return false;
      const seller = getCatalogSeller(i.uid);
      if (verifiedOnly && !seller?.isVerified) return false;
      if (locationFilter && seller?.city !== locationFilter) return false;
      if (categoryFilter && i.category !== categoryFilter) return false;
      if (pricingFilter.size > 0 && !pricingFilter.has(i.pricingType)) return false;
      if (!q) return true;
      const meta = mockCatalogMeta[i.uid];
      return (
        i.title.toLowerCase().includes(q) ||
        (i.description ?? "").toLowerCase().includes(q) ||
        (i.category ?? "").toLowerCase().includes(q) ||
        (seller?.name ?? "").toLowerCase().includes(q) ||
        meta?.tags.some((t) => t.toLowerCase().includes(q)) ||
        false
      );
    });
  };

  const products = useMemo(
    () => filterCatalog("Product"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [search, verifiedOnly, locationFilter, categoryFilter, pricingFilter]
  );
  const services = useMemo(
    () => filterCatalog("Service"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [search, verifiedOnly, locationFilter, categoryFilter, pricingFilter]
  );

  const resultsCount =
    activeTab === "businesses" ? filteredBusinesses.length : activeTab === "products" ? products.length : services.length;

  const clearFilters = () => {
    setVerifiedOnly(false);
    setIndustryFilter(null);
    setLocationFilter(null);
    setCategoryFilter(null);
    setPricingFilter(new Set());
    setMinTrust(0);
  };

  const activeFilterCount =
    (verifiedOnly ? 1 : 0) +
    (industryFilter ? 1 : 0) +
    (locationFilter ? 1 : 0) +
    (categoryFilter ? 1 : 0) +
    pricingFilter.size +
    (minTrust > 0 ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-linear-to-br from-accent/12 via-accent/5 to-transparent px-6 py-5">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_15%_50%,var(--color-accent)_0%,transparent_40%),radial-gradient(circle_at_85%_30%,var(--color-accent)_0%,transparent_35%)] pointer-events-none" />
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-subtle text-accent text-[11px] px-2 py-0.5 mb-2">
              <Sparkles className="size-3" /> AI semantic search
            </div>
            <h1 className="text-xl font-semibold leading-tight">
              Discover businesses, products &amp; services
            </h1>
            <p className="text-xs text-foreground-secondary mt-0.5">
              Search 12,400+ verified businesses. Ask in plain English.
            </p>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 flex-1 min-w-70 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground-tertiary" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='"precision CNC brackets, ISO 9001, ships to EU"'
                className="pl-10 pr-9 h-10 bg-background/70 backdrop-blur"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground-tertiary hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <Button type="submit" className="h-10">Search</Button>
          </form>
        </div>
        <div className="relative flex flex-wrap gap-1.5 mt-3">
          <span className="text-[11px] text-foreground-tertiary flex items-center gap-1 mr-0.5">
            <TrendingUp className="size-3" /> Trending
          </span>
          {trendingSearches.map((s) => (
            <button
              key={s}
              onClick={() => setSearch(s)}
              className="text-[11px] rounded-full border border-border bg-background/60 backdrop-blur px-2 py-0.5 text-foreground-secondary hover:border-accent hover:text-foreground transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map((tab) => {
          const count =
            tab.key === "businesses"
              ? filteredBusinesses.length
              : tab.key === "products"
              ? products.length
              : services.length;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? "border-accent text-foreground font-medium"
                  : "border-transparent text-foreground-secondary hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
              <span className={`text-[11px] ${activeTab === tab.key ? "text-accent" : "text-foreground-tertiary"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar filters */}
        <aside className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-foreground-secondary uppercase tracking-wide flex items-center gap-1">
              <Filter className="size-3" /> Filters
              {activeFilterCount > 0 && (
                <Badge variant="default" className="ml-1 h-4 px-1.5 text-[10px]">{activeFilterCount}</Badge>
              )}
            </h3>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-[11px] text-accent hover:underline">
                Clear
              </button>
            )}
          </div>

          <FilterGroup label="Trust & verification">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="size-3.5 rounded border-border accent-accent"
              />
              Verified only
            </label>
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] text-foreground-tertiary mb-1">
                <span>Min trust score</span>
                <span className="font-medium text-foreground flex items-center gap-0.5">
                  <Star className="size-2.5 fill-warning text-warning" />
                  {minTrust.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={minTrust}
                onChange={(e) => setMinTrust(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
          </FilterGroup>

          {activeTab === "businesses" && (
            <FilterGroup label="Industry">
              <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                {allIndustries.map((ind) => (
                  <button
                    key={ind}
                    onClick={() => setIndustryFilter(industryFilter === ind ? null : ind)}
                    className={`block w-full text-left text-xs rounded-md px-2 py-1 transition-colors ${
                      industryFilter === ind
                        ? "bg-accent-subtle text-accent font-medium"
                        : "text-foreground-secondary hover:bg-background-secondary"
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </FilterGroup>
          )}

          {(activeTab === "products" || activeTab === "services") && (
            <FilterGroup label="Category">
              <div className="space-y-0.5 max-h-44 overflow-y-auto pr-1">
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                    className={`block w-full text-left text-xs rounded-md px-2 py-1 transition-colors ${
                      categoryFilter === cat
                        ? "bg-accent-subtle text-accent font-medium"
                        : "text-foreground-secondary hover:bg-background-secondary"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </FilterGroup>
          )}

          <FilterGroup label="Location">
            <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
              {allLocations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setLocationFilter(locationFilter === loc ? null : loc)}
                  className={`block w-full text-left text-xs rounded-md px-2 py-1 transition-colors ${
                    locationFilter === loc
                      ? "bg-accent-subtle text-accent font-medium"
                      : "text-foreground-secondary hover:bg-background-secondary"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </FilterGroup>

          {activeTab === "products" && (
            <FilterGroup label="Pricing">
              {[
                { label: "Fixed price", value: "Fixed" },
                { label: "Price range", value: "Range" },
                { label: "Contact for quote", value: "ContactForQuote" },
              ].map((p) => (
                <label key={p.value} className="flex items-center gap-2 text-xs cursor-pointer py-0.5 text-foreground-secondary hover:text-foreground">
                  <input
                    type="checkbox"
                    checked={pricingFilter.has(p.value)}
                    onChange={() => togglePricing(p.value)}
                    className="size-3.5 rounded border-border accent-accent"
                  />
                  {p.label}
                </label>
              ))}
            </FilterGroup>
          )}
        </aside>

        {/* Results */}
        <div className="min-w-0">
          {/* Results toolbar */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm text-foreground-secondary">
              <span className="font-medium text-foreground">{resultsCount}</span>{" "}
              {activeTab === "businesses" ? "businesses" : activeTab === "products" ? "products" : "services"}
              {search && (
                <>
                  {" "}for <span className="text-foreground">&quot;{search}&quot;</span>
                </>
              )}
            </span>
            <div className="flex-1" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-7 rounded-md border border-input bg-transparent px-2 text-xs"
            >
              <option value="relevance">Most relevant</option>
              <option value="trust">Highest trust</option>
              <option value="newest">Newest</option>
            </select>
            <div className="flex items-center rounded-md border border-border overflow-hidden">
              <button
                onClick={() => setView("grid")}
                className={`p-1.5 ${view === "grid" ? "bg-background-secondary text-foreground" : "text-foreground-tertiary"}`}
                aria-label="Grid view"
              >
                <LayoutGrid className="size-3.5" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-1.5 ${view === "list" ? "bg-background-secondary text-foreground" : "text-foreground-tertiary"}`}
                aria-label="List view"
              >
                <List className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {verifiedOnly && (
                <Chip label="Verified only" onRemove={() => setVerifiedOnly(false)} />
              )}
              {industryFilter && (
                <Chip label={industryFilter} onRemove={() => setIndustryFilter(null)} />
              )}
              {categoryFilter && (
                <Chip label={categoryFilter} onRemove={() => setCategoryFilter(null)} />
              )}
              {locationFilter && (
                <Chip label={locationFilter} onRemove={() => setLocationFilter(null)} />
              )}
              {Array.from(pricingFilter).map((p) => (
                <Chip key={p} label={p === "ContactForQuote" ? "Contact for quote" : p} onRemove={() => togglePricing(p)} />
              ))}
              {minTrust > 0 && (
                <Chip label={`Trust ≥ ${minTrust}`} onRemove={() => setMinTrust(0)} />
              )}
            </div>
          )}

          {/* Results */}
          {activeTab === "businesses" && (
            <>
              {filteredBusinesses.length === 0 ? (
                <EmptyState />
              ) : view === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredBusinesses.map((b) => (
                    <BusinessCard key={b.uid} business={b} />
                  ))}
                </div>
              ) : (
                <BusinessListView businesses={filteredBusinesses} />
              )}
            </>
          )}

          {activeTab === "products" && (
            <>
              {products.length === 0 ? (
                <EmptyState />
              ) : view === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {products.map((p) => (
                    <ProductCard key={p.uid} item={p} />
                  ))}
                </div>
              ) : (
                <CatalogListView items={products} />
              )}
            </>
          )}

          {activeTab === "services" && (
            <>
              {services.length === 0 ? (
                <EmptyState />
              ) : view === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((s) => (
                    <ServiceCard key={s.uid} item={s} />
                  ))}
                </div>
              ) : (
                <CatalogListView items={services} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[11px] font-medium text-foreground-secondary uppercase tracking-wide mb-2">
        {label}
      </h4>
      {children}
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent-subtle text-accent text-xs px-2 py-0.5">
      {label}
      <button onClick={onRemove} className="hover:bg-accent/20 rounded-full">
        <X className="size-3" />
      </button>
    </span>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="pt-10 pb-10 text-center">
        <Search className="size-8 mx-auto text-foreground-tertiary mb-3" />
        <p className="text-sm text-foreground-secondary">No results found</p>
        <p className="text-xs text-foreground-tertiary mt-1">Try a different search or broaden your filters</p>
      </CardContent>
    </Card>
  );
}

const currencySymbol: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", INR: "₹", JPY: "¥",
};

function formatPrice(item: CatalogItemDto): { value: string; suffix: string } {
  if (item.pricingType === "ContactForQuote") return { value: "Get quote", suffix: "" };
  const code = item.currencyCode || "USD";
  const sym = currencySymbol[code] ?? code + " ";
  if (item.pricingType === "Range" && item.priceMin != null && item.priceMax != null) {
    return { value: `${sym}${item.priceMin} – ${sym}${item.priceMax}`, suffix: "per unit" };
  }
  if (item.priceMin != null) return { value: `${sym}${item.priceMin}`, suffix: "per unit" };
  return { value: "—", suffix: "" };
}

function ProductCard({ item }: { item: CatalogItemDto }) {
  const seller = getCatalogSeller(item.uid);
  const meta = mockCatalogMeta[item.uid];
  const price = formatPrice(item);
  const [from, to] = meta?.colorGradient ?? ["#6366f1", "#8b5cf6"];

  return (
    <Link href={`/discover/item/${item.uid}`} className="block group">
      <Card className="h-full gap-0! py-0! overflow-hidden transition-all hover:border-accent/40 hover:shadow-lg hover:-translate-y-0.5">
        {/* Image area */}
        <div
          className="relative h-36 overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
        >
          {/* dot pattern overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "14px 14px",
            }}
          />
          {/* watermark initial */}
          <div className="absolute -bottom-4 -right-2 font-heading text-[110px] leading-none font-bold text-white/15 select-none">
            {item.title.charAt(0).toUpperCase()}
          </div>
          {/* small product icon */}
          <div className="absolute top-3 left-3 flex size-8 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
            <Package className="size-4 text-white" />
          </div>
          {/* category pill */}
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-medium rounded-full bg-black/25 backdrop-blur px-2 py-0.5 text-white">
              {item.category}
            </span>
          </div>
          {/* hover action */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all opacity-0 group-hover:opacity-100">
            <span className="inline-flex items-center gap-1 rounded-full bg-white text-foreground text-[11px] font-medium px-3 py-1.5 shadow-lg">
              <Eye className="size-3" /> Quick view
            </span>
          </div>
          {/* save button */}
          <button
            onClick={(e) => { e.preventDefault(); }}
            className="absolute bottom-2 right-2 flex size-7 items-center justify-center rounded-full bg-white/90 backdrop-blur text-foreground hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            aria-label="Save"
          >
            <Bookmark className="size-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-3.5">
          <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-accent transition-colors min-h-10">
            {item.title}
          </h3>

          {/* tags */}
          {meta && meta.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {meta.tags.slice(0, 2).map((t) => (
                <span key={t} className="text-[10px] rounded bg-background-secondary px-1.5 py-0.5 text-foreground-secondary">
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* price row */}
          <div className="flex items-end justify-between mt-3 pt-3 border-t border-border">
            <div>
              {price.suffix && <div className="text-[10px] text-foreground-tertiary uppercase tracking-wide">From</div>}
              <div className="text-base font-semibold leading-tight">{price.value}</div>
              {price.suffix && <div className="text-[10px] text-foreground-tertiary">{price.suffix}</div>}
            </div>
            <div className="text-right text-[10px] text-foreground-tertiary leading-tight space-y-0.5">
              {item.minOrderQuantity && (
                <div className="flex items-center gap-1 justify-end">
                  <Package className="size-2.5" /> MOQ {item.minOrderQuantity.toLocaleString()}
                </div>
              )}
              {item.leadTimeDays && (
                <div className="flex items-center gap-1 justify-end">
                  <Clock className="size-2.5" /> {item.leadTimeDays}d lead
                </div>
              )}
            </div>
          </div>

          {/* seller row */}
          {seller && (
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex size-6 shrink-0 items-center justify-center rounded bg-background-secondary text-[10px] font-semibold text-foreground-secondary">
                  {seller.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="font-medium truncate">{seller.name}</span>
                    {seller.isVerified && <BadgeCheck className="size-3 shrink-0 text-accent" />}
                  </div>
                  <div className="text-[10px] text-foreground-tertiary flex items-center gap-1">
                    <MapPin className="size-2.5" /> {seller.city}
                  </div>
                </div>
              </div>
              {meta && (
                <span className="flex items-center gap-0.5 text-[11px] text-foreground-secondary shrink-0 rounded bg-background-secondary px-1.5 py-0.5">
                  <Star className="size-2.5 fill-warning text-warning" /> {meta.rating.toFixed(1)}
                </span>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}

function ServiceCard({ item }: { item: CatalogItemDto }) {
  const seller = getCatalogSeller(item.uid);
  const meta = mockCatalogMeta[item.uid];
  const price = formatPrice(item);
  const [from, to] = meta?.colorGradient ?? ["#10b981", "#3b82f6"];

  return (
    <Link href={`/discover/item/${item.uid}`} className="block group">
      <Card className="overflow-hidden gap-0! py-0! transition-all hover:border-accent/40 hover:shadow-lg hover:-translate-y-0.5">
        {/* Header band */}
        <div
          className="relative h-20 overflow-hidden flex items-center px-4"
          style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "linear-gradient(45deg, white 1px, transparent 1px), linear-gradient(-45deg, white 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />
          <div className="absolute -top-2 -right-2 font-heading text-[80px] leading-none font-bold text-white/15 select-none">
            {item.title.charAt(0).toUpperCase()}
          </div>
          <div className="relative flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
              <Wrench className="size-5 text-white" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium rounded-full bg-white/25 backdrop-blur px-2 py-0.5 text-white w-fit">
                Service
              </span>
              <span className="text-[10px] font-medium rounded-full bg-black/25 backdrop-blur px-2 py-0.5 text-white w-fit">
                {item.category}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-sm font-medium group-hover:text-accent transition-colors line-clamp-1">
            {item.title}
          </h3>
          {item.description && (
            <p className="text-xs text-foreground-secondary line-clamp-2 mt-1">{item.description}</p>
          )}

          {meta && meta.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {meta.tags.slice(0, 4).map((t) => (
                <span key={t} className="text-[10px] rounded bg-background-secondary px-1.5 py-0.5 text-foreground-secondary">
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
            <Stat label="Pricing" value={price.value} />
            <Stat label="Lead time" value={item.leadTimeDays ? `${item.leadTimeDays}d` : "Flex"} icon={<Clock className="size-3" />} />
            <Stat label="Inquiries" value={String(item.inquiryCount)} icon={<Zap className="size-3" />} />
          </div>

          {seller && (
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex size-7 shrink-0 items-center justify-center rounded bg-background-secondary text-xs font-semibold text-foreground-secondary">
                  {seller.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-xs">
                    <span className="font-medium truncate">{seller.name}</span>
                    {seller.isVerified && <BadgeCheck className="size-3 shrink-0 text-accent" />}
                  </div>
                  <div className="text-[10px] text-foreground-tertiary flex items-center gap-2">
                    <span className="flex items-center gap-0.5"><MapPin className="size-2.5" /> {seller.city}</span>
                    {meta && (
                      <span className="flex items-center gap-0.5"><Star className="size-2.5 fill-warning text-warning" /> {meta.rating.toFixed(1)}</span>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-accent text-[11px] flex items-center gap-1 shrink-0 font-medium">
                View <ArrowRight className="size-3" />
              </span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-[9px] text-foreground-tertiary uppercase tracking-wide flex items-center gap-1">
        {icon} {label}
      </div>
      <div className="text-[11px] font-medium truncate">{value}</div>
    </div>
  );
}

function BusinessListView({ businesses }: { businesses: typeof mockBusinesses }) {
  return (
    <div className="space-y-2">
      {businesses.map((b) => (
        <Link key={b.uid} href={`/business/${b.uid}`} className="block">
          <Card className="transition-all hover:border-border-strong">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background-secondary font-semibold">
                  {b.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{b.name}</span>
                    {b.isVerified && <BadgeCheck className="size-4 text-accent" />}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-foreground-tertiary mt-0.5">
                    <span>{b.industry}</span>
                    <span className="flex items-center gap-1"><MapPin className="size-3" /> {b.city}</span>
                    <span className="flex items-center gap-0.5"><Star className="size-2.5 fill-warning text-warning" /> {b.trustScore.toFixed(1)}</span>
                  </div>
                </div>
                <div className="hidden md:flex flex-wrap gap-1 max-w-xs">
                  {b.capabilities.slice(0, 3).map((c) => (
                    <Badge key={c} variant="outline" className="text-[10px] h-4 px-1.5">{c}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function CatalogListView({ items }: { items: CatalogItemDto[] }) {
  return (
    <div className="space-y-2">
      {items.map((item) => {
        const seller = getCatalogSeller(item.uid);
        const price = formatPrice(item);
        return (
          <Link key={item.uid} href={`/discover/item/${item.uid}`} className="block">
            <Card className="transition-all hover:border-border-strong">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background-secondary">
                    {item.type === "Service" ? <Wrench className="size-4" /> : <Package className="size-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium truncate">{item.title}</span>
                      <Badge variant="outline">{item.type}</Badge>
                      {item.category && <Badge variant="secondary">{item.category}</Badge>}
                    </div>
                    <p className="text-xs text-foreground-secondary line-clamp-1 mt-0.5">{item.description}</p>
                    {seller && (
                      <div className="text-[11px] text-foreground-tertiary mt-0.5 flex items-center gap-2">
                        by <span className="text-foreground font-medium">{seller.name}</span>
                        {seller.isVerified && <BadgeCheck className="size-3 text-accent" />}
                        <span>· {seller.city}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold">{price.value}</div>
                    <div className="text-[11px] text-foreground-tertiary">{price.suffix}</div>
                    {item.minOrderQuantity && (
                      <div className="text-[10px] text-foreground-tertiary">MOQ {item.minOrderQuantity}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
