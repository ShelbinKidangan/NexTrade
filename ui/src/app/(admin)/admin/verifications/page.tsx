"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { admin, type AdminComplianceDoc } from "@/lib/api";

const STATUSES = ["Pending", "Verified", "Rejected", "Expired"];
const TYPES = ["BusinessLicense", "TaxRegistration", "IsoCert", "Insurance", "AuditReport", "Other"];

export default function AdminVerificationsPage() {
  const [rows, setRows] = useState<AdminComplianceDoc[]>([]);
  const [status, setStatus] = useState("Pending");
  const [type, setType] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await admin.listVerifications({ status, type: type || undefined, page: 1, pageSize: 50 });
    setRows(r.items);
    setSelected(new Set());
    setLoading(false);
  }, [status, type]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  function toggle(uid: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(uid)) next.delete(uid); else next.add(uid);
      return next;
    });
  }

  function toggleAll() {
    setSelected((s) => (s.size === rows.length ? new Set() : new Set(rows.map((r) => r.uid))));
  }

  async function approveOne(uid: string) {
    await admin.approveVerification(uid);
    await load();
  }

  async function rejectOne(uid: string) {
    const reason = prompt("Rejection reason?");
    if (!reason) return;
    await admin.rejectVerification(uid, reason);
    await load();
  }

  async function bulkApprove() {
    if (selected.size === 0) return;
    await admin.bulkApproveVerifications(Array.from(selected));
    await load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Verification queue</h1>
          <p className="text-sm text-foreground-secondary">Compliance documents awaiting review.</p>
        </div>
        <Button onClick={bulkApprove} disabled={selected.size === 0}>
          Approve selected ({selected.size})
        </Button>
      </div>

      <div className="flex gap-2">
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="h-8 rounded-md border border-input bg-transparent px-2 text-sm">
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)}
          className="h-8 rounded-md border border-input bg-transparent px-2 text-sm">
          <option value="">All types</option>
          {TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      <Card>
        <CardContent className="pt-4 pb-4">
          {loading ? (
            <div className="text-sm text-foreground-secondary">Loading...</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-foreground-secondary">No documents.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs text-foreground-tertiary border-b border-border">
                <tr>
                  <th className="py-2 w-8">
                    <input type="checkbox"
                      checked={selected.size === rows.length && rows.length > 0}
                      onChange={toggleAll} />
                  </th>
                  <th className="text-left py-2">Business</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Title</th>
                  <th className="text-left py-2">Uploaded</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-right py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.uid} className="border-b border-border/40">
                    <td className="py-2">
                      <input type="checkbox" checked={selected.has(r.uid)} onChange={() => toggle(r.uid)} />
                    </td>
                    <td className="py-2">{r.businessName}</td>
                    <td className="py-2"><Badge variant="outline">{r.type}</Badge></td>
                    <td className="py-2">{r.title}</td>
                    <td className="py-2 text-foreground-tertiary">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2">
                      <Badge variant={r.status === "Pending" ? "warning" : r.status === "Verified" ? "success" : "destructive"}>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <a href={r.fileUrl} target="_blank" rel="noreferrer">
                          <Button variant="outline" size="xs">View</Button>
                        </a>
                        {r.status === "Pending" && (
                          <>
                            <Button size="xs" onClick={() => approveOne(r.uid)}>Approve</Button>
                            <Button variant="destructive" size="xs" onClick={() => rejectOne(r.uid)}>Reject</Button>
                          </>
                        )}
                      </div>
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
