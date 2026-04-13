"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, BadgeCheck, MapPin, Globe, Calendar, Users, Package, ShieldCheck,
  Bookmark, BookmarkCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { connectionsApi, discoveryApi, savedSuppliersApi, session } from "@/lib/api";
import type { FollowStatusDto, PublicBusinessProfileDto, SavedSupplierDto } from "@/lib/types";

export default function PublicBusinessPage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = use(params);
  const [profile, setProfile] = useState<PublicBusinessProfileDto | null>(null);
  const [follow, setFollow] = useState<FollowStatusDto | null>(null);
  const [savedEntry, setSavedEntry] = useState<SavedSupplierDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authed = typeof window !== "undefined" && session.hasTenant();

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [p, f] = await Promise.all([
        discoveryApi.publicProfile(uid),
        connectionsApi.followStatus(uid),
      ]);
      setProfile(p);
      setFollow(f);
      if (authed) {
        try {
          const saved = await savedSuppliersApi.list();
          setSavedEntry(saved.find((s) => s.supplierUid === uid) ?? null);
        } catch {
          setSavedEntry(null);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [uid, authed]);

  useEffect(() => { void reload(); }, [reload]);

  async function toggleFollow() {
    if (!authed) {
      window.location.href = "/login";
      return;
    }
    if (follow?.isFollowing) {
      await connectionsApi.unfollow(uid);
    } else {
      await connectionsApi.follow(uid);
    }
    setFollow(await connectionsApi.followStatus(uid));
  }

  async function toggleSave() {
    if (!authed) {
      window.location.href = "/login";
      return;
    }
    if (savedEntry) {
      await savedSuppliersApi.remove(savedEntry.uid);
      setSavedEntry(null);
    } else {
      const created = await savedSuppliersApi.save({ supplierUid: uid });
      setSavedEntry(created);
    }
  }

  if (loading) return <div className="p-6 text-sm text-foreground-secondary">Loading…</div>;
  if (!profile) return <div className="p-6 text-sm text-danger">{error ?? "Business not found"}</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <Button variant="ghost" size="sm" render={<Link href="/discover" />}>
        <ArrowLeft className="size-4" /> Back to discover
      </Button>

      <Card>
        <CardContent className="pt-5">
          <div className="flex items-start gap-4">
            <div className="flex size-16 items-center justify-center rounded-xl bg-background-secondary text-xl font-semibold">
              {profile.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.logo} alt={profile.name} className="size-full rounded-xl object-cover" />
              ) : (
                profile.name.charAt(0)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold">{profile.name}</h1>
                {profile.isVerified && <BadgeCheck className="size-5 text-accent" />}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-foreground-secondary mt-1">
                {profile.industry && <span>{profile.industry}</span>}
                {profile.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" /> {profile.city}
                    {profile.countryCode && `, ${profile.countryCode}`}
                  </span>
                )}
                {profile.yearEstablished > 0 && (
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" /> Est. {profile.yearEstablished}
                  </span>
                )}
                {profile.companySize && (
                  <span className="flex items-center gap-1">
                    <Users className="size-3" /> {profile.companySize}
                  </span>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noreferrer"
                     className="flex items-center gap-1 hover:text-accent">
                    <Globe className="size-3" /> Website
                  </a>
                )}
              </div>
              {profile.about && (
                <p className="text-sm text-foreground-secondary mt-3 max-w-2xl">{profile.about}</p>
              )}

              <div className="flex gap-2 mt-4">
                <Button size="sm" variant={follow?.isFollowing ? "outline" : "default"} onClick={toggleFollow}>
                  {follow?.isFollowing ? "Following" : "Follow"}
                </Button>
                <Button size="sm" variant="outline" onClick={toggleSave}>
                  {savedEntry ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
                  {savedEntry ? "Saved" : "Save supplier"}
                </Button>
                <span className="text-xs text-foreground-tertiary self-center">
                  {follow?.followerCount ?? profile.followerCount} followers
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="text-sm font-medium">Trust Score</div>
              <div className="text-lg font-bold">{profile.trustScore.toFixed(1)}</div>
              <Badge variant={profile.hasComplianceDocs ? "success" : "outline"} className="gap-1">
                <ShieldCheck className="size-3" />
                {profile.hasComplianceDocs ? "Compliance verified" : "Compliance pending"}
              </Badge>
            </div>
          </div>

          {profile.capabilities.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <h2 className="text-xs font-medium text-foreground-secondary mb-2">Capabilities</h2>
              <div className="flex flex-wrap gap-1">
                {profile.capabilities.map((c) => (
                  <Badge key={c} variant="outline">{c}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-base font-semibold mb-2">Published items ({profile.publishedItemCount})</h2>
        {profile.items.length === 0 ? (
          <Card><CardContent className="pt-4 pb-4 text-center">
            <p className="text-sm text-foreground-secondary">No published items yet.</p>
          </CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {profile.items.map((item) => (
              <Link key={item.uid} href={`/discover/item/${item.uid}`}>
                <Card className="h-full transition-all hover:border-border-strong">
                  <CardContent className="pt-3">
                    <div className="aspect-video rounded-md bg-background-secondary mb-2 overflow-hidden flex items-center justify-center">
                      {item.primaryImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.primaryImageUrl} alt={item.title} className="size-full object-cover" />
                      ) : (
                        <Package className="size-5 text-foreground-tertiary" />
                      )}
                    </div>
                    <h3 className="text-sm font-medium line-clamp-1">{item.title}</h3>
                    {item.description && (
                      <p className="text-xs text-foreground-secondary line-clamp-2 mt-0.5">{item.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-foreground-tertiary mt-2">
                      <Badge variant="outline" className="text-[10px]">{item.type}</Badge>
                      {item.category && <span>{item.category}</span>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
