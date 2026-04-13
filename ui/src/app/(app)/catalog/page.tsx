"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Package, Search, Eye, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { catalogApi } from "@/lib/api";
import type { CatalogItemDto, PagedResult } from "@/lib/types";

const tabs = [
  { label: "All", value: "all" as const },
  { label: "Published", value: "Published" as const },
  { label: "Draft", value: "Draft" as const },
  { label: "Archived", value: "Archived" as const },
];

const PAGE_SIZE = 20;

export default function CatalogPage() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["value"]>("all");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | "Product" | "Service">("all");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PagedResult<CatalogItemDto> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPage(1); }, [activeTab, search, type]);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    catalogApi
      .list({
        page,
        pageSize: PAGE_SIZE,
        search: search || undefined,
        status: activeTab === "all" ? undefined : activeTab,
        type: type === "all" ? undefined : type,
      })
      .then((r) => { if (!cancelled) setResult(r); })
      .catch((e) => { if (!cancelled) setError(e.message ?? "Failed to load catalog"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeTab, search, type, page]);

  const items = useMemo(() => result?.items ?? [], [result]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">My Catalog</h1>
          <p className="text-sm text-foreground-secondary">Manage your products and services</p>
        </div>
        <Button size="sm" render={<Link href="/catalog/new" />}>
          <Plus className="size-4" /> Add Item
        </Button>
      </div>

      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.value)}
            className={`px-3 py-2 text-sm border-b-2 transition-colors ${
              activeTab === tab.value
                ? "border-accent text-foreground font-medium"
                : "border-transparent text-foreground-secondary hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-50 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-foreground-tertiary" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalog..."
            className="pl-8 h-8 text-sm"
          />
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          className="h-8 rounded-md border border-input bg-transparent px-2 text-sm"
        >
          <option value="all">All types</option>
          <option value="Product">Products</option>
          <option value="Service">Services</option>
        </select>
        <span className="ml-auto text-xs text-foreground-secondary">
          {result?.totalCount ?? 0} items
        </span>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}

      {loading ? (
        <p className="text-sm text-foreground-secondary py-8 text-center">Loading…</p>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto size-10 rounded-full bg-background-secondary flex items-center justify-center mb-3">
            <Package className="size-5 text-foreground-tertiary" />
          </div>
          <p className="text-sm text-foreground-secondary">No catalog items yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-background-secondary">
              <tr className="text-left">
                <th className="py-2 px-3 font-medium text-foreground-secondary">Title</th>
                <th className="py-2 px-3 font-medium text-foreground-secondary">Type</th>
                <th className="py-2 px-3 font-medium text-foreground-secondary">Category</th>
                <th className="py-2 px-3 font-medium text-foreground-secondary">Price</th>
                <th className="py-2 px-3 font-medium text-foreground-secondary">Activity</th>
                <th className="py-2 px-3 font-medium text-foreground-secondary">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const price =
                  item.pricingType === "ContactForQuote"
                    ? "Quote on request"
                    : item.priceMax
                    ? `${item.currencyCode ?? ""} ${item.priceMin}–${item.priceMax}`
                    : item.priceMin
                    ? `${item.currencyCode ?? ""} ${item.priceMin}`
                    : "—";
                return (
                  <tr key={item.uid} className="border-t border-border hover:bg-background-secondary/50 transition-colors">
                    <td className="py-2 px-3">
                      <Link href={`/catalog/${item.uid}`} className="flex items-center gap-2 min-w-0">
                        <div className="flex size-8 items-center justify-center rounded bg-background-secondary text-foreground-tertiary overflow-hidden">
                          {item.primaryImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.primaryImageUrl} alt="" className="size-full object-cover" />
                          ) : (
                            <Package className="size-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate max-w-65">{item.title}</div>
                          {item.description && (
                            <div className="text-xs text-foreground-tertiary truncate max-w-65">{item.description}</div>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="py-2 px-3 text-foreground-secondary">{item.type}</td>
                    <td className="py-2 px-3 text-foreground-secondary">{item.category || "—"}</td>
                    <td className="py-2 px-3 text-foreground-secondary whitespace-nowrap">{price}</td>
                    <td className="py-2 px-3 text-foreground-tertiary">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1"><Eye className="size-3" />{item.viewCount}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="size-3" />{item.inquiryCount}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <Badge
                        variant={
                          item.status === "Published" ? "success" :
                          item.status === "Draft" ? "outline" : "secondary"
                        }
                      >
                        {item.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {result && result.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <span className="text-xs text-foreground-secondary">
            Page {result.page} of {result.totalPages}
          </span>
          <Button
            size="icon-sm"
            variant="outline"
            disabled={!result.hasPrevious}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            size="icon-sm"
            variant="outline"
            disabled={!result.hasNext}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
