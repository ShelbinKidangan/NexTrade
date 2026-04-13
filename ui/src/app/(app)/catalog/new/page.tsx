"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { catalogApi, categoriesApi } from "@/lib/api";
import type { CategoryDto } from "@/lib/types";

export default function NewCatalogItemPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", description: "", type: "Product" as "Product" | "Service",
    pricingType: "Fixed", priceMin: "", currencyCode: "USD",
    minOrderQuantity: "", leadTimeDays: "", categoryUid: "", deliveryRegions: "",
  });
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {});
  }, []);

  const set = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const created = await catalogApi.create({
        type: form.type,
        title: form.title,
        description: form.description || undefined,
        categoryUid: form.categoryUid || undefined,
        pricingType: form.pricingType,
        priceMin: form.priceMin ? Number(form.priceMin) : undefined,
        currencyCode: form.currencyCode,
        minOrderQuantity: form.minOrderQuantity ? Number(form.minOrderQuantity) : undefined,
        leadTimeDays: form.leadTimeDays ? Number(form.leadTimeDays) : undefined,
        deliveryRegions: form.deliveryRegions
          ? form.deliveryRegions.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
      });

      for (const file of files) {
        await catalogApi.uploadMedia(created.uid, file);
      }

      router.push(`/catalog/${created.uid}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create item");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-4">Add Catalog Item</h1>
      <Card>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-xs text-danger">{error}</p>}

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="type" value="Product" checked={form.type === "Product"} onChange={set("type")} />
                Product
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="type" value="Service" checked={form.type === "Service"} onChange={set("type")} />
                Service
              </label>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground-secondary">Title *</label>
              <Input value={form.title} onChange={set("title")} placeholder="e.g. Precision CNC Machining" required />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground-secondary">Description</label>
              <textarea
                value={form.description}
                onChange={set("description")}
                rows={3}
                className="w-full rounded-md border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none placeholder:text-foreground-tertiary focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                placeholder="Describe your product or service..."
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground-secondary">Pricing</label>
                <select
                  value={form.pricingType}
                  onChange={set("pricingType")}
                  className="w-full h-8 rounded-md border border-input bg-transparent px-2 text-sm"
                >
                  <option value="Fixed">Fixed Price</option>
                  <option value="Range">Price Range</option>
                  <option value="ContactForQuote">Contact for Quote</option>
                </select>
              </div>
              {form.pricingType !== "ContactForQuote" && (
                <div>
                  <label className="text-xs font-medium text-foreground-secondary">Price</label>
                  <Input type="number" value={form.priceMin} onChange={set("priceMin")} placeholder="0.00" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground-secondary">Min Order Qty</label>
                <Input type="number" value={form.minOrderQuantity} onChange={set("minOrderQuantity")} placeholder="1" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground-secondary">Lead Time (days)</label>
                <Input type="number" value={form.leadTimeDays} onChange={set("leadTimeDays")} placeholder="7" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground-secondary">Delivery regions (comma separated)</label>
              <Input value={form.deliveryRegions} onChange={set("deliveryRegions")} placeholder="APAC, EMEA" />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground-secondary">Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                className="w-full text-xs file:mr-2 file:rounded file:border file:border-border file:bg-background-secondary file:px-2 file:py-1 file:text-xs"
              />
              {files.length > 0 && (
                <p className="text-[11px] text-foreground-tertiary mt-1">{files.length} file(s) queued</p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Item"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
