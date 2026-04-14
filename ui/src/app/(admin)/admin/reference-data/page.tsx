"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown } from "lucide-react";
import {
  admin,
  type AdminIndustry, type AdminCountry, type AdminCurrency, type AdminCatalogCategory,
} from "@/lib/api";

type Tab = "industries" | "countries" | "currencies" | "categories";

export default function AdminReferenceDataPage() {
  const [tab, setTab] = useState<Tab>("industries");
  const [industries, setIndustries] = useState<AdminIndustry[]>([]);
  const [countries, setCountries] = useState<AdminCountry[]>([]);
  const [currencies, setCurrencies] = useState<AdminCurrency[]>([]);
  const [categories, setCategories] = useState<AdminCatalogCategory[]>([]);

  const load = useCallback(async () => {
    if (tab === "industries") setIndustries(await admin.listIndustries());
    if (tab === "countries") setCountries(await admin.listCountries());
    if (tab === "currencies") setCurrencies(await admin.listCurrencies());
    if (tab === "categories") setCategories(await admin.listAdminCatalogCategories());
  }, [tab]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Reference data</h1>
        <p className="text-sm text-foreground-secondary">Edit taxonomies used across discovery and filters.</p>
      </div>

      <div className="flex gap-2 border-b border-border">
        {(["industries", "countries", "currencies", "categories"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-sm capitalize ${tab === t ? "border-b-2 border-accent" : "text-foreground-secondary"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "industries" && <IndustriesPanel rows={industries} reload={load} />}
      {tab === "countries" && <CountriesPanel rows={countries} reload={load} />}
      {tab === "currencies" && <CurrenciesPanel rows={currencies} reload={load} />}
      {tab === "categories" && <CategoriesPanel rows={categories} reload={load} />}
    </div>
  );
}

function IndustriesPanel({ rows, reload }: { rows: AdminIndustry[]; reload: () => Promise<void> }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  async function add() {
    if (!name || !slug) return;
    await admin.createIndustry({ name, slug, sortOrder: (rows.length + 1) * 10 });
    setName(""); setSlug("");
    await reload();
  }

  async function reorder(uid: string, direction: -1 | 1) {
    const idx = rows.findIndex((r) => r.uid === uid);
    const target = idx + direction;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[idx], next[target]] = [next[target], next[idx]];
    await admin.reorderIndustries(next.map((r) => r.uid));
    await reload();
  }

  async function remove(uid: string) {
    if (!confirm("Deactivate this industry?")) return;
    await admin.deleteIndustry(uid);
    await reload();
  }

  return (
    <Card>
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="flex gap-2">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <Button onClick={add}>Add</Button>
        </div>

        <table className="w-full text-sm">
          <thead className="text-xs text-foreground-tertiary border-b border-border">
            <tr>
              <th className="text-left py-2 w-16">Order</th>
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Slug</th>
              <th className="text-left py-2">Status</th>
              <th className="text-right py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.uid} className="border-b border-border/40">
                <td className="py-2 tabular-nums text-foreground-tertiary">{r.sortOrder}</td>
                <td className="py-2">{r.name}</td>
                <td className="py-2 text-foreground-tertiary">{r.slug}</td>
                <td className="py-2">
                  {r.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="destructive">Inactive</Badge>}
                </td>
                <td className="py-2 text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="xs" variant="outline" disabled={i === 0} onClick={() => reorder(r.uid, -1)}>
                      <ArrowUp className="size-3" />
                    </Button>
                    <Button size="xs" variant="outline" disabled={i === rows.length - 1} onClick={() => reorder(r.uid, 1)}>
                      <ArrowDown className="size-3" />
                    </Button>
                    <Button size="xs" variant="destructive" onClick={() => remove(r.uid)}>Deactivate</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function CountriesPanel({ rows, reload }: { rows: AdminCountry[]; reload: () => Promise<void> }) {
  const [code, setCode] = useState("");
  const [code3, setCode3] = useState("");
  const [name, setName] = useState("");

  async function add() {
    if (!code || !code3 || !name) return;
    await admin.createCountry({ code, code3, name });
    setCode(""); setCode3(""); setName("");
    await reload();
  }

  return (
    <Card>
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="flex gap-2">
          <Input placeholder="Code (e.g. US)" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="max-w-24" />
          <Input placeholder="Code3" value={code3} onChange={(e) => setCode3(e.target.value.toUpperCase())} className="max-w-24" />
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={add}>Add</Button>
        </div>

        <table className="w-full text-sm">
          <thead className="text-xs text-foreground-tertiary border-b border-border">
            <tr>
              <th className="text-left py-2">Code</th>
              <th className="text-left py-2">Code3</th>
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Status</th>
              <th className="text-right py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.uid} className="border-b border-border/40">
                <td className="py-2">{r.code}</td>
                <td className="py-2">{r.code3}</td>
                <td className="py-2">{r.name}</td>
                <td className="py-2">
                  {r.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="destructive">Inactive</Badge>}
                </td>
                <td className="py-2 text-right">
                  <Button size="xs" variant="outline"
                    onClick={async () => { await admin.updateCountry(r.uid, { isActive: !r.isActive }); await reload(); }}>
                    Toggle
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function CurrenciesPanel({ rows, reload }: { rows: AdminCurrency[]; reload: () => Promise<void> }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");

  async function add() {
    if (!code || !name || !symbol) return;
    await admin.createCurrency({ code, name, symbol, decimalPlaces: 2 });
    setCode(""); setName(""); setSymbol("");
    await reload();
  }

  return (
    <Card>
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="flex gap-2">
          <Input placeholder="Code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="max-w-24" />
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} className="max-w-24" />
          <Button onClick={add}>Add</Button>
        </div>

        <table className="w-full text-sm">
          <thead className="text-xs text-foreground-tertiary border-b border-border">
            <tr>
              <th className="text-left py-2">Code</th>
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Symbol</th>
              <th className="text-left py-2">Decimals</th>
              <th className="text-left py-2">Status</th>
              <th className="text-right py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.uid} className="border-b border-border/40">
                <td className="py-2">{r.code}</td>
                <td className="py-2">{r.name}</td>
                <td className="py-2">{r.symbol}</td>
                <td className="py-2 tabular-nums">{r.decimalPlaces}</td>
                <td className="py-2">
                  {r.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="destructive">Inactive</Badge>}
                </td>
                <td className="py-2 text-right">
                  <Button size="xs" variant="outline"
                    onClick={async () => { await admin.updateCurrency(r.uid, { isActive: !r.isActive }); await reload(); }}>
                    Toggle
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function CategoriesPanel({ rows, reload }: { rows: AdminCatalogCategory[]; reload: () => Promise<void> }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentUid, setParentUid] = useState("");

  async function add() {
    if (!name || !slug) return;
    await admin.createAdminCatalogCategory({
      name, slug,
      parentUid: parentUid || undefined,
      sortOrder: (rows.length + 1) * 10,
    });
    setName(""); setSlug(""); setParentUid("");
    await reload();
  }

  async function remove(uid: string) {
    if (!confirm("Deactivate this category?")) return;
    await admin.deleteAdminCatalogCategory(uid);
    await reload();
  }

  return (
    <Card>
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="flex gap-2">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <select value={parentUid} onChange={(e) => setParentUid(e.target.value)}
            className="h-8 rounded-md border border-input bg-transparent px-2 text-sm">
            <option value="">(root)</option>
            {rows.filter((r) => r.level === 0).map((r) => (
              <option key={r.uid} value={r.uid}>{r.name}</option>
            ))}
          </select>
          <Button onClick={add}>Add</Button>
        </div>

        <table className="w-full text-sm">
          <thead className="text-xs text-foreground-tertiary border-b border-border">
            <tr>
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Slug</th>
              <th className="text-left py-2">Level</th>
              <th className="text-left py-2">Status</th>
              <th className="text-right py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.uid} className="border-b border-border/40">
                <td className="py-2" style={{ paddingLeft: `${r.level * 16 + 8}px` }}>{r.name}</td>
                <td className="py-2 text-foreground-tertiary">{r.slug}</td>
                <td className="py-2 tabular-nums">{r.level}</td>
                <td className="py-2">
                  {r.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="destructive">Inactive</Badge>}
                </td>
                <td className="py-2 text-right">
                  <Button size="xs" variant="destructive" onClick={() => remove(r.uid)}>Deactivate</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
