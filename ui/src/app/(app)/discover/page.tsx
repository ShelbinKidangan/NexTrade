"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BusinessCard } from "@/components/app/business-card";
import { mockBusinesses } from "@/lib/mock-data";

const tabs = ["Businesses", "Products", "Services"] as const;

export default function DiscoverPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Businesses");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");

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
    <div className="space-y-6">
      <div className="rounded-xl bg-background-secondary border border-border p-6 text-center">
        <h1 className="text-xl font-semibold mb-1">Discover Businesses</h1>
        <p className="text-sm text-foreground-secondary mb-4">
          Find suppliers, partners, and services — powered by AI
        </p>
        <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 max-w-xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-foreground-tertiary" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Try: "CNC machining, small batch, ISO 9001"'
              className="pl-9 h-10"
            />
          </div>
          <Button type="submit" className="h-10">Search</Button>
        </form>
        <p className="text-[11px] text-foreground-tertiary mt-3">
          AI-powered · Try: &quot;packaging supplier near Mumbai with food-grade certs&quot;
        </p>
      </div>

      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-sm border-b-2 transition-colors ${
              activeTab === tab
                ? "border-accent text-foreground font-medium"
                : "border-transparent text-foreground-secondary hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

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
          {results.length} {results.length === 1 ? "business" : "businesses"}
        </span>
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

      {results.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-foreground-secondary">No businesses found</p>
          <p className="text-xs text-foreground-tertiary mt-1">Try a different search or broaden your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((biz) => (
            <BusinessCard key={biz.uid} business={biz} />
          ))}
        </div>
      )}
    </div>
  );
}
