"use client";

import { useState } from "react";
import {
  TrendingUp, TrendingDown, Sparkles, AlertTriangle, Eye, Package,
  Clock, Target, Lightbulb, Send, Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { mockAnalytics } from "@/lib/mock-data";

const tabs = ["supplier-insights", "buyer-intelligence", "ask-ai"] as const;
const tabLabels = {
  "supplier-insights": "Supplier Insights",
  "buyer-intelligence": "Buyer Intelligence",
  "ask-ai": "Ask AI",
} as const;

export default function IntelligencePage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("supplier-insights");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Intelligence</h1>
        <p className="text-sm text-foreground-secondary">
          Insights and analytics generated from your network activity.
        </p>
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm border-b-2 whitespace-nowrap transition-colors ${
              tab === t
                ? "border-accent text-foreground font-medium"
                : "border-transparent text-foreground-secondary hover:text-foreground"
            }`}
          >
            {tabLabels[t]}
          </button>
        ))}
      </div>

      {tab === "supplier-insights" && <SupplierInsights />}
      {tab === "buyer-intelligence" && <BuyerIntelligence />}
      {tab === "ask-ai" && <AskAi />}
    </div>
  );
}

function SupplierInsights() {
  const maxViews = Math.max(...mockAnalytics.profileViewsByWeek.map((w) => w.views));
  return (
    <div className="space-y-6">
      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={<Eye className="size-4" />} label="Profile views (30d)" value="142" delta="+12%" positive />
        <KpiCard icon={<Package className="size-4" />} label="Catalog views" value="384" delta="+5%" positive />
        <KpiCard icon={<Target className="size-4" />} label="Win rate on RFQs" value={`${mockAnalytics.rfqPerformance.winRate}%`} delta="-3%" />
        <KpiCard icon={<Clock className="size-4" />} label="Avg response time" value={`${mockAnalytics.rfqPerformance.avgResponseTimeHours}h`} delta={`vs ${mockAnalytics.rfqPerformance.networkAvgHours}h net.`} positive />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="pt-4">
            <h3 className="text-sm font-medium mb-4">Profile views — last 6 weeks</h3>
            <div className="flex items-end gap-3 h-40">
              {mockAnalytics.profileViewsByWeek.map((w) => (
                <div key={w.week} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-[11px] text-foreground-tertiary">{w.views}</div>
                  <div
                    className="w-full bg-accent/60 rounded-t-md transition-all hover:bg-accent"
                    style={{ height: `${(w.views / maxViews) * 100}%` }}
                  />
                  <div className="text-[11px] text-foreground-tertiary">{w.week}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <h3 className="text-sm font-medium mb-3">Who&apos;s viewing you</h3>
            <div className="space-y-2">
              {mockAnalytics.viewerBreakdown.map((v) => (
                <div key={v.industry}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground-secondary">{v.industry}</span>
                    <span className="font-medium">{v.percent}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-background-secondary overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${v.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-4">
            <h3 className="text-sm font-medium mb-3">Top-performing catalog items</h3>
            <ul className="space-y-2">
              {mockAnalytics.topProducts.map((p, i) => (
                <li key={p.title} className="flex items-center gap-3">
                  <span className="flex size-6 items-center justify-center rounded-full bg-background-secondary text-[11px] text-foreground-tertiary">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{p.title}</div>
                    <div className="text-[11px] text-foreground-tertiary">
                      {p.views} views · {p.inquiries} inquiries
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <h3 className="text-sm font-medium mb-3">Benchmarks vs network</h3>
            <div className="space-y-3">
              {mockAnalytics.benchmarks.map((b) => (
                <div key={b.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground-secondary">{b.label}</span>
                    <span className="text-foreground-tertiary">
                      You: <span className="font-medium text-foreground">{b.you}</span>
                      {" · "}Net: {b.network}
                    </span>
                  </div>
                  <div className="relative h-1.5 rounded-full bg-background-secondary overflow-hidden">
                    <div className="absolute inset-y-0 bg-foreground-tertiary/40" style={{ width: `${Math.min(100, b.network)}%` }} />
                    <div className="absolute inset-y-0 bg-accent" style={{ width: `${Math.min(100, b.you)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI suggestions */}
      <Card className="bg-accent/5 border-accent/20">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="size-4 text-accent" />
            <h3 className="text-sm font-medium">AI-generated suggestions</h3>
          </div>
          <div className="space-y-2">
            {mockAnalytics.suggestions.map((s) => (
              <div key={s.title} className="flex items-start gap-3 rounded-lg bg-background px-3 py-2">
                <Lightbulb className="size-4 text-warning shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{s.title}</span>
                    <Badge variant="success">{s.impact}</Badge>
                  </div>
                  <p className="text-xs text-foreground-secondary">{s.body}</p>
                </div>
                <Button variant="outline" size="xs">Apply</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BuyerIntelligence() {
  return (
    <div className="space-y-6">
      {/* Risk alerts */}
      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="size-4 text-warning" />
            <h3 className="text-sm font-medium">Risk alerts on your saved suppliers</h3>
          </div>
          <div className="space-y-2">
            {mockAnalytics.risks.map((r, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-background px-3 py-2">
                <div className={`size-2 rounded-full mt-1.5 shrink-0 ${
                  r.severity === "high" ? "bg-danger" : r.severity === "medium" ? "bg-warning" : "bg-foreground-tertiary"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{r.supplier}</div>
                  <div className="text-xs text-foreground-secondary">{r.issue}</div>
                </div>
                <Button variant="outline" size="xs">View alternatives</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demand signals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="size-4 text-success" />
              <h3 className="text-sm font-medium">Demand signals</h3>
            </div>
            <ul className="space-y-3">
              {mockAnalytics.demandSignals.map((s) => (
                <li key={s.category} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{s.category}</div>
                    <div className="text-xs text-foreground-tertiary">{s.region}</div>
                  </div>
                  <Badge variant="success" className="gap-1">
                    <TrendingUp className="size-3" /> {s.change}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="size-4 text-accent" />
              <h3 className="text-sm font-medium">Pricing benchmarks</h3>
            </div>
            <p className="text-xs text-foreground-secondary mb-3">
              Anonymized, aggregated quote data across the network.
            </p>
            <div className="space-y-2">
              {[
                { spec: "CNC Aluminum brackets — 500 units", range: "$10–14/unit", avg: "$12/unit" },
                { spec: "Stainless IP65 enclosures — 25 units", range: "$130–165", avg: "$145" },
                { spec: "Ocean freight Mumbai→Rotterdam 40HC", range: "$2.1k–2.8k", avg: "$2,450" },
              ].map((b) => (
                <div key={b.spec} className="rounded-md border border-border px-2.5 py-2">
                  <div className="text-xs font-medium">{b.spec}</div>
                  <div className="text-[11px] text-foreground-tertiary">
                    Network range {b.range} · avg <span className="text-foreground font-medium">{b.avg}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AskAi() {
  const [q, setQ] = useState("");
  const suggestions = [
    "Which of my products gets the most inquiries?",
    "Show me all RFQs I haven't responded to this week",
    "What's my average response time this month?",
    "Which competitors have ISO 14001?",
    "How does my profile compare to network averages?",
  ];
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Card className="bg-background-secondary">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="size-4 text-accent" />
            <h3 className="text-sm font-medium">Ask anything about your NexTrade data</h3>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="e.g. What's my win rate on aerospace RFQs?"
              className="h-10"
            />
            <Button className="h-10">
              <Send className="size-4" /> Ask
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <p className="text-xs text-foreground-tertiary mb-2">Try one of these:</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setQ(s)}
              className="text-xs rounded-full border border-border px-3 py-1 text-foreground-secondary hover:border-accent hover:text-foreground transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="flex size-7 items-center justify-center rounded-full bg-accent-subtle">
              <Bot className="size-4 text-accent" />
            </div>
            <div className="flex-1 text-sm">
              <p className="text-foreground-secondary mb-2">
                <span className="font-medium text-foreground">Example:</span> Your Precision CNC Machined Aluminum Bracket gets the most inquiries this month — 12 inquiries on 342 views (3.5% conversion). That&apos;s your strongest performer by both volume and conversion rate.
              </p>
              <p className="text-xs text-foreground-tertiary">
                Based on catalog analytics from the last 30 days.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  icon, label, value, delta, positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-foreground-tertiary">{icon}</span>
          <span className={`flex items-center gap-0.5 text-[11px] font-medium ${
            positive ? "text-success" : "text-foreground-secondary"
          }`}>
            {positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {delta}
          </span>
        </div>
        <div className="text-2xl font-semibold">{value}</div>
        <div className="text-xs text-foreground-secondary">{label}</div>
      </CardContent>
    </Card>
  );
}
