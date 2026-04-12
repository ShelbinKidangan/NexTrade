"use client";

import Link from "next/link";
import { Eye, Package, FileText, Users, Plus, Search, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";

const stats = [
  { label: "Profile Views", value: "—", icon: Eye, change: null },
  { label: "Catalog Items", value: "0", icon: Package, change: null },
  { label: "Open RFQs", value: "0", icon: FileText, change: null },
  { label: "Connections", value: "0", icon: Users, change: null },
];

export default function DashboardPage() {
  const { business } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-semibold">Welcome back, {business?.name}</h1>
        <p className="text-sm text-foreground-secondary">Here&apos;s what&apos;s happening on your NexTrade profile.</p>
      </div>

      {/* Quick Actions */}
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="size-4 text-foreground-tertiary" />
                <ArrowUpRight className="size-3 text-foreground-tertiary" />
              </div>
              <div className="text-2xl font-semibold">{stat.value}</div>
              <div className="text-xs text-foreground-secondary">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Feed */}
      <div>
        <h2 className="text-sm font-medium mb-3">Recent Activity</h2>
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="size-10 rounded-full bg-background-secondary flex items-center justify-center mb-3">
                <Eye className="size-5 text-foreground-tertiary" />
              </div>
              <p className="text-sm text-foreground-secondary">No activity yet</p>
              <p className="text-xs text-foreground-tertiary mt-1">
                Start by completing your profile and adding products to your catalog.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
