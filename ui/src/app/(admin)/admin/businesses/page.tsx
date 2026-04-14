"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { admin, type AdminBusinessRow } from "@/lib/api";

export default function AdminBusinessesPage() {
  const [rows, setRows] = useState<AdminBusinessRow[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await admin.listBusinesses({
      search: search || undefined, status: status || undefined, page: 1, pageSize: 50,
    });
    setRows(r.items);
    setLoading(false);
  }, [search, status]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Businesses</h1>
        <p className="text-sm text-foreground-secondary">Every tenant on the platform.</p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="h-8 rounded-md border border-input bg-transparent px-2 text-sm">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="deleted">Deleted</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>
      </div>

      <Card>
        <CardContent className="pt-4 pb-4">
          {loading ? (
            <div className="text-sm text-foreground-secondary">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs text-foreground-tertiary border-b border-border">
                <tr>
                  <th className="text-left py-2">Business</th>
                  <th className="text-left py-2">Industry</th>
                  <th className="text-left py-2">Country</th>
                  <th className="text-left py-2">Trust</th>
                  <th className="text-left py-2">Items</th>
                  <th className="text-left py-2">RFQs</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.uid} className="border-b border-border/40 hover:bg-background-secondary/30">
                    <td className="py-2">
                      <Link href={`/admin/businesses/${r.uid}`} className="hover:underline">
                        {r.name}
                      </Link>
                      {r.isVerified && <Badge variant="success" className="ml-2">Verified</Badge>}
                    </td>
                    <td className="py-2">{r.industry ?? "—"}</td>
                    <td className="py-2">{r.country ?? "—"}</td>
                    <td className="py-2 tabular-nums">{r.trustScore.toFixed(1)}</td>
                    <td className="py-2 tabular-nums">{r.publishedItemCount}</td>
                    <td className="py-2 tabular-nums">{r.openRfqCount}</td>
                    <td className="py-2">
                      {!r.isActive ? (
                        <Badge variant="destructive">Deleted</Badge>
                      ) : r.isSuspended ? (
                        <Badge variant="destructive">Suspended</Badge>
                      ) : (
                        <Badge variant="outline">Active</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
