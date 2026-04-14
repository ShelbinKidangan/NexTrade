"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { admin, type AdminOverview, type AdminTimeseriesPoint } from "@/lib/api";
import { Building2, Package, FileText, Handshake, Users, Clock, ShieldCheck } from "lucide-react";

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [series, setSeries] = useState<AdminTimeseriesPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    admin.metricsOverview().then(setOverview).catch((e) => setError(String(e)));
    admin.metricsTimeseries("businesses", 30).then(setSeries).catch(() => {});
  }, []);

  if (error) return <div className="text-sm text-destructive">{error}</div>;
  if (!overview) return <div className="text-sm text-foreground-secondary">Loading metrics...</div>;

  const maxSeries = Math.max(1, ...series.map((p) => p.value));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Platform overview</h1>
        <p className="text-sm text-foreground-secondary">
          Cross-tenant KPIs across businesses, catalog, RFQs, and trust.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi icon={<Building2 className="size-4" />} label="Businesses" value={overview.businessesTotal} delta={`+${overview.businessesLast30d} / 30d`} />
        <Kpi icon={<ShieldCheck className="size-4" />} label="Verified" value={`${overview.verifiedBusinesses}`} delta={`${overview.verifiedRate}% rate`} />
        <Kpi icon={<Package className="size-4" />} label="Published items" value={overview.publishedItems} />
        <Kpi icon={<FileText className="size-4" />} label="Open RFQs" value={overview.openRfqs} />
        <Kpi icon={<Handshake className="size-4" />} label="Deals confirmed" value={overview.dealsConfirmed} />
        <Kpi icon={<Users className="size-4" />} label="MAU" value={overview.activeUsersMonthly} />
        <Kpi icon={<Clock className="size-4" />} label="Avg quote (h)" value={overview.avgQuoteResponseHours} />
      </div>

      <Card>
        <CardContent className="pt-6 pb-6">
          <div className="mb-3 text-sm font-medium">Trust score distribution</div>
          <div className="space-y-2">
            {overview.trustDistribution.map((b) => {
              const max = Math.max(1, ...overview.trustDistribution.map((x) => x.count));
              const pct = (b.count / max) * 100;
              return (
                <div key={b.range} className="flex items-center gap-3 text-xs">
                  <div className="w-14 text-foreground-secondary">{b.range}</div>
                  <div className="flex-1 h-4 rounded bg-background-secondary overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-10 text-right tabular-nums">{b.count}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 pb-6">
          <div className="mb-3 text-sm font-medium">New businesses — last 30 days</div>
          <div className="flex items-end gap-1 h-24">
            {series.map((p) => (
              <div key={p.date} title={`${p.date}: ${p.value}`}
                className="flex-1 bg-accent/60 rounded-sm min-h-0.5"
                style={{ height: `${(p.value / maxSeries) * 100}%` }} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({ icon, label, value, delta }: { icon: React.ReactNode; label: string; value: number | string; delta?: string }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 text-foreground-tertiary text-xs">
          {icon} {label}
        </div>
        <div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
        {delta && <div className="text-[11px] text-foreground-tertiary mt-0.5">{delta}</div>}
      </CardContent>
    </Card>
  );
}
