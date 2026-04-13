"use client";

import { use, useState } from "react";
import {
  BadgeCheck, Star, MapPin, Globe, Calendar, Users, ArrowLeft, MessageSquare,
  Plus, Package, Link2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { mockBusinessDetails, mockCatalogItems } from "@/lib/mock-data";

const tabs = ["about", "products", "reviews", "documents"] as const;

const reviews = [
  {
    uid: "r1",
    reviewer: "FastPack Industries",
    rating: 5,
    title: "Excellent quality, delivered on time",
    body: "Worked with them on a 5,000 unit run of CNC brackets. Quality was spot-on and they hit every milestone. Would order again.",
    verified: true,
    at: "2026-03-22",
  },
  {
    uid: "r2",
    reviewer: "LogistiX Freight",
    rating: 5,
    title: "Responsive and professional",
    body: "Got a quote within 4 hours and they accommodated our rush schedule. Excellent communication throughout.",
    verified: true,
    at: "2026-02-14",
  },
  {
    uid: "r3",
    reviewer: "ElectroCore Components",
    rating: 4,
    title: "Good work, packaging could be better",
    body: "Quality is great. Only feedback is that packaging for shipping was a bit underspec for international transit. Otherwise solid.",
    verified: true,
    at: "2026-01-30",
  },
];

const ratingBars = [
  { label: "Quality", value: 4.8 },
  { label: "Communication", value: 4.9 },
  { label: "Delivery", value: 4.7 },
  { label: "Value", value: 4.6 },
];

export default function BusinessProfilePage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = use(params);
  const business = mockBusinessDetails[uid];
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("about");

  if (!business) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-sm text-foreground-secondary">Business not found</p>
        <Button variant="outline" size="sm" className="mt-4" render={<Link href="/discover" />}>
          <ArrowLeft className="size-4" /> Back to Discover
        </Button>
      </div>
    );
  }

  const p = business.profile;
  const featuredProducts = mockCatalogItems.filter((i) => i.status === "Published").slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      {/* Banner */}
      <div className="relative h-48 rounded-xl bg-linear-to-br from-accent/20 via-accent/10 to-accent/5 border border-border overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_50%,white_0%,transparent_50%)]" />
        <div className="absolute -bottom-8 left-6 flex size-20 items-center justify-center rounded-xl bg-background border border-border text-3xl font-bold text-foreground-secondary shadow-sm">
          {business.name.charAt(0)}
        </div>
      </div>

      {/* Header */}
      <div className="pl-30 -mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{business.name}</h1>
            {business.isVerified && <BadgeCheck className="size-5 text-accent" />}
          </div>
          {p?.industry && (
            <p className="text-sm text-foreground-secondary mt-0.5">{p.industry}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-foreground-secondary">
            {p?.city && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3" />
                {p.city}{p.countryCode ? `, ${p.countryCode}` : ""}
              </span>
            )}
            {p?.yearEstablished && (
              <span className="flex items-center gap-1">
                <Calendar className="size-3" /> Est. {p.yearEstablished}
              </span>
            )}
            {p?.companySize && (
              <span className="flex items-center gap-1">
                <Users className="size-3" /> {p.companySize}
              </span>
            )}
            {p?.website && (
              <a href={p.website} target="_blank" rel="noopener" className="flex items-center gap-1 text-accent hover:underline">
                <Globe className="size-3" /> Website
              </a>
            )}
            {p?.linkedInUrl && (
              <a href={p.linkedInUrl} target="_blank" rel="noopener" className="flex items-center gap-1 text-accent hover:underline">
                <Link2 className="size-3" /> LinkedIn
              </a>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="flex items-center gap-1 font-medium">
              <Star className="size-3.5 fill-warning text-warning" />
              {business.trustScore.toFixed(1)} <span className="text-foreground-tertiary">({reviews.length} reviews)</span>
            </span>
            {p && (
              <span className="text-foreground-secondary">{p.responseRate}% response rate</span>
            )}
            {p && (
              <span className="text-foreground-secondary">~{p.avgResponseTimeHours}h avg response</span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm">
            <Plus className="size-4" /> Connect
          </Button>
          <Button variant="outline" size="sm">
            <MessageSquare className="size-4" /> Message
          </Button>
          <Button variant="outline" size="sm">Request Quote</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-sm capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? "border-accent text-foreground font-medium"
                : "border-transparent text-foreground-secondary hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* About */}
      {activeTab === "about" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {p?.about && (
              <div>
                <h3 className="text-sm font-medium mb-2">About</h3>
                <p className="text-sm text-foreground-secondary leading-relaxed">{p.about}</p>
              </div>
            )}

            {p?.capabilities && p.capabilities.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Capabilities</h3>
                <div className="flex flex-wrap gap-1.5">
                  {p.capabilities.map((cap) => (
                    <Badge key={cap} variant="outline">{cap}</Badge>
                  ))}
                </div>
              </div>
            )}

            {p?.certifications && p.certifications.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Certifications</h3>
                <div className="flex flex-wrap gap-1.5">
                  {p.certifications.map((cert) => (
                    <Badge key={cert} variant="success">{cert}</Badge>
                  ))}
                </div>
              </div>
            )}

            {p?.deliveryRegions && p.deliveryRegions.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Delivery Regions</h3>
                <div className="flex flex-wrap gap-1.5">
                  {p.deliveryRegions.map((r) => (
                    <Badge key={r} variant="secondary">{r}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="pt-4 space-y-2">
                <h3 className="text-sm font-medium mb-1">Key Facts</h3>
                {p?.industry && (
                  <div className="flex justify-between text-xs">
                    <span className="text-foreground-secondary">Industry</span>
                    <span>{p.industry}</span>
                  </div>
                )}
                {p?.companySize && (
                  <div className="flex justify-between text-xs">
                    <span className="text-foreground-secondary">Size</span>
                    <span>{p.companySize}</span>
                  </div>
                )}
                {p?.yearEstablished && (
                  <div className="flex justify-between text-xs">
                    <span className="text-foreground-secondary">Founded</span>
                    <span>{p.yearEstablished}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-foreground-secondary">Trust Score</span>
                  <span className="flex items-center gap-1">
                    <Star className="size-3 fill-warning text-warning" />
                    {business.trustScore.toFixed(1)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 space-y-2">
                <h3 className="text-sm font-medium mb-1">Locations</h3>
                {p?.city && (
                  <div className="text-xs">
                    <div className="font-medium">{p.city} (HQ)</div>
                    <div className="text-foreground-tertiary">{p.countryCode}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Products */}
      {activeTab === "products" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredProducts.map((item) => (
            <Card key={item.uid}>
              <CardContent className="pt-4">
                <div className="aspect-video rounded-lg bg-background-secondary flex items-center justify-center mb-3">
                  <Package className="size-8 text-foreground-tertiary" />
                </div>
                <h4 className="text-sm font-medium line-clamp-1">{item.title}</h4>
                {item.description && (
                  <p className="text-xs text-foreground-secondary line-clamp-2 mt-1">{item.description}</p>
                )}
                <div className="flex items-center justify-between mt-3 text-xs">
                  <Badge variant="outline">{item.type}</Badge>
                  <span className="font-medium">
                    {item.pricingType === "ContactForQuote"
                      ? "Get Quote"
                      : item.priceMin
                      ? `${item.currencyCode || "$"}${item.priceMin}${item.priceMax ? `–${item.priceMax}` : ""}`
                      : "—"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reviews */}
      {activeTab === "reviews" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 h-fit">
            <CardContent className="pt-4">
              <div className="text-center mb-4">
                <div className="text-4xl font-bold">{business.trustScore.toFixed(1)}</div>
                <div className="flex items-center justify-center gap-0.5 my-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`size-4 ${
                        s <= Math.round(business.trustScore)
                          ? "fill-warning text-warning"
                          : "text-foreground-tertiary"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-foreground-secondary">{reviews.length} reviews</div>
              </div>
              <div className="space-y-2">
                {ratingBars.map((b) => (
                  <div key={b.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-foreground-secondary">{b.label}</span>
                      <span className="font-medium">{b.value.toFixed(1)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-background-secondary overflow-hidden">
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${(b.value / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-3">
            {reviews.map((r) => (
              <Card key={r.uid}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{r.reviewer}</span>
                        {r.verified && (
                          <Badge variant="success" className="gap-1">
                            <BadgeCheck className="size-3" /> Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`size-3 ${
                              s <= r.rating ? "fill-warning text-warning" : "text-foreground-tertiary"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[11px] text-foreground-tertiary">{r.at}</span>
                  </div>
                  <h4 className="text-sm font-medium mb-1">{r.title}</h4>
                  <p className="text-xs text-foreground-secondary leading-relaxed">{r.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      {activeTab === "documents" && (
        <div className="text-center py-12">
          <p className="text-sm text-foreground-secondary">
            Compliance documents are visible to connected businesses only.
          </p>
        </div>
      )}
    </div>
  );
}
