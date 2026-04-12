"use client";

import { useState, useEffect, use } from "react";
import { BadgeCheck, Star, MapPin, Globe, Calendar, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { businessesApi } from "@/lib/api";
import type { BusinessDetailDto } from "@/lib/types";

export default function BusinessProfilePage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = use(params);
  const [business, setBusiness] = useState<BusinessDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    businessesApi.get(uid).then(setBusiness).catch(() => {}).finally(() => setLoading(false));
  }, [uid]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-6">
        <div className="h-48 rounded-xl bg-background-secondary animate-pulse mb-4" />
        <div className="h-8 w-48 bg-background-secondary animate-pulse rounded" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-16 text-center">
        <p className="text-sm text-foreground-secondary">Business not found</p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link href="/discover"><ArrowLeft className="size-4" /> Back to Discover</Link>
        </Button>
      </div>
    );
  }

  const p = business.profile;
  const tabs = ["about", "products", "reviews"];

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 space-y-6">
      {/* Banner */}
      <div className="relative h-40 rounded-xl bg-gradient-to-r from-accent/10 to-accent/5 border border-border">
        <div className="absolute -bottom-8 left-6 flex size-16 items-center justify-center rounded-xl bg-background border border-border text-2xl font-bold text-foreground-secondary">
          {p?.logo ? <img src={p.logo} alt="" className="size-16 rounded-xl object-cover" /> : business.name.charAt(0)}
        </div>
      </div>

      {/* Header */}
      <div className="pl-24">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">{business.name}</h1>
          {business.isVerified && <BadgeCheck className="size-5 text-accent" />}
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-foreground-secondary">
          {p?.city && <span className="flex items-center gap-1"><MapPin className="size-3" />{p.city}{p.countryCode ? `, ${p.countryCode}` : ""}</span>}
          {p?.yearEstablished && <span className="flex items-center gap-1"><Calendar className="size-3" />Est. {p.yearEstablished}</span>}
          {p?.companySize && <span className="flex items-center gap-1"><Users className="size-3" />{p.companySize}</span>}
          {p?.website && <a href={p.website} target="_blank" rel="noopener" className="flex items-center gap-1 text-accent hover:underline"><Globe className="size-3" />Website</a>}
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs">
          {business.trustScore > 0 && (
            <span className="flex items-center gap-1"><Star className="size-3 fill-warning text-warning" />{business.trustScore.toFixed(1)}</span>
          )}
          {p?.responseRate !== undefined && p.responseRate > 0 && (
            <span className="text-foreground-secondary">{p.responseRate}% response rate</span>
          )}
        </div>
        <div className="flex gap-2 mt-3">
          <Button size="sm">Connect</Button>
          <Button variant="outline" size="sm">Send Message</Button>
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

      {/* Tab content */}
      {activeTab === "about" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {p?.about && <p className="text-sm text-foreground-secondary leading-relaxed">{p.about}</p>}

            {p?.capabilities && p.capabilities.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Capabilities</h3>
                <div className="flex flex-wrap gap-1.5">
                  {p.capabilities.map((cap) => <Badge key={cap} variant="outline">{cap}</Badge>)}
                </div>
              </div>
            )}

            {p?.certifications && p.certifications.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Certifications</h3>
                <div className="flex flex-wrap gap-1.5">
                  {p.certifications.map((cert) => <Badge key={cert} variant="success">{cert}</Badge>)}
                </div>
              </div>
            )}
          </div>

          <Card>
            <CardContent className="pt-4 space-y-3">
              <h3 className="text-sm font-medium">Key Facts</h3>
              {p?.industry && <div className="flex justify-between text-xs"><span className="text-foreground-secondary">Industry</span><span>{p.industry}</span></div>}
              {p?.companySize && <div className="flex justify-between text-xs"><span className="text-foreground-secondary">Size</span><span>{p.companySize}</span></div>}
              {p?.yearEstablished && <div className="flex justify-between text-xs"><span className="text-foreground-secondary">Founded</span><span>{p.yearEstablished}</span></div>}
              {p?.deliveryRegions && p.deliveryRegions.length > 0 && (
                <div>
                  <span className="text-xs text-foreground-secondary">Delivery Regions</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.deliveryRegions.map((r) => <Badge key={r} variant="outline" className="text-[10px]">{r}</Badge>)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "products" && (
        <div className="text-center py-12">
          <p className="text-sm text-foreground-secondary">No products listed yet</p>
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="text-center py-12">
          <p className="text-sm text-foreground-secondary">No reviews yet</p>
        </div>
      )}
    </div>
  );
}
