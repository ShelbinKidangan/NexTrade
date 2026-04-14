"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { admin, type AdminUserRow } from "@/lib/api";

export default function AdminUsersPage() {
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await admin.listUsers({ search: search || undefined, page: 1, pageSize: 50 });
    setRows(r.items);
    setLoading(false);
  }, [search]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  async function unlock(uid: string) { await admin.unlockUser(uid); await load(); }
  async function resetPwd(uid: string) {
    const pw = prompt("New password (min 8 chars, upper/lower/digit/special):");
    if (!pw) return;
    await admin.resetUserPassword(uid, pw);
  }
  async function promote(uid: string) { await admin.promoteUser(uid); await load(); }
  async function demote(uid: string) { await admin.demoteUser(uid); await load(); }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Users</h1>
        <p className="text-sm text-foreground-secondary">Cross-tenant user search and actions.</p>
      </div>

      <Input placeholder="Search by email or name..." value={search}
        onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />

      <Card>
        <CardContent className="pt-4 pb-4">
          {loading ? (
            <div className="text-sm text-foreground-secondary">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs text-foreground-tertiary border-b border-border">
                <tr>
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Tenant</th>
                  <th className="text-left py-2">Roles</th>
                  <th className="text-left py-2">Last login</th>
                  <th className="text-right py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.uid} className="border-b border-border/40">
                    <td className="py-2">{u.email}</td>
                    <td className="py-2">{u.fullName}</td>
                    <td className="py-2 text-foreground-tertiary">{u.tenantName ?? "—"}</td>
                    <td className="py-2">
                      {u.isPlatformAdmin && <Badge variant="default" className="mr-1">Platform admin</Badge>}
                      {u.isLockedOut && <Badge variant="destructive">Locked</Badge>}
                    </td>
                    <td className="py-2 text-foreground-tertiary">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "Never"}
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex justify-end gap-1">
                        {u.isLockedOut && <Button size="xs" onClick={() => unlock(u.uid)}>Unlock</Button>}
                        <Button size="xs" variant="outline" onClick={() => resetPwd(u.uid)}>Reset pwd</Button>
                        {u.isPlatformAdmin
                          ? <Button size="xs" variant="outline" onClick={() => demote(u.uid)}>Demote</Button>
                          : <Button size="xs" variant="outline" onClick={() => promote(u.uid)}>Promote</Button>}
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
