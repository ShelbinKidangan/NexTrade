"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BadgeCheck, MapPin, Users, Star, MessageSquare, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockConnections, type MockConnection } from "@/lib/mock-data";

const tabs = [
  { label: "Connections", value: "Connection" as const },
  { label: "Following", value: "Following" as const },
  { label: "Followers", value: "Follower" as const },
  { label: "Requests", value: "Request" as const },
];

export default function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState<MockConnection["type"]>("Connection");

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const x of mockConnections) c[x.type] = (c[x.type] ?? 0) + 1;
    return c;
  }, []);

  const items = useMemo(
    () => mockConnections.filter((c) => c.type === activeTab),
    [activeTab]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Network</h1>
          <p className="text-sm text-foreground-secondary">Your connections, followers, and pending requests</p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-3 py-2 text-sm border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.value
                ? "border-accent text-foreground font-medium"
                : "border-transparent text-foreground-secondary hover:text-foreground"
            }`}
          >
            {tab.label} <span className="text-foreground-tertiary">({counts[tab.value] ?? 0})</span>
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="size-10 rounded-full bg-background-secondary flex items-center justify-center mb-3">
                <Users className="size-5 text-foreground-tertiary" />
              </div>
              <p className="text-sm text-foreground-secondary">Nothing here yet</p>
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
                    {c.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/business/${c.businessUid}`}
                        className="text-sm font-medium truncate hover:underline"
                      >
                        {c.name}
                      </Link>
                      {c.isVerified && <BadgeCheck className="size-4 shrink-0 text-accent" />}
                    </div>
                    <p className="text-xs text-foreground-secondary truncate">{c.industry}</p>
                    <p className="text-[11px] text-foreground-tertiary flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3" /> {c.city}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  {c.isPreferred && (
                    <Badge variant="warning" className="gap-1">
                      <Star className="size-3 fill-current" /> Preferred
                    </Badge>
                  )}
                  <span className="text-[11px] text-foreground-tertiary">
                    {c.mutualCount} mutual
                  </span>
                </div>

                <div className="flex gap-2 pt-2 border-t border-border">
                  {c.type === "Request" ? (
                    <>
                      <Button size="xs" className="flex-1">
                        <Check className="size-3" /> Accept
                      </Button>
                      <Button variant="outline" size="xs" className="flex-1">
                        <X className="size-3" /> Decline
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="xs" className="flex-1">
                        <MessageSquare className="size-3" /> Message
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        className="flex-1"
                        render={<Link href={`/business/${c.businessUid}`} />}
                      >
                        View
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
