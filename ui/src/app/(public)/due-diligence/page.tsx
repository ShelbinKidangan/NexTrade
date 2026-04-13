"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search, Shield, BadgeCheck, FileText, Building2, Users, Calendar,
  CheckCircle2, ExternalLink, Sparkles, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { mockDueDiligence } from "@/lib/mock-data";

export default function DueDiligencePage() {
  const [query, setQuery] = useState("");
  const [showResult, setShowResult] = useState(false);
  const dd = mockDueDiligence;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setShowResult(true);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-subtle text-accent text-xs px-2.5 py-1 mb-3">
          <Shield className="size-3" /> Free · No login required
        </div>
        <h1 className="text-2xl font-semibold mb-1">Vendor Due Diligence</h1>
        <p className="text-sm text-foreground-secondary mb-6">
          Instant compliance and trust check. Pulls from MCA, GST, DGFT registries.
        </p>
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground-tertiary" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter company name or GST number..."
              className="pl-10 h-11"
            />
          </div>
          <Button type="submit" className="h-11">Run check</Button>
        </form>
        <p className="text-[11px] text-foreground-tertiary mt-3">
          Try: &quot;Acme Metals&quot; or &quot;27AAFCA1234B1Z5&quot;
        </p>
      </div>

      {!showResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            { icon: Building2, label: "Incorporation status", body: "MCA registration, CIN, directors, capital" },
            { icon: FileText, label: "GST & tax compliance", body: "Active status, filing history, audit flags" },
            { icon: Shield, label: "Certifications on file", body: "ISO, MSME, import/export, industry certs" },
          ].map((i) => (
            <Card key={i.label}>
              <CardContent className="pt-4">
                <i.icon className="size-4 text-accent mb-2" />
                <h3 className="text-sm font-medium">{i.label}</h3>
                <p className="text-xs text-foreground-secondary mt-1">{i.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showResult && (
        <div className="space-y-4">
          {/* Header card */}
          <Card className="bg-linear-to-br from-success/5 to-transparent border-success/20">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-semibold">{dd.companyName}</h2>
                    <Badge variant="success" className="gap-1">
                      <CheckCircle2 className="size-3" /> {dd.status}
                    </Badge>
                    {dd.onNextrade && (
                      <Badge variant="default" className="gap-1">
                        <BadgeCheck className="size-3" /> On NexTrade
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-foreground-secondary">
                    <span>GST: <span className="font-mono text-foreground">{dd.gstNumber}</span></span>
                    <span>CIN: <span className="font-mono text-foreground">{dd.cinNumber}</span></span>
                  </div>
                </div>
                {dd.onNextrade && dd.nextradeUid && (
                  <Button size="sm" render={<Link href={`/business/${dd.nextradeUid}`} />}>
                    View profile <ArrowRight className="size-3.5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Building2 className="size-4 text-foreground-secondary" /> Corporate info
                </h3>
                <dl className="space-y-2 text-xs">
                  <Row label="Incorporation" value={dd.incorporationDate} />
                  <Row label="Paid-up capital" value={dd.paidUpCapital} />
                  <Row label="Authorised capital" value={dd.authorisedCapital} />
                  <Row label="Last filing" value={dd.lastFilingDate} />
                  <Row label="MSME category" value={dd.msmeCategory ?? "—"} />
                  <Row label="Import/export code" value={dd.importExportCode ?? "—"} />
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <FileText className="size-4 text-foreground-secondary" /> Compliance
                </h3>
                <dl className="space-y-2 text-xs">
                  <Row label="GST status" value={
                    <Badge variant={dd.gstCompliance === "Compliant" ? "success" : "destructive"}>
                      {dd.gstCompliance}
                    </Badge>
                  } />
                  <Row label="Risk flags" value={
                    dd.riskFlags.length === 0 ? (
                      <Badge variant="success">None</Badge>
                    ) : <Badge variant="destructive">{dd.riskFlags.length}</Badge>
                  } />
                </dl>
                <div className="mt-4">
                  <div className="text-[11px] text-foreground-tertiary mb-1">Verified certifications</div>
                  <div className="flex flex-wrap gap-1">
                    {dd.verifiedCerts.map((c) => (
                      <Badge key={c} variant="outline" className="gap-1">
                        <BadgeCheck className="size-3 text-success" /> {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardContent className="pt-4">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Users className="size-4 text-foreground-secondary" /> Directors &amp; registered address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-[11px] text-foreground-tertiary mb-1">Directors</div>
                    <ul className="text-xs space-y-1">
                      {dd.directors.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[11px] text-foreground-tertiary mb-1">Registered address</div>
                    <p className="text-xs">{dd.registeredAddress}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {dd.onNextrade && (
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="size-4 text-accent" />
                  <div className="flex-1 text-xs">
                    This supplier is on NexTrade. Send an RFQ, request a quote, or view their full catalog.
                  </div>
                  <Button size="xs" render={<Link href="/register" />}>Sign up to connect</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-center gap-4 text-[11px] text-foreground-tertiary">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" /> Data refreshed 2 hours ago
            </span>
            <span className="flex items-center gap-1">
              <ExternalLink className="size-3" /> Sources: MCA, GSTN, DGFT
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-foreground-secondary">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
