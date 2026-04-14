"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package, FileText, Users, Plus, Search, Sparkles, ArrowRight, Upload, Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { BusinessCard } from "@/components/app/business-card";
import { DealConfirmationBanner } from "@/components/app/deal-confirmation-banner";
import {
  businessesApi, catalogApi, rfqsApi, discoveryApi, connectionsApi,
} from "@/lib/api";
import type { BusinessDetailDto, DiscoverBusinessDto, RfqDto } from "@/lib/types";

type DashboardStats = {
  publishedItems: number;
  openRfqs: number;
  targetedRfqs: number;
  followers: number;
};

export default function DashboardPage() {
  const { business } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [me, setMe] = useState<BusinessDetailDto | null>(null);
  const [networkRfqs, setNetworkRfqs] = useState<RfqDto[]>([]);
  const [recommended, setRecommended] = useState<DiscoverBusinessDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [meRes, published, mineOpen, targetedOpen, followers, publicRfqs, discover] =
          await Promise.all([
            businessesApi.me().catch(() => null),
            catalogApi.list({ status: "Published", pageSize: 1 }),
            rfqsApi.mine({ status: "Open", pageSize: 1 }),
            rfqsApi.targeted({ status: "Open", pageSize: 1 }),
            connectionsApi.followers().catch(() => []),
            rfqsApi.public({ status: "Open", pageSize: 3 }),
            discoveryApi.businesses({ pageSize: 3 }),
          ]);
        if (cancelled) return;
        setMe(meRes);
        setStats({
          publishedItems: published.totalCount,
          openRfqs: mineOpen.totalCount,
          targetedRfqs: targetedOpen.totalCount,
          followers: followers.length,
        });
        setNetworkRfqs(publicRfqs.items);
        setRecommended(discover.items);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const completeness = me?.profile?.profileCompleteness ?? 0;
  const completenessPct = Math.round(completeness * 100);

  const statCards = [
    { label: "Published Items", icon: Package, value: stats?.publishedItems ?? 0, href: "/catalog" },
    { label: "My Open RFQs", icon: FileText, value: stats?.openRfqs ?? 0, href: "/rfqs" },
    { label: "RFQs To Respond To", icon: Inbox, value: stats?.targetedRfqs ?? 0, href: "/rfqs" },
    { label: "Followers", icon: Users, value: stats?.followers ?? 0, href: "/suppliers" },
  ];

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

      <DealConfirmationBanner />

      {completeness < 1 && (
        <Card className="bg-linear-to-r from-accent/10 via-accent/5 to-transparent border-accent/20">
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-accent-subtle text-accent">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">
                    Your profile is {completenessPct}% complete
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
                style={{ width: `${completenessPct}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

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
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-all hover:border-border-strong hover:shadow-sm">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="size-4 text-foreground-tertiary" />
                </div>
                <div className="text-2xl font-semibold">
                  {loading ? "—" : stat.value}
                </div>
                <div className="text-xs text-foreground-secondary">{stat.label}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium">Open RFQs in your network</h2>
              <Link href="/rfqs" className="text-xs text-accent hover:underline">
                See all
              </Link>
            </div>
            <div className="space-y-2">
              {loading && (
                <Card><CardContent className="pt-3 pb-3 text-xs text-foreground-tertiary">Loading…</CardContent></Card>
              )}
              {!loading && networkRfqs.length === 0 && (
                <Card>
                  <CardContent className="pt-3 pb-3 text-xs text-foreground-tertiary">
                    No open public RFQs right now.
                  </CardContent>
                </Card>
              )}
              {networkRfqs.map((rfq) => (
                <Link key={rfq.uid} href={`/rfqs/${rfq.uid}`} className="block">
                  <Card className="transition-all hover:border-border-strong">
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-medium truncate">{rfq.title}</h3>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-foreground-tertiary mt-0.5">
                            <span>{rfq.buyerBusinessName}</span>
                            {rfq.deliveryLocation && <><span>·</span><span>{rfq.deliveryLocation}</span></>}
                            {rfq.responseDeadline && (
                              <>
                                <span>·</span>
                                <span>Due {new Date(rfq.responseDeadline).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-semibold">{rfq.quoteCount}</div>
                          <div className="text-[10px] text-foreground-tertiary">quotes</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-medium mb-3">Recommended For You</h2>
            <div className="space-y-3">
              {loading && (
                <Card><CardContent className="pt-3 pb-3 text-xs text-foreground-tertiary">Loading…</CardContent></Card>
              )}
              {!loading && recommended.length === 0 && (
                <Card>
                  <CardContent className="pt-3 pb-3 text-xs text-foreground-tertiary">
                    No recommendations yet.
                  </CardContent>
                </Card>
              )}
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
