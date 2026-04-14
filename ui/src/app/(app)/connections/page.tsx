"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Users, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { connectionsApi } from "@/lib/api";
import type { ConnectionDto } from "@/lib/types";

type TabKey = "following" | "followers";

const tabs: { label: string; value: TabKey }[] = [
  { label: "Following", value: "following" },
  { label: "Followers", value: "followers" },
];

export default function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("following");
  const [following, setFollowing] = useState<ConnectionDto[]>([]);
  const [followers, setFollowers] = useState<ConnectionDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [fol, fr] = await Promise.all([
          connectionsApi.following(),
          connectionsApi.followers(),
        ]);
        if (cancelled) return;
        setFollowing(fol);
        setFollowers(fr);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const items = useMemo(
    () => (activeTab === "following" ? following : followers),
    [activeTab, following, followers],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Network</h1>
          <p className="text-sm text-foreground-secondary">Businesses you follow and your followers</p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map((tab) => {
          const count = tab.value === "following" ? following.length : followers.length;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-2 text-sm border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.value
                  ? "border-accent text-foreground font-medium"
                  : "border-transparent text-foreground-secondary hover:text-foreground"
              }`}
            >
              {tab.label} <span className="text-foreground-tertiary">({count})</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-4 text-sm text-foreground-tertiary text-center py-8">
            Loading…
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="size-10 rounded-full bg-background-secondary flex items-center justify-center mb-3">
                <Users className="size-5 text-foreground-tertiary" />
              </div>
              <p className="text-sm text-foreground-secondary">
                {activeTab === "following" ? "Not following any businesses yet" : "No followers yet"}
              </p>
              <p className="text-xs text-foreground-tertiary mt-1">
                Discover businesses and start building your network.
              </p>
              <Button size="sm" className="mt-4" render={<Link href="/discover" />}>
                Discover businesses
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((c) => (
            <Card key={c.uid}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-background-secondary text-foreground-secondary text-lg font-semibold">
                    {c.otherLogo ? (
                      <img src={c.otherLogo} alt="" className="size-12 rounded-lg object-cover" />
                    ) : (
                      c.otherName.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/business/${c.otherUid}`}
                        className="text-sm font-medium truncate hover:underline"
                      >
                        {c.otherName}
                      </Link>
                      {c.otherVerified && <BadgeCheck className="size-4 shrink-0 text-accent" />}
                    </div>
                    {c.otherCountry && (
                      <p className="text-[11px] text-foreground-tertiary mt-0.5">{c.otherCountry}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="xs" className="flex-1">
                    <MessageSquare className="size-3" /> Message
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    className="flex-1"
                    render={<Link href={`/business/${c.otherUid}`} />}
                  >
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
