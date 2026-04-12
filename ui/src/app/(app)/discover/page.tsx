"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BusinessCard } from "@/components/app/business-card";
import { businessesApi } from "@/lib/api";
import type { BusinessDto } from "@/lib/types";

export default function DiscoverPage() {
  const [search, setSearch] = useState("");
  const [businesses, setBusinesses] = useState<BusinessDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusinesses();
  }, []);

  async function loadBusinesses(searchTerm?: string) {
    setLoading(true);
    try {
      const res = await businessesApi.discover({
        page: 1, pageSize: 20,
        search: searchTerm || undefined,
      });
      setBusinesses(res.items);
      setTotalCount(res.totalCount);
    } catch { /* empty */ }
    setLoading(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadBusinesses(search);
  }

  return (
    <div className="space-y-6">
      {/* Hero Search */}
      <div className="rounded-xl bg-background-secondary border border-border p-6 text-center">
        <h1 className="text-xl font-semibold mb-1">Discover Businesses</h1>
        <p className="text-sm text-foreground-secondary mb-4">
          Find suppliers, partners, and services — powered by AI
        </p>
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
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
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <SlidersHorizontal className="size-3.5" /> Filters
        </Button>
        <Badge variant="outline">All Industries</Badge>
        <Badge variant="outline">All Locations</Badge>
        <div className="flex-1" />
        <span className="text-xs text-foreground-secondary">
          {totalCount} {totalCount === 1 ? "business" : "businesses"}
        </span>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 rounded-xl bg-background-secondary animate-pulse" />
          ))}
        </div>
      ) : businesses.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-foreground-secondary">No businesses found</p>
          <p className="text-xs text-foreground-tertiary mt-1">Try a different search or broaden your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {businesses.map((biz) => (
            <BusinessCard key={biz.uid} business={biz} />
          ))}
        </div>
      )}
    </div>
  );
}
