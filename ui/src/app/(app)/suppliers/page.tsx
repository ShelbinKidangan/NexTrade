"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bookmark, Plus, Search, Bell, Folder, MoreHorizontal, BadgeCheck,
  MapPin, Star, StickyNote, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  mockSavedSuppliers, mockSupplierLists, mockBusinesses, mockAnalytics, timeAgo,
} from "@/lib/mock-data";

export default function SuppliersPage() {
  const [search, setSearch] = useState("");
  const [selectedList, setSelectedList] = useState<string | "all">("all");
  const [tab, setTab] = useState<"saved" | "lists" | "alerts">("saved");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mockSavedSuppliers.filter((s) => {
      if (selectedList !== "all" && !s.listUids.includes(selectedList)) return false;
      if (!q) return true;
      const biz = mockBusinesses.find((b) => b.uid === s.businessUid);
      if (!biz) return false;
      return (
        biz.name.toLowerCase().includes(q) ||
        (biz.industry ?? "").toLowerCase().includes(q) ||
        (s.note ?? "").toLowerCase().includes(q)
      );
    });
  }, [search, selectedList]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">My Suppliers</h1>
          <p className="text-sm text-foreground-secondary">
            Saved suppliers, organized lists, and smart alerts.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Bell className="size-4" /> New alert
          </Button>
          <Button size="sm">
            <Plus className="size-4" /> New list
          </Button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border">
        {([
          { k: "saved", label: `Saved (${mockSavedSuppliers.length})` },
          { k: "lists", label: `Lists (${mockSupplierLists.length})` },
          { k: "alerts", label: "Smart alerts" },
        ] as const).map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`px-3 py-2 text-sm border-b-2 transition-colors ${
              tab === t.k
                ? "border-accent text-foreground font-medium"
                : "border-transparent text-foreground-secondary hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "saved" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* List sidebar */}
          <aside className="space-y-1">
            <button
              onClick={() => setSelectedList("all")}
              className={`flex items-center justify-between w-full text-xs px-2.5 py-2 rounded-md ${
                selectedList === "all" ? "bg-background-secondary font-medium" : "text-foreground-secondary hover:bg-background-secondary"
              }`}
            >
              <span className="flex items-center gap-2">
                <Bookmark className="size-3.5" /> All saved
              </span>
              <span className="text-foreground-tertiary">{mockSavedSuppliers.length}</span>
            </button>
            {mockSupplierLists.map((l) => (
              <button
                key={l.uid}
                onClick={() => setSelectedList(l.uid)}
                className={`flex items-center justify-between w-full text-xs px-2.5 py-2 rounded-md ${
                  selectedList === l.uid ? "bg-background-secondary font-medium" : "text-foreground-secondary hover:bg-background-secondary"
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="size-2 rounded-full shrink-0" style={{ background: l.color }} />
                  <span className="truncate">{l.name}</span>
                </span>
                <span className="text-foreground-tertiary">{l.supplierCount}</span>
              </button>
            ))}
          </aside>

          <div className="lg:col-span-3 space-y-4">
            {/* Risk alerts banner */}
            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="size-4 text-warning shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium">
                      {mockAnalytics.risks.length} risks flagged on your saved suppliers
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {mockAnalytics.risks.slice(0, 2).map((r, i) => (
                        <span key={i} className="text-xs text-foreground-secondary">
                          <span className="font-medium">{r.supplier}:</span> {r.issue}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" size="xs" render={<Link href="/intelligence" />}>
                    View all
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-foreground-tertiary" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search saved suppliers by name, industry, or note..."
                className="pl-9"
              />
            </div>

            {/* Saved supplier rows */}
            <div className="space-y-2">
              {filtered.map((s) => {
                const biz = mockBusinesses.find((b) => b.uid === s.businessUid);
                if (!biz) return null;
                return (
                  <Card key={s.uid} className="transition-all hover:border-border-strong">
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background-secondary font-semibold">
                          {biz.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link href={`/business/${biz.uid}`} className="text-sm font-medium truncate hover:text-accent">
                              {biz.name}
                            </Link>
                            {biz.isVerified && <BadgeCheck className="size-4 text-accent shrink-0" />}
                            <span className="flex items-center gap-0.5 text-xs text-foreground-secondary">
                              <Star className="size-3 fill-warning text-warning" />
                              {biz.trustScore.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-foreground-tertiary mt-0.5">
                            <span>{biz.industry}</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="size-3" /> {biz.city}
                            </span>
                            <span>Saved {timeAgo(s.savedAt)}</span>
                            <span>· Last activity {timeAgo(s.lastActivity)}</span>
                          </div>
                          {s.note && (
                            <div className="flex items-start gap-1.5 mt-1.5 rounded-md bg-background-secondary/50 px-2 py-1">
                              <StickyNote className="size-3 text-foreground-tertiary mt-0.5 shrink-0" />
                              <p className="text-xs text-foreground-secondary italic">{s.note}</p>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {s.listUids.map((lid) => {
                              const list = mockSupplierLists.find((l) => l.uid === lid);
                              if (!list) return null;
                              return (
                                <Badge key={lid} variant="outline" className="gap-1">
                                  <span className="size-1.5 rounded-full" style={{ background: list.color }} />
                                  {list.name}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="outline" size="xs">Message</Button>
                          <Button variant="outline" size="xs">RFQ</Button>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {filtered.length === 0 && (
                <Card>
                  <CardContent className="pt-4 pb-6 text-center">
                    <Bookmark className="size-6 mx-auto text-foreground-tertiary mb-2" />
                    <p className="text-sm text-foreground-secondary">No saved suppliers match your filters.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "lists" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockSupplierLists.map((l) => (
            <Card key={l.uid} className="transition-all hover:border-border-strong hover:shadow-sm">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg" style={{ background: `${l.color}20`, color: l.color }}>
                      <Folder className="size-4" />
                    </div>
                    <h3 className="text-sm font-medium">{l.name}</h3>
                  </div>
                  <Button variant="ghost" size="icon-sm">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </div>
                <p className="text-xs text-foreground-secondary mb-3 line-clamp-2">{l.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground-tertiary">
                    {l.supplierCount} suppliers · Created {timeAgo(l.createdAt)}
                  </span>
                  <Button variant="outline" size="xs" onClick={() => { setSelectedList(l.uid); setTab("saved"); }}>
                    Open
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Card className="border-dashed hover:border-accent cursor-pointer">
            <CardContent className="pt-4 pb-4 flex flex-col items-center justify-center text-center py-8">
              <Plus className="size-5 text-foreground-tertiary mb-1" />
              <p className="text-xs text-foreground-secondary">Create a new list</p>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "alerts" && (
        <div className="space-y-3">
          {[
            { title: "New verified CNC shop in Pune", desc: "Weekly digest · Last fired 3 days ago · 2 new matches", active: true },
            { title: "Packaging suppliers with food-grade certs", desc: "Daily digest · Last fired yesterday · 1 new match", active: true },
            { title: "Solar EPC vendors — 1 MW+", desc: "Off · Created 2026-02-14", active: false },
          ].map((a, i) => (
            <Card key={i}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-start gap-3">
                  <div className={`flex size-8 items-center justify-center rounded-full ${a.active ? "bg-accent-subtle text-accent" : "bg-background-secondary text-foreground-tertiary"}`}>
                    <Bell className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium">{a.title}</h3>
                    <p className="text-xs text-foreground-secondary">{a.desc}</p>
                  </div>
                  <Badge variant={a.active ? "success" : "outline"}>
                    {a.active ? "Active" : "Paused"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
