"use client";

import { useMemo, useState } from "react";
import {
  Upload, FileText, BadgeCheck, AlertTriangle, Search, Download,
  Share2, MoreHorizontal, Sparkles, Clock, Shield, Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { mockComplianceDocs, type MockComplianceDoc, timeAgo } from "@/lib/mock-data";

const typeTabs = ["All", "ISO Cert", "License", "Insurance", "Audit Report", "Tax Registration"] as const;

const statusVariant: Record<MockComplianceDoc["status"], "success" | "warning" | "destructive" | "outline"> = {
  Active: "success",
  "Expiring Soon": "warning",
  Expired: "destructive",
  "Pending Review": "outline",
};

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

export default function CompliancePage() {
  const [tab, setTab] = useState<(typeof typeTabs)[number]>("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mockComplianceDocs.filter((d) => {
      if (tab !== "All" && d.type !== tab) return false;
      if (!q) return true;
      return d.name.toLowerCase().includes(q) || d.issuingBody.toLowerCase().includes(q);
    });
  }, [tab, search]);

  const counts = {
    total: mockComplianceDocs.length,
    active: mockComplianceDocs.filter((d) => d.status === "Active").length,
    expiring: mockComplianceDocs.filter((d) => d.status === "Expiring Soon").length,
    pending: mockComplianceDocs.filter((d) => d.status === "Pending Review").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Compliance Vault</h1>
          <p className="text-sm text-foreground-secondary">
            Store certifications, licenses, and audit documents. AI auto-parses fields from uploads.
          </p>
        </div>
        <Button size="sm">
          <Upload className="size-4" /> Upload document
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <Shield className="size-4 text-foreground-tertiary mb-2" />
            <div className="text-2xl font-semibold">{counts.total}</div>
            <div className="text-xs text-foreground-secondary">Total documents</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <BadgeCheck className="size-4 text-success mb-2" />
            <div className="text-2xl font-semibold">{counts.active}</div>
            <div className="text-xs text-foreground-secondary">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <AlertTriangle className="size-4 text-warning mb-2" />
            <div className="text-2xl font-semibold">{counts.expiring}</div>
            <div className="text-xs text-foreground-secondary">Expiring within 30 days</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <Clock className="size-4 text-foreground-tertiary mb-2" />
            <div className="text-2xl font-semibold">{counts.pending}</div>
            <div className="text-xs text-foreground-secondary">Pending AI review</div>
          </CardContent>
        </Card>
      </div>

      {/* AI banner */}
      <Card className="bg-accent/5 border-accent/20">
        <CardContent className="pt-3 pb-3">
          <div className="flex items-center gap-3">
            <Sparkles className="size-4 text-accent" />
            <div className="flex-1 text-xs">
              <span className="font-medium">AI Document Parser</span>
              <span className="text-foreground-secondary">
                {" "}— drop any ISO cert, insurance doc, or license and we&apos;ll extract all fields automatically. Zero manual entry.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-foreground-tertiary" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {typeTabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm border-b-2 whitespace-nowrap transition-colors ${
              tab === t
                ? "border-accent text-foreground font-medium"
                : "border-transparent text-foreground-secondary hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Documents table */}
      <div className="space-y-2">
        {filtered.map((doc) => {
          const days = daysUntil(doc.expiresAt);
          return (
            <Card key={doc.uid}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background-secondary">
                    <FileText className="size-4 text-foreground-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <h3 className="text-sm font-medium truncate">{doc.name}</h3>
                      <Badge variant={statusVariant[doc.status]}>{doc.status}</Badge>
                      {doc.parsedByAi && (
                        <Badge variant="outline" className="gap-1">
                          <Sparkles className="size-3" /> AI-parsed
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-foreground-tertiary mt-0.5">
                      <span>{doc.type}</span>
                      <span>· Issued by {doc.issuingBody}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" /> Issued {new Date(doc.issuedAt).toLocaleDateString()}
                      </span>
                      {doc.expiresAt && (
                        <span className={`flex items-center gap-1 ${
                          days !== null && days < 30 ? "text-warning" : ""
                        }`}>
                          <Clock className="size-3" /> Expires {new Date(doc.expiresAt).toLocaleDateString()}
                          {days !== null && days >= 0 && ` (${days}d)`}
                        </span>
                      )}
                      <span>· {doc.fileSize}</span>
                      <span>· Uploaded {timeAgo(doc.uploadedAt)}</span>
                    </div>
                    {doc.sharedWith.length > 0 && (
                      <div className="text-[11px] text-foreground-secondary mt-1">
                        Shared with {doc.sharedWith.length} business{doc.sharedWith.length === 1 ? "" : "es"}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon-sm" title="Download">
                      <Download className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" title="Share">
                      <Share2 className="size-4" />
                    </Button>
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
            <CardContent className="pt-6 pb-6 text-center">
              <FileText className="size-6 mx-auto text-foreground-tertiary mb-2" />
              <p className="text-sm text-foreground-secondary">No documents match your filters.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
