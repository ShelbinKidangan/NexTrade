"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, MapPin, Star, BadgeCheck, LockKeyhole } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { discoveryApi } from "@/lib/api";
import type { DiscoverBusinessDto } from "@/lib/types";

export default function PublicSearchPage() {
  const [search, setSearch] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [results, setResults] = useState<DiscoverBusinessDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await discoveryApi.businesses({
          search: search.trim() || undefined,
          verifiedOnly: verifiedOnly || undefined,
          pageSize: 24,
        });
        if (cancelled) return;
        setResults(res.items);
        setTotalCount(res.totalCount);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [search, verifiedOnly]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 space-y-6">
      <div className="rounded-xl bg-linear-to-br from-accent/10 via-accent/5 to-transparent border border-accent/20 p-8 text-center">
        <h1 className="text-2xl font-semibold mb-1">Find the right supplier. Fast.</h1>
        <p className="text-sm text-foreground-secondary mb-5">
          Search verified businesses across the network. No login required.
        </p>
        <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground-tertiary" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Try: CNC machining, ISO 9001, aerospace"
              className="pl-10 h-11"
            />
          </div>
          <Button type="submit" className="h-11">Search</Button>
        </form>
        <div className="flex flex-wrap justify-center gap-2 mt-4 text-[11px]">
          {["CNC machining", "Flexible packaging", "PCB assembly", "Polymer resins", "Industrial IoT"].map((s) => (
            <button
              key={s}
              onClick={() => setSearch(s)}
              className="rounded-full border border-border px-2.5 py-1 text-foreground-secondary hover:border-accent hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Card className="bg-warning/5 border-warning/20">
        <CardContent className="pt-3 pb-3">
          <div className="flex items-center gap-3">
            <LockKeyhole className="size-4 text-warning" />
            <div className="flex-1 text-xs">
              Anyone can browse. <strong>Sign up free</strong> to send RFQs, message suppliers, and save businesses to lists.
            </div>
            <Button size="xs" render={<Link href="/register" />}>Sign up free</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm">
          <SlidersHorizontal className="size-3.5" /> Filters
        </Button>
        <Badge variant="outline">All Industries</Badge>
        <Badge variant="outline">All Locations</Badge>
        <button
          onClick={() => setVerifiedOnly((v) => !v)}
          className={`text-xs rounded-full border px-2.5 py-0.5 transition-colors ${
            verifiedOnly
              ? "border-accent bg-accent-subtle text-accent"
              : "border-border text-foreground-secondary hover:text-foreground"
          }`}
        >
          ✓ Verified only
        </button>
        <div className="flex-1" />
        <span className="text-xs text-foreground-secondary">
          {loading ? "Searching…" : `${totalCount} results`}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((b) => (
          <Link key={b.uid} href={`/business/${b.uid}`} className="block">
            <Card className="h-full transition-all hover:border-border-strong hover:shadow-md">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-background-secondary text-foreground-secondary font-semibold text-lg">
                    {b.logo ? (
                      <img src={b.logo} alt="" className="size-12 rounded-lg object-cover" />
                    ) : (
                      b.name.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-medium truncate">{b.name}</h3>
                      {b.isVerified && <BadgeCheck className="size-4 shrink-0 text-accent" />}
                    </div>
                    {b.industry && (
                      <p className="text-xs text-foreground-secondary truncate">{b.industry}</p>
                    )}
                  </div>
                </div>
                {b.about && (
                  <p className="text-xs text-foreground-secondary line-clamp-2 mb-3">{b.about}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-foreground-tertiary mb-2">
                  {b.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" /> {b.city}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star className="size-3 fill-warning text-warning" /> {b.trustScore.toFixed(1)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {b.capabilities.slice(0, 3).map((c) => (
                    <Badge key={c} variant="outline" className="text-[10px] h-4 px-1.5">{c}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {!loading && results.length === 0 && (
        <Card>
          <CardContent className="pt-6 pb-6 text-center text-sm text-foreground-secondary">
            No businesses match your search. Try different keywords or clear the verified filter.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
