"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Star, Trash, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { catalogApi, categoriesApi } from "@/lib/api";
import type { CatalogItemDto, CategoryDto } from "@/lib/types";

export default function CatalogItemEditPage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = use(params);
  const router = useRouter();
  const [item, setItem] = useState<CatalogItemDto | null>(null);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", categoryUid: "",
    pricingType: "Fixed", priceMin: "", currencyCode: "USD",
    minOrderQuantity: "", leadTimeDays: "", deliveryRegions: "",
  });

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [fetched, cats] = await Promise.all([
        catalogApi.get(uid),
        categoriesApi.list().catch(() => [] as CategoryDto[]),
      ]);
      setItem(fetched);
      setCategories(cats);
      setForm({
        title: fetched.title,
        description: fetched.description ?? "",
        categoryUid: fetched.categoryUid ?? "",
        pricingType: fetched.pricingType,
        priceMin: fetched.priceMin?.toString() ?? "",
        currencyCode: fetched.currencyCode ?? "USD",
        minOrderQuantity: fetched.minOrderQuantity?.toString() ?? "",
        leadTimeDays: fetched.leadTimeDays?.toString() ?? "",
        deliveryRegions: (fetched.deliveryRegions ?? []).join(", "),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => { void reload(); }, [reload]);

  const set = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await catalogApi.update(uid, {
        title: form.title,
        description: form.description || undefined,
        categoryUid: form.categoryUid || undefined,
        pricingType: form.pricingType,
        priceMin: form.priceMin ? Number(form.priceMin) : undefined,
        currencyCode: form.currencyCode || undefined,
        minOrderQuantity: form.minOrderQuantity ? Number(form.minOrderQuantity) : undefined,
        leadTimeDays: form.leadTimeDays ? Number(form.leadTimeDays) : undefined,
        deliveryRegions: form.deliveryRegions
          ? form.deliveryRegions.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
      });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(status: "Draft" | "Published" | "Archived") {
    await catalogApi.setStatus(uid, status);
    await reload();
  }

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    for (const f of files) {
      await catalogApi.uploadMedia(uid, f);
    }
    e.target.value = "";
    await reload();
  }

  async function removeMedia(mediaId: number) {
    await catalogApi.deleteMedia(uid, mediaId);
    await reload();
  }

  async function makePrimary(mediaId: number) {
    await catalogApi.setPrimaryMedia(uid, mediaId);
    await reload();
  }

  async function remove() {
    if (!confirm("Delete this catalog item?")) return;
    await catalogApi.remove(uid);
    router.push("/catalog");
  }

  if (loading) return <p className="text-sm text-foreground-secondary">Loading…</p>;
  if (!item) return <p className="text-sm text-danger">{error ?? "Not found"}</p>;

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push("/catalog")}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-xl font-semibold flex-1">{item.title}</h1>
        <Badge variant={item.status === "Published" ? "success" : item.status === "Draft" ? "outline" : "secondary"}>
          {item.status}
        </Badge>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}

      <Card>
        <CardContent className="pt-4 space-y-3">
          <h2 className="text-sm font-medium">Media</h2>
          {item.media.length === 0 && (
            <p className="text-xs text-foreground-secondary">No images yet.</p>
          )}
          <div className="grid grid-cols-4 gap-2">
            {item.media.map((m) => (
              <div key={m.id} className="relative rounded-md border border-border overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.fileName} className="aspect-square w-full object-cover" />
                <div className="absolute inset-x-1 bottom-1 flex justify-between gap-1">
                  <Button
                    size="icon-sm"
                    variant={m.isPrimary ? "default" : "outline"}
                    onClick={() => makePrimary(m.id)}
                    title={m.isPrimary ? "Primary" : "Set as primary"}
                  >
                    <Star className={`size-3 ${m.isPrimary ? "fill-current" : ""}`} />
                  </Button>
                  <Button size="icon-sm" variant="outline" onClick={() => removeMedia(m.id)}>
                    <Trash className="size-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-accent">
            <Upload className="size-3.5" /> Upload images
            <input type="file" multiple accept="image/*" onChange={uploadFile} className="hidden" />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <form onSubmit={save} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-foreground-secondary">Title</label>
              <Input value={form.title} onChange={set("title")} required />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground-secondary">Description</label>
              <textarea
                value={form.description}
                onChange={set("description")}
                rows={3}
                className="w-full rounded-md border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground-secondary">Category</label>
              <select
                value={form.categoryUid}
                onChange={set("categoryUid")}
                className="w-full h-8 rounded-md border border-input bg-transparent px-2 text-sm"
              >
                <option value="">— No category —</option>
                {categories.map((c) => (
                  <option key={c.uid} value={c.uid}>
                    {"  ".repeat(c.level)}{c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground-secondary">Pricing</label>
                <select
                  value={form.pricingType}
                  onChange={set("pricingType")}
                  className="w-full h-8 rounded-md border border-input bg-transparent px-2 text-sm"
                >
                  <option value="Fixed">Fixed</option>
                  <option value="Range">Range</option>
                  <option value="ContactForQuote">Contact for Quote</option>
                </select>
              </div>
              {form.pricingType !== "ContactForQuote" && (
                <div>
                  <label className="text-xs font-medium text-foreground-secondary">Price</label>
                  <Input type="number" value={form.priceMin} onChange={set("priceMin")} />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground-secondary">Min Order Qty</label>
                <Input type="number" value={form.minOrderQuantity} onChange={set("minOrderQuantity")} />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground-secondary">Lead Time (days)</label>
                <Input type="number" value={form.leadTimeDays} onChange={set("leadTimeDays")} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground-secondary">Delivery regions</label>
              <Input value={form.deliveryRegions} onChange={set("deliveryRegions")} placeholder="APAC, EMEA" />
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
              <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
              {item.status !== "Published" && (
                <Button type="button" variant="outline" onClick={() => setStatus("Published")}>
                  Publish
                </Button>
              )}
              {item.status === "Published" && (
                <Button type="button" variant="outline" onClick={() => setStatus("Draft")}>
                  Unpublish
                </Button>
              )}
              {item.status !== "Archived" && (
                <Button type="button" variant="outline" onClick={() => setStatus("Archived")}>
                  Archive
                </Button>
              )}
              <Button type="button" variant="outline" className="ml-auto" onClick={remove}>
                Delete
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
