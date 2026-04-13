"use client";

import Link from "next/link";
import {
  Eye, Package, FileText, Users, Plus, Search, ArrowUpRight, ArrowDownRight,
  MessageSquare, AlertTriangle, CheckCircle2, UserPlus, Sparkles, ArrowRight,
  TrendingUp, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { BusinessCard } from "@/components/app/business-card";
import {
  mockStats, mockActivities, mockBusinesses, mockProfileCompleteness,
  mockAnalytics, mockRfqs, timeAgo, type MockActivity,
} from "@/lib/mock-data";

const stats = [
  { label: "Profile Views", icon: Eye, ...mockStats.profileViews, href: "/intelligence" },
  { label: "Catalog Views", icon: Package, ...mockStats.catalogViews, href: "/catalog" },
  { label: "Open RFQs", icon: FileText, ...mockStats.openRfqs, href: "/rfqs" },
  { label: "Quotes Received", icon: Users, ...mockStats.quotesReceived, href: "/rfqs" },
];

function ActivityIcon({ type }: { type: MockActivity["type"] }) {
  const map = {
    view: <Eye className="size-3.5 text-foreground-secondary" />,
    quote: <CheckCircle2 className="size-3.5 text-success" />,
    follow: <UserPlus className="size-3.5 text-accent" />,
    cert: <AlertTriangle className="size-3.5 text-warning" />,
    message: <MessageSquare className="size-3.5 text-foreground-secondary" />,
  };
  return (
    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-background-secondary">
      {map[type]}
    </div>
  );
}

export default function DashboardPage() {
  const { business } = useAuth();
  const recommended = mockBusinesses.slice(0, 3);
  const openRfqs = mockRfqs.filter((r) => r.status === "Open").slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">
          Welcome back{business?.name ? `, ${business.name}` : ""}
        </h1>
        <p className="text-sm text-foreground-secondary">
          Here&apos;s what&apos;s happening on your NexTrade profile.
        </p>
      </div>

      {/* Profile completeness banner */}
      <Card className="bg-linear-to-r from-accent/10 via-accent/5 to-transparent border-accent/20">
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-accent-subtle text-accent">
                <Sparkles className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-medium">
                  Your profile is {mockProfileCompleteness.score}% complete
                </h3>
                <p className="text-xs text-foreground-secondary">
                  Businesses with 80%+ profiles get 3× more inquiries.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" render={<Link href="/profile" />}>
              Complete profile <ArrowRight className="size-3.5" />
            </Button>
          </div>
          <div className="h-1.5 rounded-full bg-background-secondary overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-accent to-accent/70"
              style={{ width: `${mockProfileCompleteness.score}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button render={<Link href="/catalog/new" />}>
          <Plus className="size-4" /> Add Product
        </Button>
        <Button variant="outline" render={<Link href="/rfqs" />}>
          <FileText className="size-4" /> Create RFQ
        </Button>
        <Button variant="outline" render={<Link href="/discover" />}>
          <Search className="size-4" /> Discover Businesses
        </Button>
        <Button variant="outline" render={<Link href="/compliance" />}>
          <Upload className="size-4" /> Upload Compliance Doc
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const positive = stat.change >= 0;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="transition-all hover:border-border-strong hover:shadow-sm">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className="size-4 text-foreground-tertiary" />
                    {stat.change !== 0 && (
                      <span
                        className={`flex items-center gap-0.5 text-[11px] font-medium ${
                          positive ? "text-success" : "text-danger"
                        }`}
                      >
                        {positive ? (
                          <ArrowUpRight className="size-3" />
                        ) : (
                          <ArrowDownRight className="size-3" />
                        )}
                        {Math.abs(stat.change)}%
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-semibold">{stat.value}</div>
                  <div className="text-xs text-foreground-secondary">{stat.label}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium">Recent Activity</h2>
              <Link href="/intelligence" className="text-xs text-accent hover:underline">
                See all
              </Link>
            </div>
            <Card>
              <CardContent className="pt-2 pb-2">
                <ul className="divide-y divide-border">
                  {mockActivities.map((a) => (
                    <li key={a.uid} className="flex items-start gap-3 py-3">
                      <ActivityIcon type={a.type} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          {a.subject && (
                            <span className="font-medium">{a.subject} </span>
                          )}
                          <span className="text-foreground-secondary">{a.text}</span>
                        </p>
                        <p className="text-[11px] text-foreground-tertiary">{timeAgo(a.at)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium">Open RFQs in your network</h2>
              <Link href="/rfqs" className="text-xs text-accent hover:underline">
                See all
              </Link>
            </div>
            <div className="space-y-2">
              {openRfqs.map((rfq) => (
                <Card key={rfq.uid} className="transition-all hover:border-border-strong">
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium truncate">{rfq.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-foreground-tertiary mt-0.5">
                          <span>{rfq.category}</span>
                          <span>·</span>
                          <span>{rfq.deliveryLocation}</span>
                          <span>·</span>
                          <span>Due {new Date(rfq.responseDeadline).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold">{rfq.quoteCount}</div>
                        <div className="text-[10px] text-foreground-tertiary">quotes</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {/* Risk alerts */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium">Risk alerts</h2>
              <Link href="/intelligence" className="text-xs text-accent hover:underline">
                See all
              </Link>
            </div>
            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="pt-3 pb-3 space-y-2">
                {mockAnalytics.risks.slice(0, 3).map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <AlertTriangle className={`size-3.5 shrink-0 mt-0.5 ${
                      r.severity === "high" ? "text-danger" : r.severity === "medium" ? "text-warning" : "text-foreground-tertiary"
                    }`} />
                    <div className="text-xs">
                      <div className="font-medium">{r.supplier}</div>
                      <div className="text-foreground-secondary">{r.issue}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          {/* Demand signals */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium">Demand signals</h2>
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="size-3" /> Live
              </Badge>
            </div>
            <Card>
              <CardContent className="pt-3 pb-3 space-y-2">
                {mockAnalytics.demandSignals.map((s) => (
                  <div key={s.category} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate">{s.category}</div>
                      <div className="text-[11px] text-foreground-tertiary">{s.region}</div>
                    </div>
                    <Badge variant="success">{s.change}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          {/* Recommended */}
          <section>
            <h2 className="text-sm font-medium mb-3">Recommended For You</h2>
            <div className="space-y-3">
              {recommended.map((b) => (
                <BusinessCard key={b.uid} business={b} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
