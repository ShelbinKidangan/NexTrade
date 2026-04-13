"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, MapPin, Star, BadgeCheck, Sparkles, LockKeyhole } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { mockBusinesses } from "@/lib/mock-data";

export default function PublicSearchPage() {
  const [search, setSearch] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mockBusinesses.filter((b) => {
      if (verifiedOnly && !b.isVerified) return false;
      if (!q) return true;
      return (
        b.name.toLowerCase().includes(q) ||
        (b.industry ?? "").toLowerCase().includes(q) ||
        (b.about ?? "").toLowerCase().includes(q) ||
        b.capabilities.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [search, verifiedOnly]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 space-y-6">
      <div className="rounded-xl bg-linear-to-br from-accent/10 via-accent/5 to-transparent border border-accent/20 p-8 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-subtle text-accent text-xs px-2.5 py-1 mb-3">
          <Sparkles className="size-3" /> AI-powered semantic search
        </div>
        <h1 className="text-2xl font-semibold mb-1">Find the right supplier. Fast.</h1>
        <p className="text-sm text-foreground-secondary mb-5">
          Search 12,000+ verified businesses. No login required.
        </p>
        <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground-tertiary" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='"precision CNC machining, small batch, ISO 9001, ships to EU"'
              className="pl-10 h-11"
            />
          </div>
          <Button type="submit" className="h-11">Search</Button>
        </form>
        <div className="flex flex-wrap justify-center gap-2 mt-4 text-[11px]">
          {["CNC machining", "Food-grade packaging", "Solar EPC", "PCB assembly", "Investment casting"].map((s) => (
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

      {/* Login nudge */}
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

      {/* Filters */}
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
          {results.length} results
        </span>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((b) => (
          <Link key={b.uid} href={`/business/${b.uid}`} className="block">
            <Card className="h-full transition-all hover:border-border-strong hover:shadow-md">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-background-secondary text-foreground-secondary font-semibold text-lg">
                    {b.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-medium truncate">{b.name}</h3>
                      {b.isVerified && <BadgeCheck className="size-4 shrink-0 text-accent" />}
                    </div>
                    <p className="text-xs text-foreground-secondary truncate">{b.industry}</p>
                  </div>
                </div>
                <p className="text-xs text-foreground-secondary line-clamp-2 mb-3">{b.about}</p>
                <div className="flex items-center gap-3 text-xs text-foreground-tertiary mb-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" /> {b.city}
                  </span>
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
    </div>
  );
}
