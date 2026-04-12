"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { catalogApi } from "@/lib/api";
import type { CatalogItemDto } from "@/lib/types";

export default function CatalogPage() {
  const [items, setItems] = useState<CatalogItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | undefined>();

  useEffect(() => { loadItems(); }, [activeTab]);

  async function loadItems() {
    setLoading(true);
    try {
      const res = await catalogApi.list({ page: 1, pageSize: 50, status: activeTab });
      setItems(res.items);
    } catch { /* empty */ }
    setLoading(false);
  }

  const tabs = [
    { label: "All", value: undefined },
    { label: "Published", value: "Published" },
    { label: "Draft", value: "Draft" },
    { label: "Archived", value: "Archived" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">My Catalog</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">AI Import</Button>
          <Button size="sm" asChild>
            <Link href="/catalog/new"><Plus className="size-4" /> Add Item</Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
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

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-background-secondary animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto size-10 rounded-full bg-background-secondary flex items-center justify-center mb-3">
            <Package className="size-5 text-foreground-tertiary" />
          </div>
          <p className="text-sm text-foreground-secondary">No catalog items yet</p>
          <Button size="sm" className="mt-3" asChild>
            <Link href="/catalog/new">Add your first product</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 px-3 font-medium text-foreground-secondary">Title</th>
                <th className="py-2 px-3 font-medium text-foreground-secondary">Type</th>
                <th className="py-2 px-3 font-medium text-foreground-secondary">Category</th>
                <th className="py-2 px-3 font-medium text-foreground-secondary">Price</th>
                <th className="py-2 px-3 font-medium text-foreground-secondary">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.uid} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-2 px-3 font-medium">{item.title}</td>
                  <td className="py-2 px-3 text-foreground-secondary">{item.type}</td>
                  <td className="py-2 px-3 text-foreground-secondary">{item.category || "—"}</td>
                  <td className="py-2 px-3 text-foreground-secondary">
                    {item.pricingType === "ContactForQuote" ? "Quote" :
                     item.priceMin ? `${item.currencyCode || "$"}${item.priceMin}` : "—"}
                  </td>
                  <td className="py-2 px-3">
                    <Badge variant={item.status === "Published" ? "success" : item.status === "Draft" ? "outline" : "secondary"}>
                      {item.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
