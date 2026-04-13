"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, BadgeCheck, Star, Clock, MapPin, Calendar, Globe, Lock,
  Share2, MessageSquare, Sparkles, Trophy, Paperclip, TrendingUp, TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { mockRfqs, mockQuotes, type MockRfq } from "@/lib/mock-data";

const statusVariant: Record<MockRfq["status"], "success" | "warning" | "secondary" | "outline" | "destructive"> = {
  Open: "success",
  Awarded: "warning",
  Draft: "outline",
  Closed: "secondary",
  Cancelled: "destructive",
};

const tabs = ["overview", "quotes", "compare", "activity"] as const;

export default function RfqDetailPage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = use(params);
  const rfq = mockRfqs.find((r) => r.uid === uid) ?? mockRfqs[0];
  const quotes = mockQuotes.filter((q) => q.rfqUid === rfq.uid);
  const [tab, setTab] = useState<(typeof tabs)[number]>("overview");

  const cheapest = quotes.length > 0 ? Math.min(...quotes.map((q) => q.unitPrice)) : 0;
  const fastest = quotes.length > 0 ? Math.min(...quotes.map((q) => q.leadTimeDays)) : 0;

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" render={<Link href="/rfqs" />}>
          <ArrowLeft className="size-4" /> Back to RFQs
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-foreground-tertiary">#{rfq.uid.replace("rfq-", "")}</span>
            <Badge variant={statusVariant[rfq.status]}>{rfq.status}</Badge>
            <Badge variant="outline" className="gap-1">
              {rfq.visibility === "Public" ? <Globe className="size-3" /> : <Lock className="size-3" />}
              {rfq.visibility}
            </Badge>
          </div>
          <h1 className="text-xl font-semibold mt-1">{rfq.title}</h1>
          <p className="text-sm text-foreground-secondary max-w-2xl mt-1">{rfq.description}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-foreground-tertiary">
            <span className="flex items-center gap-1">
              <MapPin className="size-3" /> {rfq.deliveryLocation}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="size-3" /> Due {new Date(rfq.responseDeadline).toLocaleDateString()}
            </span>
            <span>{rfq.itemCount} line {rfq.itemCount === 1 ? "item" : "items"}</span>
            <span>· {rfq.category}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="size-4" /> Share link
          </Button>
          <Button size="sm">
            <Trophy className="size-4" /> Award quote
          </Button>
        </div>
      </div>

      {/* Quote stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4">
          <div className="text-2xl font-semibold">{quotes.length}</div>
          <div className="text-xs text-foreground-secondary">Quotes received</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <div className="text-2xl font-semibold">${cheapest}</div>
          <div className="text-xs text-foreground-secondary">Lowest unit price</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <div className="text-2xl font-semibold">{fastest}d</div>
          <div className="text-xs text-foreground-secondary">Shortest lead time</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <div className="text-2xl font-semibold">4</div>
          <div className="text-xs text-foreground-secondary">Invited suppliers</div>
        </CardContent></Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm capitalize border-b-2 transition-colors ${
              tab === t
                ? "border-accent text-foreground font-medium"
                : "border-transparent text-foreground-secondary hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-4">
                <h3 className="text-sm font-medium mb-3">Line items</h3>
                <div className="space-y-2">
                  {Array.from({ length: rfq.itemCount }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-border last:border-0 py-2">
                      <div>
                        <div className="text-sm font-medium">Line item {i + 1}</div>
                        <div className="text-xs text-foreground-secondary">
                          {i === 0 ? "Precision CNC bracket — 6061-T6 aluminum, ±0.02mm tolerance" : i === 1 ? "Packaging, labeling, barcode, CoC" : "Anodized finish per spec"}
                        </div>
                      </div>
                      <div className="text-xs">
                        <span className="font-medium">{i === 0 ? "500 units" : i === 1 ? "1 lot" : "500 units"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <h3 className="text-sm font-medium mb-3">Attachments</h3>
                <div className="flex flex-wrap gap-2">
                  {["drawing-v3.pdf", "spec-sheet.pdf", "terms.docx"].map((f) => (
                    <div key={f} className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-xs">
                      <Paperclip className="size-3 text-foreground-tertiary" />
                      {f}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="size-4 text-accent" />
                  <h3 className="text-sm font-medium">AI summary</h3>
                </div>
                <p className="text-xs text-foreground-secondary leading-relaxed">
                  You&apos;ve received <strong className="text-foreground">{quotes.length} quotes</strong>. Acme Metals offers the best balance of price and trust (verified, 4.9★). PrecisionCast is cheapest at $9.50 but not verified — consider requesting samples first. Lead times range from 10–21 days.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {tab === "quotes" && (
        <div className="space-y-3">
          {quotes.map((q) => (
            <Card key={q.uid} className="transition-all hover:border-border-strong">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background-secondary font-semibold">
                    {q.businessName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/business/${q.businessUid}`} className="text-sm font-medium hover:text-accent">
                        {q.businessName}
                      </Link>
                      {q.isVerified && <BadgeCheck className="size-4 text-accent" />}
                      <span className="flex items-center gap-0.5 text-xs text-foreground-secondary">
                        <Star className="size-3 fill-warning text-warning" />
                        {q.trustScore.toFixed(1)}
                      </span>
                      <Badge variant={q.status === "Shortlisted" ? "success" : q.status === "Under Review" ? "warning" : "outline"}>
                        {q.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                      <Metric label="Unit price" value={`$${q.unitPrice}`} highlight={q.unitPrice === cheapest} />
                      <Metric label="Total" value={`$${q.totalPrice.toLocaleString()}`} />
                      <Metric label="Lead time" value={`${q.leadTimeDays} days`} highlight={q.leadTimeDays === fastest} />
                      <Metric label="Terms" value={q.paymentTerms} />
                    </div>
                    <p className="text-xs text-foreground-secondary mt-3">{q.notes}</p>
                    <div className="flex items-center gap-3 text-[11px] text-foreground-tertiary mt-2">
                      <span>{q.incoterms}</span>
                      <span>· Valid until {new Date(q.validUntil).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1">
                        <Paperclip className="size-3" /> {q.attachmentCount}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button size="xs">
                      <MessageSquare className="size-3" /> Negotiate
                    </Button>
                    <Button variant="outline" size="xs">Shortlist</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "compare" && (
        <Card>
          <CardContent className="pt-4 overflow-x-auto">
            <h3 className="text-sm font-medium mb-3">Side-by-side comparison</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 pr-3 font-medium text-foreground-secondary">Criterion</th>
                  {quotes.map((q) => (
                    <th key={q.uid} className="py-2 px-2 font-medium min-w-[140px]">
                      <div className="flex items-center gap-1">
                        {q.businessName.split(" ")[0]}
                        {q.isVerified && <BadgeCheck className="size-3 text-accent" />}
                      </div>
                      <div className="text-[10px] text-foreground-tertiary font-normal">Trust {q.trustScore.toFixed(1)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <CompareRow label="Unit price" values={quotes.map((q) => `$${q.unitPrice}`)} best={quotes.findIndex((q) => q.unitPrice === cheapest)} />
                <CompareRow label="Total price" values={quotes.map((q) => `$${q.totalPrice.toLocaleString()}`)} />
                <CompareRow label="Lead time" values={quotes.map((q) => `${q.leadTimeDays}d`)} best={quotes.findIndex((q) => q.leadTimeDays === fastest)} />
                <CompareRow label="Payment terms" values={quotes.map((q) => q.paymentTerms)} />
                <CompareRow label="Incoterms" values={quotes.map((q) => q.incoterms)} />
                <CompareRow label="Verified" values={quotes.map((q) => (q.isVerified ? "Yes" : "No"))} />
                <CompareRow label="Trust score" values={quotes.map((q) => q.trustScore.toFixed(1))} />
                <CompareRow label="Valid until" values={quotes.map((q) => new Date(q.validUntil).toLocaleDateString())} />
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {tab === "activity" && (
        <Card>
          <CardContent className="pt-4">
            <ul className="divide-y divide-border">
              {[
                { when: "2026-04-13 09:42", who: "Acme Metals", what: "Sent a message: Sending revised quote shortly..." },
                { when: "2026-04-12 16:00", who: "Robotica Automation", what: "Submitted quote ($14/unit)" },
                { when: "2026-04-12 10:00", who: "Acme Metals", what: "Submitted quote ($11/unit)" },
                { when: "2026-04-11 14:00", who: "SteelWorks Global", what: "Submitted quote ($13.50/unit)" },
                { when: "2026-04-10 09:30", who: "PrecisionCast Foundry", what: "Submitted quote ($9.50/unit)" },
                { when: "2026-04-08 09:00", who: "You", what: "Published RFQ" },
              ].map((a, i) => (
                <li key={i} className="flex items-start gap-3 py-2">
                  <Clock className="size-3.5 text-foreground-tertiary mt-1 shrink-0" />
                  <div className="flex-1 text-xs">
                    <div><span className="font-medium">{a.who}</span> {a.what}</div>
                    <div className="text-[11px] text-foreground-tertiary">{a.when}</div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[11px] text-foreground-tertiary">{label}</div>
      <div className={`text-sm font-medium flex items-center gap-1 ${highlight ? "text-success" : ""}`}>
        {value}
        {highlight && <TrendingDown className="size-3" />}
      </div>
    </div>
  );
}

function CompareRow({ label, values, best }: { label: string; values: string[]; best?: number }) {
  return (
    <tr>
      <td className="py-2 pr-3 text-foreground-secondary">{label}</td>
      {values.map((v, i) => (
        <td
          key={i}
          className={`py-2 px-2 ${i === best ? "font-semibold text-success bg-success-subtle/30" : ""}`}
        >
          {v}
          {i === best && <TrendingUp className="inline size-3 ml-1" />}
        </td>
      ))}
    </tr>
  );
}
