"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { quotesApi } from "@/lib/api";
import type { ComparisonDto } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function CompareQuotesPage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = use(params);
  const router = useRouter();
  const [data, setData] = useState<ComparisonDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    quotesApi
      .comparison(uid)
      .then((d) => setData(d))
      .catch((e) => setError(e.message ?? "Failed to load comparison"))
      .finally(() => setLoading(false));
  }, [uid]);

  async function handleAward(quoteUid: string) {
    if (!confirm("Award this quote? This will reject all other quotes and move the RFQ to Awarded.")) return;
    setBusy(true);
    try {
      await quotesApi.award(uid, quoteUid);
      router.push(`/rfqs/${uid}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to award");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="text-sm text-foreground-secondary">Loading…</p>;
  if (error || !data) return <p className="text-sm text-danger">{error || "No data"}</p>;

  const lowestTotal = Math.min(...data.quotes.map((q) => q.totalAmount ?? Infinity));

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" render={<Link href={`/rfqs/${uid}`} />}>
        <ArrowLeft className="size-4" /> Back to RFQ
      </Button>
      <div>
        <h1 className="text-xl font-semibold">Compare quotes</h1>
        <p className="text-sm text-foreground-secondary">{data.rfqTitle}</p>
      </div>

      {data.quotes.length === 0 ? (
        <Card><CardContent className="pt-4">
          <p className="text-sm text-foreground-secondary">No quotes submitted yet.</p>
        </CardContent></Card>
      ) : (
        <Card>
          <CardContent className="pt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 pr-3 font-medium text-foreground-secondary">Criterion</th>
                  {data.quotes.map((q) => (
                    <th key={q.uid} className="py-2 px-3 font-medium min-w-[160px]">
                      <div className="flex items-center gap-1">
                        {q.supplierBusinessName}
                        {q.supplierVerified && <BadgeCheck className="size-3 text-accent" />}
                      </div>
                      <div className="text-[10px] text-foreground-tertiary font-normal">
                        Trust {q.supplierTrustScore?.toFixed?.(1) ?? "—"}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-2 pr-3 text-foreground-secondary">Status</td>
                  {data.quotes.map((q) => (
                    <td key={q.uid} className="py-2 px-3">
                      <Badge variant={q.status === "Accepted" ? "success" : "outline"}>{q.status}</Badge>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 pr-3 text-foreground-secondary">Total</td>
                  {data.quotes.map((q) => (
                    <td
                      key={q.uid}
                      className={`py-2 px-3 ${q.totalAmount === lowestTotal ? "font-semibold text-success" : ""}`}
                    >
                      {q.totalAmount ? `${q.currencyCode ?? ""} ${q.totalAmount}` : "—"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 pr-3 text-foreground-secondary">Valid until</td>
                  {data.quotes.map((q) => (
                    <td key={q.uid} className="py-2 px-3">
                      {q.validUntil ? new Date(q.validUntil).toLocaleDateString() : "—"}
                    </td>
                  ))}
                </tr>
                {data.rows.map((row) => (
                  <tr key={row.rfqItemId ?? row.description}>
                    <td className="py-2 pr-3 text-foreground-secondary">{row.description}</td>
                    {row.cells.map((cell, idx) => (
                      <td key={idx} className="py-2 px-3">
                        {cell.unitPrice !== null ? (
                          <div>
                            <div>
                              {cell.unitPrice} × {row.cells[idx] ? "" : ""}
                            </div>
                            <div className="text-foreground-tertiary">
                              {cell.leadTimeDays ? `${cell.leadTimeDays}d lead` : ""}
                            </div>
                          </div>
                        ) : (
                          <span className="text-foreground-tertiary">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="py-2 pr-3"></td>
                  {data.quotes.map((q) => (
                    <td key={q.uid} className="py-2 px-3">
                      <Button
                        size="xs"
                        disabled={busy || q.status === "Accepted" || q.status === "Rejected"}
                        onClick={() => handleAward(q.uid)}
                      >
                        <Trophy className="size-3" /> Award
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
