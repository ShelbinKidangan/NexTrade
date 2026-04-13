"use client";

import Link from "next/link";
import {
  Eye, Package, FileText, Users, Plus, Search, ArrowUpRight, ArrowDownRight,
  MessageSquare, AlertTriangle, CheckCircle2, UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { BusinessCard } from "@/components/app/business-card";
import {
  mockStats, mockActivities, mockBusinesses, timeAgo, type MockActivity,
} from "@/lib/mock-data";

const stats = [
  { label: "Profile Views", icon: Eye, ...mockStats.profileViews, href: "/dashboard" },
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
        <div className="lg:col-span-2">
          <h2 className="text-sm font-medium mb-3">Recent Activity</h2>
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
        </div>

        <div>
          <h2 className="text-sm font-medium mb-3">Recommended For You</h2>
          <div className="space-y-3">
            {recommended.map((b) => (
              <BusinessCard key={b.uid} business={b} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
