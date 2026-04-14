"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Calendar, MapPin, Plus, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { rfqsApi } from "@/lib/api";
import type { RfqDto } from "@/lib/types";

type Tab = "mine" | "targeted" | "public";

const statusVariant: Record<RfqDto["status"], "success" | "warning" | "secondary" | "outline" | "destructive"> = {
  Open: "success",
  Awarded: "warning",
  Draft: "outline",
  Closed: "secondary",
  Cancelled: "destructive",
};

export default function RfqsPage() {
  const [tab, setTab] = useState<Tab>("mine");
  const [rfqs, setRfqs] = useState<RfqDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const loader =
      tab === "mine" ? rfqsApi.mine({}) :
      tab === "targeted" ? rfqsApi.targeted({}) :
      rfqsApi.public({});
    loader
      .then((p) => setRfqs(p.items))
      .catch((e) => setError(e.message ?? "Failed to load RFQs"))
      .finally(() => setLoading(false));
  }, [tab]);

  const tabs: { value: Tab; label: string }[] = [
    { value: "mine", label: "My RFQs" },
    { value: "targeted", label: "Invitations" },
    { value: "public", label: "Public feed" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">RFQs</h1>
          <p className="text-sm text-foreground-secondary">Requests for Quote — yours and from your network</p>
        </div>
        <Button size="sm" render={<Link href="/rfqs/new" />}>
          <Plus className="size-4" /> Create RFQ
        </Button>
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-3 py-2 text-sm border-b-2 whitespace-nowrap transition-colors ${
              tab === t.value
                ? "border-accent text-foreground font-medium"
                : "border-transparent text-foreground-secondary hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {loading ? (
        <p className="text-sm text-foreground-secondary">Loading…</p>
      ) : rfqs.length === 0 ? (
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
          {rfqs.map((rfq) => (
            <Link key={rfq.uid} href={`/rfqs/${rfq.uid}`} className="block">
              <Card className="transition-all hover:border-border-strong hover:shadow-sm cursor-pointer">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                      {rfq.description && (
                        <p className="text-xs text-foreground-secondary line-clamp-2 mb-2">{rfq.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-foreground-tertiary">
                        {rfq.deliveryLocation && (
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3" /> {rfq.deliveryLocation}
                          </span>
                        )}
                        {rfq.responseDeadline && (
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" /> Due{" "}
                            {new Date(rfq.responseDeadline).toLocaleDateString()}
                          </span>
                        )}
                        <span>{rfq.itemCount} line {rfq.itemCount === 1 ? "item" : "items"}</span>
                        {tab !== "mine" && <span>· {rfq.buyerBusinessName}</span>}
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
