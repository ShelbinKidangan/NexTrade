"use client";

import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function ConnectionsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Network</h1>
      </div>

      <div className="flex gap-1 border-b border-border">
        {["Connections", "Following", "Followers", "Requests"].map((tab, i) => (
          <button
            key={tab}
            className={`px-3 py-2 text-sm border-b-2 transition-colors ${
              i === 0 ? "border-accent text-foreground font-medium" : "border-transparent text-foreground-secondary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-10 rounded-full bg-background-secondary flex items-center justify-center mb-3">
              <Users className="size-5 text-foreground-tertiary" />
            </div>
            <p className="text-sm text-foreground-secondary">No connections yet</p>
            <p className="text-xs text-foreground-tertiary mt-1">Discover businesses and start building your network.</p>
            <Button size="sm" className="mt-4" asChild>
              <Link href="/discover">Discover businesses</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
