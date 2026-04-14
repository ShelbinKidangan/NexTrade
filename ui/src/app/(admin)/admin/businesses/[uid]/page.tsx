"use client";

import { useEffect, useState, use } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { admin, trustScoreApi, type AdminBusinessDetail, type AdminAuditEntry } from "@/lib/api";

export default function AdminBusinessDetailPage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = use(params);
  const [b, setB] = useState<AdminBusinessDetail | null>(null);
  const [auditRows, setAuditRows] = useState<AdminAuditEntry[]>([]);
  const [tab, setTab] = useState<"overview" | "audit">("overview");
  const [msg, setMsg] = useState<string | null>(null);

  async function refresh() {
    const detail = await admin.getBusiness(uid);
    setB(detail);
    const audit = await admin.listAuditLog({ targetEntity: "Business", pageSize: 50 });
    setAuditRows(audit.items.filter((a) => a.targetUid === uid));
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { refresh(); }, [uid]);

  if (!b) return <div className="text-sm text-foreground-secondary">Loading...</div>;

  async function doVerify() { await admin.verifyBusiness(uid); setMsg("Verified"); await refresh(); }
  async function doSuspend() {
    const reason = prompt("Reason for suspension?");
    if (!reason) return;
    await admin.suspendBusiness(uid, reason);
    setMsg("Suspended"); await refresh();
  }
  async function doUnsuspend() { await admin.unsuspendBusiness(uid); setMsg("Unsuspended"); await refresh(); }
  async function doDelete() {
    if (!confirm("Soft-delete this business?")) return;
    await admin.deleteBusiness(uid);
    setMsg("Deleted"); await refresh();
  }
  async function doRecomputeTrust() {
    const r = await trustScoreApi.recompute(uid);
    setMsg(`Trust recomputed: ${r.trustScore}`); await refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{b.name}</h1>
          <p className="text-sm text-foreground-secondary">
            {b.industry ?? "—"} · {b.city ?? "—"}, {b.countryCode ?? "—"} · Trust {b.trustScore.toFixed(1)}
          </p>
        </div>
        <div className="flex gap-2">
          {!b.isVerified && <Button size="sm" onClick={doVerify}>Verify</Button>}
          {b.isSuspended
            ? <Button size="sm" variant="outline" onClick={doUnsuspend}>Unsuspend</Button>
            : <Button size="sm" variant="outline" onClick={doSuspend}>Suspend</Button>}
          <Button size="sm" variant="outline" onClick={doRecomputeTrust}>Recompute trust</Button>
          <Button size="sm" variant="destructive" onClick={doDelete}>Delete</Button>
        </div>
      </div>

      {msg && <div className="text-xs text-success">{msg}</div>}

      <div className="flex gap-2 border-b border-border">
        <button onClick={() => setTab("overview")}
          className={`px-3 py-1.5 text-sm ${tab === "overview" ? "border-b-2 border-accent" : "text-foreground-secondary"}`}>
          Overview
        </button>
        <button onClick={() => setTab("audit")}
          className={`px-3 py-1.5 text-sm ${tab === "audit" ? "border-b-2 border-accent" : "text-foreground-secondary"}`}>
          Audit log ({auditRows.length})
        </button>
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Users" value={b.userCount} />
          <Stat label="Published items" value={b.publishedItemCount} />
          <Stat label="Open RFQs" value={b.openRfqCount} />
          <Stat label="Compliance" value={`${b.complianceVerifiedCount}/${b.complianceTotalCount}`} />
          <Stat label="Profile source" value={b.profileSource} />
          <Stat label="Year established" value={b.yearEstablished ?? "—"} />
          <Stat label="Size" value={b.companySize ?? "—"} />
          <Stat label="Created" value={new Date(b.createdAt).toLocaleDateString()} />
        </div>
      )}

      {tab === "overview" && b.about && (
        <Card>
          <CardContent className="pt-4 pb-4 text-sm">
            <div className="text-xs text-foreground-tertiary mb-1">About</div>
            {b.about}
          </CardContent>
        </Card>
      )}

      {tab === "overview" && b.isSuspended && b.suspensionReason && (
        <Card>
          <CardContent className="pt-4 pb-4 text-sm">
            <Badge variant="destructive">Suspended</Badge>
            <div className="mt-1 text-foreground-secondary">{b.suspensionReason}</div>
          </CardContent>
        </Card>
      )}

      {tab === "audit" && (
        <Card>
          <CardContent className="pt-4 pb-4">
            {auditRows.length === 0 ? (
              <div className="text-sm text-foreground-secondary">No admin actions recorded.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-xs text-foreground-tertiary border-b border-border">
                  <tr>
                    <th className="text-left py-2">When</th>
                    <th className="text-left py-2">Admin</th>
                    <th className="text-left py-2">Action</th>
                    <th className="text-left py-2">Payload</th>
                  </tr>
                </thead>
                <tbody>
                  {auditRows.map((a) => (
                    <tr key={a.uid} className="border-b border-border/40">
                      <td className="py-2 text-foreground-tertiary">{new Date(a.createdAt).toLocaleString()}</td>
                      <td className="py-2">{a.adminEmail}</td>
                      <td className="py-2">{a.action}</td>
                      <td className="py-2 text-xs text-foreground-tertiary max-w-md truncate">{a.payload ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-3 pb-3">
        <div className="text-[11px] text-foreground-tertiary">{label}</div>
        <div className="text-base font-medium">{value}</div>
      </CardContent>
    </Card>
  );
}
