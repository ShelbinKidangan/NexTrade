"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  admin,
  type AdminCatalogItemRow, type AdminRfqRow, type AdminReviewRow,
} from "@/lib/api";

type Tab = "catalog" | "rfqs" | "reviews";

export default function AdminContentPage() {
  const [tab, setTab] = useState<Tab>("catalog");
  const [catalog, setCatalog] = useState<AdminCatalogItemRow[]>([]);
  const [rfqs, setRfqs] = useState<AdminRfqRow[]>([]);
  const [reviews, setReviews] = useState<AdminReviewRow[]>([]);

  const load = useCallback(async () => {
    if (tab === "catalog") {
      const r = await admin.listCatalogItems({ pageSize: 50 });
      setCatalog(r.items);
    } else if (tab === "rfqs") {
      const r = await admin.listContentRfqs({ pageSize: 50 });
      setRfqs(r.items);
    } else {
      const r = await admin.listContentReviews({ pageSize: 50 });
      setReviews(r.items);
    }
  }, [tab]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Content moderation</h1>
        <p className="text-sm text-foreground-secondary">Hide, flag, or soft-delete user-generated content.</p>
      </div>

      <div className="flex gap-2 border-b border-border">
        {(["catalog", "rfqs", "reviews"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-sm capitalize ${tab === t ? "border-b-2 border-accent" : "text-foreground-secondary"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "catalog" && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <table className="w-full text-sm">
              <thead className="text-xs text-foreground-tertiary border-b border-border">
                <tr>
                  <th className="text-left py-2">Title</th>
                  <th className="text-left py-2">Supplier</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-right py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {catalog.map((c) => (
                  <tr key={c.uid} className="border-b border-border/40">
                    <td className="py-2">{c.title}</td>
                    <td className="py-2">{c.supplierName}</td>
                    <td className="py-2"><Badge variant="outline">{c.type}</Badge></td>
                    <td className="py-2">
                      <Badge variant={c.status === "Published" ? "success" : c.status === "Flagged" ? "warning" : c.status === "Hidden" ? "destructive" : "outline"}>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="xs" variant="outline" onClick={async () => { await admin.flagCatalogItem(c.uid); await load(); }}>Flag</Button>
                        <Button size="xs" variant="outline" onClick={async () => { await admin.hideCatalogItem(c.uid); await load(); }}>Hide</Button>
                        <Button size="xs" variant="destructive" onClick={async () => { await admin.deleteCatalogItem(c.uid); await load(); }}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {tab === "rfqs" && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <table className="w-full text-sm">
              <thead className="text-xs text-foreground-tertiary border-b border-border">
                <tr>
                  <th className="text-left py-2">Title</th>
                  <th className="text-left py-2">Buyer</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Moderation</th>
                  <th className="text-right py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rfqs.map((r) => (
                  <tr key={r.uid} className="border-b border-border/40">
                    <td className="py-2">{r.title}</td>
                    <td className="py-2">{r.buyerName}</td>
                    <td className="py-2"><Badge variant="outline">{r.status}</Badge></td>
                    <td className="py-2">
                      <Badge variant={r.moderation === "Active" ? "success" : r.moderation === "Flagged" ? "warning" : "destructive"}>
                        {r.moderation}
                      </Badge>
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="xs" variant="outline" onClick={async () => { await admin.flagContentRfq(r.uid); await load(); }}>Flag</Button>
                        <Button size="xs" variant="outline" onClick={async () => { await admin.hideContentRfq(r.uid); await load(); }}>Hide</Button>
                        <Button size="xs" variant="destructive" onClick={async () => { await admin.deleteContentRfq(r.uid); await load(); }}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {tab === "reviews" && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <table className="w-full text-sm">
              <thead className="text-xs text-foreground-tertiary border-b border-border">
                <tr>
                  <th className="text-left py-2">Rating</th>
                  <th className="text-left py-2">Reviewer</th>
                  <th className="text-left py-2">Reviewed</th>
                  <th className="text-left py-2">Comment</th>
                  <th className="text-left py-2">Moderation</th>
                  <th className="text-right py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((rv) => (
                  <tr key={rv.uid} className="border-b border-border/40">
                    <td className="py-2 tabular-nums">{rv.overallRating}/5</td>
                    <td className="py-2">{rv.reviewerName ?? "—"}</td>
                    <td className="py-2">{rv.reviewedName ?? "—"}</td>
                    <td className="py-2 text-xs text-foreground-tertiary max-w-md truncate">{rv.comment ?? ""}</td>
                    <td className="py-2">
                      <Badge variant={rv.moderation === "Active" ? "success" : rv.moderation === "Flagged" ? "warning" : "destructive"}>
                        {rv.moderation}
                      </Badge>
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="xs" variant="outline" onClick={async () => { await admin.flagContentReview(rv.uid); await load(); }}>Flag</Button>
                        <Button size="xs" variant="outline" onClick={async () => { await admin.hideContentReview(rv.uid); await load(); }}>Hide</Button>
                        <Button size="xs" variant="destructive" onClick={async () => { await admin.deleteContentReview(rv.uid); await load(); }}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
