"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { admin, type AdminAuditEntry } from "@/lib/api";

export default function AdminAuditLogPage() {
  const [rows, setRows] = useState<AdminAuditEntry[]>([]);
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await admin.listAuditLog({ action: action || undefined, page: 1, pageSize: 100 });
    setRows(r.items);
    setLoading(false);
  }, [action]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Audit log</h1>
        <p className="text-sm text-foreground-secondary">Every admin write, most recent first.</p>
      </div>

      <Input placeholder="Filter by action (e.g. business.suspend)" value={action}
        onChange={(e) => setAction(e.target.value)} className="max-w-sm" />

      <Card>
        <CardContent className="pt-4 pb-4">
          {loading ? (
            <div className="text-sm text-foreground-secondary">Loading...</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-foreground-secondary">No entries.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs text-foreground-tertiary border-b border-border">
                <tr>
                  <th className="text-left py-2">When</th>
                  <th className="text-left py-2">Admin</th>
                  <th className="text-left py-2">Action</th>
                  <th className="text-left py-2">Target</th>
                  <th className="text-left py-2">Payload</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.uid} className="border-b border-border/40">
                    <td className="py-2 text-foreground-tertiary whitespace-nowrap">
                      {new Date(a.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2">{a.adminEmail}</td>
                    <td className="py-2 font-mono text-xs">{a.action}</td>
                    <td className="py-2 text-xs text-foreground-tertiary">
                      {a.targetEntity}{a.targetUid ? ` / ${a.targetUid.substring(0, 8)}` : ""}
                    </td>
                    <td className="py-2 text-xs text-foreground-tertiary max-w-md truncate">{a.payload ?? ""}</td>
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
