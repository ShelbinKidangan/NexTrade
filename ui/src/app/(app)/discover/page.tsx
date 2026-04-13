"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, BadgeCheck, MapPin, Package, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { discoveryApi } from "@/lib/api";
import type { DiscoverBusinessDto, DiscoverItemDto, PagedResult } from "@/lib/types";

type Tab = "items" | "businesses";

const PAGE_SIZE = 24;

export default function DiscoverPage() {
  const [tab, setTab] = useState<Tab>("items");
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [page, setPage] = useState(1);
  const [itemsResult, setItemsResult] = useState<PagedResult<DiscoverItemDto> | null>(null);
  const [bizResult, setBizResult] = useState<PagedResult<DiscoverBusinessDto> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => { setPage(1); }, [tab, search, verifiedOnly, country]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const run = async () => {
      try {
        if (tab === "items") {
          const r = await discoveryApi.items({
            search: search || undefined,
            country: country || undefined,
            page,
            pageSize: PAGE_SIZE,
          });
          if (!cancelled) setItemsResult(r);
        } else {
          const r = await discoveryApi.businesses({
            search: search || undefined,
            country: country || undefined,
            verifiedOnly: verifiedOnly || undefined,
            page,
            pageSize: PAGE_SIZE,
          });
          if (!cancelled) setBizResult(r);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => { cancelled = true; };
  }, [tab, search, verifiedOnly, country, page]);

  const activeResult = tab === "items" ? itemsResult : bizResult;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Discover</h1>
        <p className="text-sm text-foreground-secondary">Find verified suppliers and their products.</p>
      </div>

      <div className="flex gap-1 border-b border-border">
        {([
          { k: "items", label: "Products & Services", icon: Package },
          { k: "businesses", label: "Suppliers", icon: Building2 },
        ] as const).map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`flex items-center gap-2 px-3 py-2 text-sm border-b-2 transition-colors ${
              tab === t.k
                ? "border-accent text-foreground font-medium"
                : "border-transparent text-foreground-secondary hover:text-foreground"
            }`}
          >
            <t.icon className="size-3.5" /> {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-64 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-foreground-tertiary" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === "items" ? "Search products, services, keywords..." : "Search suppliers..."}
            className="pl-8 h-9 text-sm"
          />
        </div>
        <Input
          value={country}
          onChange={(e) => setCountry(e.target.value.toUpperCase())}
          placeholder="Country (e.g. IN)"
          className="h-9 w-32 text-sm uppercase"
          maxLength={2}
        />
        {tab === "businesses" && (
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
            Verified only
          </label>
        )}
        <span className="ml-auto text-xs text-foreground-secondary">
          {activeResult?.totalCount ?? 0} results
        </span>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}
      {loading && <p className="text-sm text-foreground-secondary py-8 text-center">Searching…</p>}

      {!loading && tab === "items" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(itemsResult?.items ?? []).map((item) => (
            <Link key={item.uid} href={`/discover/item/${item.uid}`}>
              <Card className="h-full transition-all hover:border-border-strong">
                <CardContent className="pt-3">
                  <div className="aspect-video rounded-md bg-background-secondary mb-2 overflow-hidden flex items-center justify-center">
                    {item.primaryImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.primaryImageUrl} alt={item.title} className="size-full object-cover" />
                    ) : (
                      <Package className="size-5 text-foreground-tertiary" />
                    )}
                  </div>
                  <h3 className="text-sm font-medium line-clamp-1">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs text-foreground-secondary line-clamp-2 mt-0.5">{item.description}</p>
                  )}
                  <div className="flex items-center gap-1 mt-2 text-xs">
                    <span className="font-medium">{item.supplierName}</span>
                    {item.supplierVerified && <BadgeCheck className="size-3 text-accent" />}
                    {item.supplierCountry && (
                      <span className="text-foreground-tertiary ml-auto flex items-center gap-0.5">
                        <MapPin className="size-3" />{item.supplierCountry}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {itemsResult && itemsResult.items.length === 0 && (
            <p className="col-span-full text-center text-sm text-foreground-secondary py-8">No items match your search.</p>
          )}
        </div>
      )}

      {!loading && tab === "businesses" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(bizResult?.items ?? []).map((biz) => (
            <Link key={biz.uid} href={`/business/${biz.uid}`}>
              <Card className="h-full transition-all hover:border-border-strong">
                <CardContent className="pt-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-background-secondary font-semibold">
                      {biz.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <h3 className="text-sm font-medium truncate">{biz.name}</h3>
                        {biz.isVerified && <BadgeCheck className="size-4 text-accent shrink-0" />}
                      </div>
                      <p className="text-[11px] text-foreground-tertiary">
                        {biz.industry ?? "—"} {biz.city ? `· ${biz.city}` : ""}
                      </p>
                    </div>
                  </div>
                  {biz.about && (
                    <p className="text-xs text-foreground-secondary line-clamp-2 mt-2">{biz.about}</p>
                  )}
                  <div className="flex gap-1 flex-wrap mt-2">
                    {biz.capabilities.slice(0, 3).map((c) => (
                      <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>
                    ))}
                  </div>
                  <div className="text-[11px] text-foreground-tertiary mt-2">
                    {biz.publishedItemCount} published items
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {bizResult && bizResult.items.length === 0 && (
            <p className="col-span-full text-center text-sm text-foreground-secondary py-8">No suppliers match your search.</p>
          )}
        </div>
      )}

      {activeResult && activeResult.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <span className="text-xs text-foreground-secondary">
            Page {activeResult.page} of {activeResult.totalPages}
          </span>
          <Button
            size="icon-sm"
            variant="outline"
            disabled={!activeResult.hasPrevious}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            size="icon-sm"
            variant="outline"
            disabled={!activeResult.hasNext}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
