"use client";

import { useMemo, useState } from "react";
import { FileText, Calendar, MapPin, Plus, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { mockRfqs, timeAgo, type MockRfq } from "@/lib/mock-data";

const tabs = [
  { label: "All", value: "all" as const },
  { label: "Open", value: "Open" as const },
  { label: "Awarded", value: "Awarded" as const },
  { label: "Closed", value: "Closed" as const },
  { label: "Draft", value: "Draft" as const },
  { label: "Cancelled", value: "Cancelled" as const },
];

const statusVariant: Record<MockRfq["status"], "success" | "warning" | "secondary" | "outline" | "destructive"> = {
  Open: "success",
  Awarded: "warning",
  Draft: "outline",
  Closed: "secondary",
  Cancelled: "destructive",
};

export default function RfqsPage() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["value"]>("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: mockRfqs.length };
    for (const r of mockRfqs) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, []);

  const filtered = useMemo(
    () => (activeTab === "all" ? mockRfqs : mockRfqs.filter((r) => r.status === activeTab)),
    [activeTab]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">RFQs</h1>
          <p className="text-sm text-foreground-secondary">Requests for Quote — yours and from your network</p>
        </div>
        <Button size="sm">
          <Plus className="size-4" /> Create RFQ
        </Button>
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.value)}
            className={`px-3 py-2 text-sm border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.value
                ? "border-accent text-foreground font-medium"
                : "border-transparent text-foreground-secondary hover:text-foreground"
            }`}
          >
            {tab.label} <span className="text-foreground-tertiary">({counts[tab.value] ?? 0})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="size-10 rounded-full bg-background-secondary flex items-center justify-center mb-3">
                <FileText className="size-5 text-foreground-tertiary" />
              </div>
              <p className="text-sm text-foreground-secondary">No RFQs in this view</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((rfq) => (
            <Card key={rfq.uid} className="transition-all hover:border-border-strong hover:shadow-sm cursor-pointer">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium truncate">{rfq.title}</h3>
                      <Badge variant={statusVariant[rfq.status]}>{rfq.status}</Badge>
                      <Badge variant="outline" className="gap-1">
                        {rfq.visibility === "Public" ? (
                          <Globe className="size-3" />
                        ) : (
                          <Lock className="size-3" />
                        )}
                        {rfq.visibility}
                      </Badge>
                    </div>
                    <p className="text-xs text-foreground-secondary line-clamp-2 mb-2">{rfq.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-foreground-tertiary">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" /> {rfq.deliveryLocation}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" /> Due {new Date(rfq.responseDeadline).toLocaleDateString()}
                      </span>
                      <span>{rfq.itemCount} line {rfq.itemCount === 1 ? "item" : "items"}</span>
                      <span>·</span>
                      <span>{rfq.category}</span>
                      <span>·</span>
                      <span>Created {timeAgo(rfq.createdAt)}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-semibold leading-none">{rfq.quoteCount}</div>
                    <div className="text-[11px] text-foreground-tertiary mt-1">
                      {rfq.quoteCount === 1 ? "quote" : "quotes"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
