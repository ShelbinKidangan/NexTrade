"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, MapPin, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { connectionsApi, discoveryApi, session } from "@/lib/api";
import type { DiscoverItemDto, FollowStatusDto } from "@/lib/types";

export default function DiscoverItemPage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = use(params);
  const [item, setItem] = useState<DiscoverItemDto | null>(null);
  const [status, setStatus] = useState<FollowStatusDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authed = typeof window !== "undefined" && session.hasTenant();

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        // The discovery endpoint returns a batch — fetch and find by uid.
        const result = await discoveryApi.items({ page: 1, pageSize: 100 });
        const found = result.items.find((i) => i.uid === uid) ?? null;
        if (!cancelled) setItem(found);
        if (found) {
          const s = await connectionsApi.followStatus(found.supplierUid);
          if (!cancelled) setStatus(s);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => { cancelled = true; };
  }, [uid]);

  async function toggleFollow() {
    if (!item) return;
    if (!authed) {
      window.location.href = "/login";
      return;
    }
    if (status?.isFollowing) {
      await connectionsApi.unfollow(item.supplierUid);
    } else {
      await connectionsApi.follow(item.supplierUid);
    }
    setStatus(await connectionsApi.followStatus(item.supplierUid));
  }

  if (loading) return <p className="text-sm text-foreground-secondary">Loading…</p>;
  if (!item) return <p className="text-sm text-danger">{error ?? "Item not found"}</p>;

  const price =
    item.pricingType === "ContactForQuote"
      ? "Contact for quote"
      : item.priceMax
      ? `${item.currencyCode ?? ""} ${item.priceMin}–${item.priceMax}`
      : item.priceMin
      ? `${item.currencyCode ?? ""} ${item.priceMin}`
      : "—";

  return (
    <div className="max-w-3xl space-y-4">
      <Button variant="ghost" size="sm" render={<Link href="/discover" />}>
        <ArrowLeft className="size-4" /> Back to discover
      </Button>

      <Card>
        <CardContent className="pt-4">
          <div className="aspect-video rounded-md bg-background-secondary mb-3 overflow-hidden flex items-center justify-center">
            {item.primaryImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.primaryImageUrl} alt={item.title} className="size-full object-cover" />
            ) : (
              <Package className="size-8 text-foreground-tertiary" />
            )}
          </div>

          <div className="flex items-start gap-2">
            <div className="flex-1">
              <h1 className="text-lg font-semibold">{item.title}</h1>
              <div className="flex items-center gap-2 text-xs text-foreground-secondary mt-0.5">
                <Badge variant="outline">{item.type}</Badge>
                {item.category && <span>{item.category}</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{price}</div>
              {item.leadTimeDays != null && (
                <div className="text-xs text-foreground-tertiary">Lead time: {item.leadTimeDays}d</div>
              )}
            </div>
          </div>

          {item.description && (
            <p className="text-sm text-foreground-secondary mt-3 whitespace-pre-wrap">{item.description}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <h2 className="text-sm font-medium mb-2">Supplier</h2>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-background-secondary font-semibold">
              {item.supplierName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <Link href={`/business/${item.supplierUid}`} className="text-sm font-medium hover:text-accent truncate">
                  {item.supplierName}
                </Link>
                {item.supplierVerified && <BadgeCheck className="size-4 text-accent" />}
              </div>
              {item.supplierCountry && (
                <div className="flex items-center gap-1 text-xs text-foreground-tertiary">
                  <MapPin className="size-3" /> {item.supplierCountry}
                </div>
              )}
            </div>
            <Button size="sm" variant={status?.isFollowing ? "outline" : "default"} onClick={toggleFollow}>
              {status?.isFollowing ? "Following" : "Follow"}
            </Button>
          </div>
          {status && (
            <p className="text-[11px] text-foreground-tertiary mt-2">{status.followerCount} followers</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
