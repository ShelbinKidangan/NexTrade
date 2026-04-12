"use client";

import Link from "next/link";
import { BadgeCheck, Star, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BusinessDto } from "@/lib/types";

export function BusinessCard({ business }: { business: BusinessDto }) {
  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-all hover:border-border-strong hover:shadow-md">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-background-secondary text-foreground-secondary font-semibold text-lg">
          {business.logo ? (
            <img src={business.logo} alt="" className="size-12 rounded-lg object-cover" />
          ) : (
            business.name.charAt(0)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-medium truncate">{business.name}</h3>
            {business.isVerified && (
              <BadgeCheck className="size-4 shrink-0 text-accent" />
            )}
          </div>
          {business.industry && (
            <p className="text-xs text-foreground-secondary truncate">{business.industry}</p>
          )}
        </div>
      </div>

      {/* About snippet */}
      {business.about && (
        <p className="text-xs text-foreground-secondary line-clamp-2 mb-3">{business.about}</p>
      )}

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-foreground-tertiary mb-3">
        {business.city && (
          <span className="flex items-center gap-1">
            <MapPin className="size-3" />
            {business.city}{business.countryCode ? `, ${business.countryCode}` : ""}
          </span>
        )}
        {business.trustScore > 0 && (
          <span className="flex items-center gap-1">
            <Star className="size-3 fill-warning text-warning" />
            {business.trustScore.toFixed(1)}
          </span>
        )}
      </div>

      {/* Capabilities */}
      {business.capabilities.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {business.capabilities.slice(0, 3).map((cap) => (
            <Badge key={cap} variant="outline" className="text-[10px] h-4 px-1.5">
              {cap}
            </Badge>
          ))}
          {business.capabilities.length > 3 && (
            <Badge variant="outline" className="text-[10px] h-4 px-1.5">
              +{business.capabilities.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto flex gap-2 pt-2 border-t border-border">
        <Button variant="outline" size="xs" className="flex-1" asChild>
          <Link href={`/business/${business.uid}`}>View</Link>
        </Button>
        <Button size="xs" className="flex-1">Connect</Button>
      </div>
    </div>
  );
}
