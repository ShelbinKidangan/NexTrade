"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Package, Wrench, BadgeCheck, Star, MapPin, Clock, Package2,
  MessageSquare, FileText, Bookmark, Share2, ChevronRight, Eye, Sparkles,
  Shield, Truck, Globe, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  mockCatalogItems, mockCatalogMeta, mockBusinesses, getCatalogSeller, timeAgo,
} from "@/lib/mock-data";

const tabs = ["details", "specifications", "seller", "similar"] as const;

export default function CatalogItemDetailPage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = use(params);
  const item = mockCatalogItems.find((i) => i.uid === uid);
  const meta = mockCatalogMeta[uid];
  const seller = getCatalogSeller(uid);
  const [tab, setTab] = useState<(typeof tabs)[number]>("details");
  const [saved, setSaved] = useState(false);

  if (!item) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-foreground-secondary">Item not found</p>
        <Button variant="outline" size="sm" className="mt-4" render={<Link href="/discover" />}>
          <ArrowLeft className="size-4" /> Back to Discover
        </Button>
      </div>
    );
  }

  const [from, to] = meta?.colorGradient ?? ["#6366f1", "#8b5cf6"];
  const isService = item.type === "Service";

  const similar = mockCatalogItems
    .filter((i) => i.uid !== item.uid && i.status === "Published" && (i.category === item.category || i.type === item.type))
    .slice(0, 4);

  const otherFromSeller = mockCatalogItems
    .filter((i) => i.uid !== item.uid && i.status === "Published" && mockCatalogMeta[i.uid]?.sellerUid === meta?.sellerUid)
    .slice(0, 3);

  const price = formatPrice(item);

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 text-xs text-foreground-tertiary">
        <Link href="/discover" className="hover:text-foreground">Discover</Link>
        <ChevronRight className="size-3" />
        <Link href="/discover" className="hover:text-foreground">
          {isService ? "Services" : "Products"}
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground-secondary">{item.category}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* LEFT — main content */}
        <div className="min-w-0 space-y-6">
          {/* Hero image + gallery */}
          <div className="space-y-2">
            <div
              className="relative rounded-xl aspect-16/10 overflow-hidden flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
            >
              {isService ? (
                <Wrench className="size-20 text-white/30" />
              ) : (
                <Package className="size-20 text-white/30" />
              )}
              <div className="absolute top-3 left-3 flex gap-1.5">
                <Badge variant="default" className="bg-black/30 backdrop-blur border-0 text-white">
                  {item.type}
                </Badge>
                <Badge variant="default" className="bg-black/30 backdrop-blur border-0 text-white">
                  {item.category}
                </Badge>
              </div>
              <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md bg-black/30 backdrop-blur px-2 py-1 text-[11px] text-white">
                <Eye className="size-3" /> {item.viewCount} views
              </div>
            </div>
            {!isService && (
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-md flex items-center justify-center ${
                      i === 0 ? "ring-2 ring-accent" : ""
                    }`}
                    style={{ background: `linear-gradient(${45 + i * 30}deg, ${from}, ${to})`, opacity: i === 0 ? 1 : 0.5 }}
                  >
                    <Package className="size-4 text-white/40" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Title & price block */}
          <div>
            <h1 className="text-2xl font-semibold leading-tight">{item.title}</h1>
            {item.description && (
              <p className="text-sm text-foreground-secondary mt-2 max-w-2xl">{item.description}</p>
            )}

            {meta && meta.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {meta.tags.map((t) => (
                  <Badge key={t} variant="outline">{t}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-2 text-sm capitalize border-b-2 transition-colors ${
                  tab === t
                    ? "border-accent text-foreground font-medium"
                    : "border-transparent text-foreground-secondary hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "details" && (
            <div className="space-y-5">
              <section>
                <h3 className="text-sm font-medium mb-2">Overview</h3>
                <p className="text-sm text-foreground-secondary leading-relaxed">
                  {item.description} This {isService ? "service" : "product"} is offered by a {seller?.isVerified ? "verified" : ""} supplier on the NexTrade network with a trust score of {meta?.rating.toFixed(1)}. Pricing, lead times, and terms are subject to the seller&apos;s quote.
                </p>
              </section>

              {!isService && (
                <section>
                  <h3 className="text-sm font-medium mb-2">Order details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <InfoTile icon={<Package2 className="size-4" />} label="Min order" value={item.minOrderQuantity?.toLocaleString() ?? "—"} />
                    <InfoTile icon={<Clock className="size-4" />} label="Lead time" value={item.leadTimeDays ? `${item.leadTimeDays} days` : "Flexible"} />
                    <InfoTile icon={<Truck className="size-4" />} label="Ships from" value={seller?.city ?? "—"} />
                    <InfoTile icon={<Globe className="size-4" />} label="Delivery" value="Worldwide" />
                  </div>
                </section>
              )}

              {isService && (
                <section>
                  <h3 className="text-sm font-medium mb-2">Service scope</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <InfoTile icon={<Clock className="size-4" />} label="Turnaround" value={item.leadTimeDays ? `${item.leadTimeDays} days` : "Project-based"} />
                    <InfoTile icon={<MapPin className="size-4" />} label="Location" value={seller?.city ?? "—"} />
                    <InfoTile icon={<Shield className="size-4" />} label="Quality" value="ISO 9001" />
                    <InfoTile icon={<Globe className="size-4" />} label="Coverage" value="Global" />
                  </div>
                </section>
              )}

              <section>
                <h3 className="text-sm font-medium mb-2">What&apos;s included</h3>
                <ul className="space-y-1.5">
                  {[
                    "Detailed technical documentation and CoC",
                    "Full traceability from raw material to shipment",
                    "Quality inspection reports before dispatch",
                    "Dedicated project manager for orders over MOQ",
                    "Samples available on request",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
                      <span className="text-foreground-secondary">{line}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}

          {tab === "specifications" && (
            <Card>
              <CardContent className="pt-4">
                <h3 className="text-sm font-medium mb-3">Technical specifications</h3>
                {meta?.specifications ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                    {Object.entries(meta.specifications).map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                        <span className="text-xs text-foreground-secondary">{k}</span>
                        <span className="text-xs font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-foreground-tertiary">No specifications provided.</p>
                )}
              </CardContent>
            </Card>
          )}

          {tab === "seller" && seller && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-4">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-background-secondary text-xl font-semibold">
                      {seller.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold">{seller.name}</h3>
                        {seller.isVerified && <BadgeCheck className="size-5 text-accent" />}
                      </div>
                      <p className="text-xs text-foreground-secondary">{seller.industry}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-foreground-tertiary">
                        <span className="flex items-center gap-1"><MapPin className="size-3" /> {seller.city}, {seller.countryCode}</span>
                        <span className="flex items-center gap-0.5"><Star className="size-3 fill-warning text-warning" /> {seller.trustScore.toFixed(1)}</span>
                        <span>Joined {timeAgo(seller.createdAt)}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" render={<Link href={`/business/${seller.uid}`} />}>
                      View profile
                    </Button>
                  </div>
                  {seller.about && (
                    <p className="text-sm text-foreground-secondary leading-relaxed mt-4">{seller.about}</p>
                  )}
                  {seller.capabilities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {seller.capabilities.map((c) => (
                        <Badge key={c} variant="outline">{c}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {otherFromSeller.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Other items from {seller.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {otherFromSeller.map((o) => (
                      <Link key={o.uid} href={`/discover/item/${o.uid}`}>
                        <Card className="h-full transition-all hover:border-border-strong">
                          <CardContent className="pt-3 pb-3">
                            <Badge variant="outline" className="mb-1">{o.type}</Badge>
                            <div className="text-sm font-medium line-clamp-2">{o.title}</div>
                            <div className="text-[11px] text-foreground-tertiary mt-1">{o.category}</div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "similar" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {similar.map((s) => {
                const sMeta = mockCatalogMeta[s.uid];
                const sSeller = getCatalogSeller(s.uid);
                const sPrice = formatPrice(s);
                const [sf, st] = sMeta?.colorGradient ?? ["#6366f1", "#8b5cf6"];
                return (
                  <Link key={s.uid} href={`/discover/item/${s.uid}`}>
                    <Card className="overflow-hidden transition-all hover:border-border-strong">
                      <CardContent className="pt-0 px-0 pb-3">
                        <div
                          className="flex items-center justify-center p-6"
                          style={{ background: `linear-gradient(135deg, ${sf}, ${st})` }}
                        >
                          {s.type === "Service" ? <Wrench className="size-8 text-white/40" /> : <Package className="size-8 text-white/40" />}
                        </div>
                        <div className="px-3 pt-3">
                          <div className="text-sm font-medium line-clamp-1">{s.title}</div>
                          <div className="text-[11px] text-foreground-tertiary">{sSeller?.name}</div>
                          <div className="text-sm font-semibold mt-1">{sPrice.value}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT — sticky action panel */}
        <aside className="space-y-4">
          <Card className="sticky top-16">
            <CardContent className="pt-4 space-y-4">
              <div>
                <div className="text-[11px] text-foreground-tertiary uppercase tracking-wide">
                  {item.pricingType === "ContactForQuote" ? "Pricing" : "Starting from"}
                </div>
                <div className="text-3xl font-semibold leading-tight">{price.value}</div>
                {price.suffix && <div className="text-xs text-foreground-tertiary">{price.suffix}</div>}
              </div>

              <div className="space-y-1.5 border-t border-border pt-3">
                {item.minOrderQuantity && (
                  <KeyValue label="Min order" value={`${item.minOrderQuantity.toLocaleString()} units`} />
                )}
                {item.leadTimeDays && (
                  <KeyValue label="Lead time" value={`${item.leadTimeDays} days`} />
                )}
                {seller?.city && <KeyValue label="Ships from" value={`${seller.city}, ${seller.countryCode}`} />}
                <KeyValue label="Response rate" value="92%" />
              </div>

              <div className="space-y-2">
                <Button className="w-full" size="lg">
                  <FileText className="size-4" /> Request Quote
                </Button>
                <Button className="w-full" variant="outline" size="sm">
                  <MessageSquare className="size-4" /> Message Seller
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSaved((s) => !s)}>
                    <Bookmark className={`size-4 ${saved ? "fill-current" : ""}`} />
                    {saved ? "Saved" : "Save"}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="size-4" /> Share
                  </Button>
                </div>
              </div>

              {/* AI insight */}
              <div className="rounded-lg bg-accent/5 border border-accent/20 p-3">
                <div className="flex items-center gap-1.5 text-xs text-accent mb-1">
                  <Sparkles className="size-3" /> AI insight
                </div>
                <p className="text-[11px] text-foreground-secondary leading-relaxed">
                  Network avg for this category is <span className="font-medium text-foreground">$12.50/unit</span>. This listing is priced competitively.
                </p>
              </div>

              {seller && (
                <div className="border-t border-border pt-3">
                  <Link href={`/business/${seller.uid}`} className="flex items-center gap-2 group">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-background-secondary text-xs font-semibold">
                      {seller.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 text-xs">
                        <span className="font-medium truncate group-hover:text-accent">{seller.name}</span>
                        {seller.isVerified && <BadgeCheck className="size-3 text-accent" />}
                      </div>
                      <div className="text-[10px] text-foreground-tertiary flex items-center gap-1">
                        <Star className="size-2.5 fill-warning text-warning" />
                        {seller.trustScore.toFixed(1)} · {meta?.reviewCount} reviews
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[11px] text-foreground-tertiary">
        {icon} {label}
      </div>
      <div className="text-sm font-medium mt-0.5 truncate">{value}</div>
    </div>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-foreground-secondary">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function formatPrice(item: { pricingType: string; priceMin: number | null; priceMax: number | null; currencyCode: string | null }): { value: string; suffix: string } {
  if (item.pricingType === "ContactForQuote") return { value: "Contact for Quote", suffix: "" };
  const cur = item.currencyCode || "$";
  if (item.pricingType === "Range" && item.priceMin != null && item.priceMax != null) {
    return { value: `${cur}${item.priceMin}–${item.priceMax}`, suffix: "per unit" };
  }
  if (item.priceMin != null) return { value: `${cur}${item.priceMin}`, suffix: "per unit" };
  return { value: "—", suffix: "" };
}
