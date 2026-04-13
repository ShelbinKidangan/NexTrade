"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Bookmark, Plus, Search, BadgeCheck, MapPin, Trash, UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { connectionsApi, savedSuppliersApi } from "@/lib/api";
import type { ConnectionDto, SavedSupplierDto, SupplierListDto } from "@/lib/types";

type Tab = "saved" | "following" | "lists";

export default function SuppliersPage() {
  const [tab, setTab] = useState<Tab>("saved");
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState<SavedSupplierDto[]>([]);
  const [following, setFollowing] = useState<ConnectionDto[]>([]);
  const [lists, setLists] = useState<SupplierListDto[]>([]);
  const [selectedList, setSelectedList] = useState<string | "all">("all");
  const [newListName, setNewListName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setError(null);
      const [s, f, l] = await Promise.all([
        savedSuppliersApi.list(selectedList === "all" ? undefined : selectedList),
        connectionsApi.following(),
        savedSuppliersApi.listLists(),
      ]);
      setSaved(s);
      setFollowing(f);
      setLists(l);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, [selectedList]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void reload(); }, [reload]);

  async function createList(e: React.FormEvent) {
    e.preventDefault();
    if (!newListName.trim()) return;
    try {
      await savedSuppliersApi.createList({ name: newListName.trim() });
      setNewListName("");
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create list");
    }
  }

  async function deleteList(uid: string) {
    if (!confirm("Delete this list?")) return;
    await savedSuppliersApi.deleteList(uid);
    if (selectedList === uid) setSelectedList("all");
    await reload();
  }

  async function removeSaved(uid: string) {
    await savedSuppliersApi.remove(uid);
    await reload();
  }

  async function unfollow(targetUid: string) {
    await connectionsApi.unfollow(targetUid);
    await reload();
  }

  const q = search.trim().toLowerCase();
  const filteredSaved = saved.filter((s) =>
    !q || s.supplierName.toLowerCase().includes(q) || (s.notes ?? "").toLowerCase().includes(q)
  );
  const filteredFollowing = following.filter((c) => !q || c.otherName.toLowerCase().includes(q));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">My Suppliers</h1>
          <p className="text-sm text-foreground-secondary">Saved suppliers, followed businesses, and your lists.</p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-border">
        {([
          { k: "saved", label: `Saved (${saved.length})` },
          { k: "following", label: `Following (${following.length})` },
          { k: "lists", label: `Lists (${lists.length})` },
        ] as const).map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`px-3 py-2 text-sm border-b-2 transition-colors ${
              tab === t.k
                ? "border-accent text-foreground font-medium"
                : "border-transparent text-foreground-secondary hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}

      {tab === "saved" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="space-y-1">
            <button
              onClick={() => setSelectedList("all")}
              className={`flex items-center justify-between w-full text-xs px-2.5 py-2 rounded-md ${
                selectedList === "all" ? "bg-background-secondary font-medium" : "text-foreground-secondary hover:bg-background-secondary"
              }`}
            >
              <span className="flex items-center gap-2"><Bookmark className="size-3.5" /> All saved</span>
              <span className="text-foreground-tertiary">{saved.length}</span>
            </button>
            {lists.map((l) => (
              <button
                key={l.uid}
                onClick={() => setSelectedList(l.uid)}
                className={`flex items-center justify-between w-full text-xs px-2.5 py-2 rounded-md ${
                  selectedList === l.uid ? "bg-background-secondary font-medium" : "text-foreground-secondary hover:bg-background-secondary"
                }`}
              >
                <span className="truncate">{l.name}</span>
                <span className="text-foreground-tertiary">{l.supplierCount}</span>
              </button>
            ))}
          </aside>

          <div className="lg:col-span-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-foreground-tertiary" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search saved suppliers..."
                className="pl-8"
              />
            </div>

            {filteredSaved.length === 0 ? (
              <Card><CardContent className="pt-4 pb-6 text-center">
                <Bookmark className="size-6 mx-auto text-foreground-tertiary mb-2" />
                <p className="text-sm text-foreground-secondary">No saved suppliers yet.</p>
              </CardContent></Card>
            ) : (
              filteredSaved.map((s) => (
                <Card key={s.uid}>
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-background-secondary font-semibold">
                        {s.supplierName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <Link href={`/business/${s.supplierUid}`} className="text-sm font-medium truncate hover:text-accent">
                            {s.supplierName}
                          </Link>
                          {s.supplierVerified && <BadgeCheck className="size-4 text-accent" />}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-foreground-tertiary">
                          {s.supplierCountry && (
                            <span className="flex items-center gap-0.5"><MapPin className="size-3" />{s.supplierCountry}</span>
                          )}
                          {s.listName && <Badge variant="outline">{s.listName}</Badge>}
                        </div>
                        {s.notes && <p className="text-xs text-foreground-secondary mt-1 italic">{s.notes}</p>}
                      </div>
                      <Button variant="ghost" size="icon-sm" onClick={() => removeSaved(s.uid)}>
                        <Trash className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {tab === "following" && (
        <div className="space-y-3">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-foreground-tertiary" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search followed suppliers..." className="pl-8" />
          </div>
          {filteredFollowing.length === 0 ? (
            <Card><CardContent className="pt-4 pb-6 text-center">
              <UserPlus className="size-6 mx-auto text-foreground-tertiary mb-2" />
              <p className="text-sm text-foreground-secondary">Not following anyone yet. Open a supplier profile to follow.</p>
            </CardContent></Card>
          ) : (
            filteredFollowing.map((c) => (
              <Card key={c.uid}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-background-secondary font-semibold">
                      {c.otherName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <Link href={`/business/${c.otherUid}`} className="text-sm font-medium truncate hover:text-accent">
                          {c.otherName}
                        </Link>
                        {c.otherVerified && <BadgeCheck className="size-4 text-accent" />}
                      </div>
                      {c.otherCountry && (
                        <div className="flex items-center gap-1 text-[11px] text-foreground-tertiary">
                          <MapPin className="size-3" /> {c.otherCountry}
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => unfollow(c.otherUid)}>
                      Unfollow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "lists" && (
        <div className="space-y-3 max-w-2xl">
          <form onSubmit={createList} className="flex gap-2">
            <Input value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder="New list name..." />
            <Button type="submit"><Plus className="size-4" /> Create</Button>
          </form>
          {lists.length === 0 ? (
            <Card><CardContent className="pt-4 pb-6 text-center">
              <p className="text-sm text-foreground-secondary">No lists yet.</p>
            </CardContent></Card>
          ) : (
            lists.map((l) => (
              <Card key={l.uid}>
                <CardContent className="pt-3 pb-3 flex items-center gap-3">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">{l.name}</h3>
                    <p className="text-xs text-foreground-tertiary">{l.supplierCount} suppliers</p>
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={() => deleteList(l.uid)}>
                    <Trash className="size-4" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
