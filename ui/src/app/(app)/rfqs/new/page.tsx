"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { rfqsApi, discoveryApi } from "@/lib/api";
import type { CreateRfqItemRequest, DiscoverBusinessDto } from "@/lib/types";

type FormItem = {
  description: string;
  quantity: string;
  unitOfMeasure: string;
  specifications: string;
};

export default function NewRfqPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"Public" | "Targeted">("Public");
  const [responseDeadline, setResponseDeadline] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [deliveryTimeline, setDeliveryTimeline] = useState("");
  const [items, setItems] = useState<FormItem[]>([
    { description: "", quantity: "", unitOfMeasure: "", specifications: "" },
  ]);
  const [suppliers, setSuppliers] = useState<DiscoverBusinessDto[]>([]);
  const [selectedSupplierUids, setSelectedSupplierUids] = useState<Set<string>>(new Set());
  const [publishNow, setPublishNow] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    discoveryApi
      .businesses({ pageSize: 50 })
      .then((p) => setSuppliers(p.items))
      .catch(() => {});
  }, []);

  const setItem = (i: number, field: keyof FormItem, value: string) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));

  const addItem = () =>
    setItems((prev) => [...prev, { description: "", quantity: "", unitOfMeasure: "", specifications: "" }]);
  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const toggleSupplier = (uid: string) =>
    setSelectedSupplierUids((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payloadItems: CreateRfqItemRequest[] = items
        .filter((i) => i.description.trim())
        .map((i, idx) => ({
          description: i.description,
          specifications: i.specifications || undefined,
          quantity: i.quantity ? Number(i.quantity) : undefined,
          unitOfMeasure: i.unitOfMeasure || undefined,
          sortOrder: idx,
        }));

      if (payloadItems.length === 0) {
        setError("At least one line item is required");
        setLoading(false);
        return;
      }

      const created = await rfqsApi.create({
        title,
        description: description || undefined,
        visibility,
        responseDeadline: responseDeadline
          ? new Date(responseDeadline).toISOString()
          : undefined,
        deliveryLocation: deliveryLocation || undefined,
        deliveryTimeline: deliveryTimeline || undefined,
        items: payloadItems,
        targetedSupplierUids:
          visibility === "Targeted" ? Array.from(selectedSupplierUids) : undefined,
      });

      if (publishNow) {
        await rfqsApi.publish(created.uid);
      }
      router.push(`/rfqs/${created.uid}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create RFQ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-4">
      <Button variant="ghost" size="sm" render={<Link href="/rfqs" />}>
        <ArrowLeft className="size-4" /> Back to RFQs
      </Button>

      <h1 className="text-xl font-semibold">Create RFQ</h1>

      <Card>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <p className="text-xs text-danger">{error}</p>}

            <div>
              <label className="text-xs font-medium text-foreground-secondary">Title *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 500 precision CNC brackets"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground-secondary">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none placeholder:text-foreground-tertiary focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                placeholder="High-level context for suppliers…"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground-secondary">Delivery location</label>
                <Input
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder="Bengaluru, IN"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground-secondary">Delivery timeline</label>
                <Input
                  value={deliveryTimeline}
                  onChange={(e) => setDeliveryTimeline(e.target.value)}
                  placeholder="Within 4 weeks"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground-secondary">Response deadline</label>
                <Input
                  type="datetime-local"
                  value={responseDeadline}
                  onChange={(e) => setResponseDeadline(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground-secondary">Visibility</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as "Public" | "Targeted")}
                  className="w-full rounded-md border border-input bg-transparent px-2.5 py-1.5 text-sm"
                >
                  <option value="Public">Public — any supplier can quote</option>
                  <option value="Targeted">Targeted — invite-only</option>
                </select>
              </div>
            </div>

            {/* Line items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Line items</h3>
                <Button type="button" variant="outline" size="xs" onClick={addItem}>
                  <Plus className="size-3" /> Add
                </Button>
              </div>
              <div className="space-y-3">
                {items.map((item, i) => (
                  <div key={i} className="border border-border rounded-md p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-2">
                        <Input
                          value={item.description}
                          onChange={(e) => setItem(i, "description", e.target.value)}
                          placeholder="What you need (e.g. Aluminum bracket 6061-T6)"
                          required
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={item.quantity}
                            onChange={(e) => setItem(i, "quantity", e.target.value)}
                            placeholder="Quantity"
                            type="number"
                          />
                          <Input
                            value={item.unitOfMeasure}
                            onChange={(e) => setItem(i, "unitOfMeasure", e.target.value)}
                            placeholder="Unit (pcs, kg…)"
                          />
                        </div>
                        <textarea
                          value={item.specifications}
                          onChange={(e) => setItem(i, "specifications", e.target.value)}
                          rows={2}
                          className="w-full rounded-md border border-input bg-transparent px-2.5 py-1.5 text-sm"
                          placeholder="Specs, tolerances, certifications…"
                        />
                      </div>
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() => removeItem(i)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {visibility === "Targeted" && (
              <div>
                <h3 className="text-sm font-medium mb-2">
                  Invite suppliers ({selectedSupplierUids.size} selected)
                </h3>
                <div className="max-h-64 overflow-y-auto border border-border rounded-md divide-y divide-border">
                  {suppliers.length === 0 ? (
                    <p className="p-3 text-xs text-foreground-tertiary">No suppliers found.</p>
                  ) : (
                    suppliers.map((s) => (
                      <label key={s.uid} className="flex items-center gap-2 p-2 text-sm cursor-pointer hover:bg-background-secondary">
                        <input
                          type="checkbox"
                          checked={selectedSupplierUids.has(s.uid)}
                          onChange={() => toggleSupplier(s.uid)}
                        />
                        <span className="flex-1">{s.name}</span>
                        {s.isVerified && <span className="text-[10px] text-accent">Verified</span>}
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={publishNow}
                onChange={(e) => setPublishNow(e.target.checked)}
              />
              Publish immediately
            </label>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating…" : publishNow ? "Create & publish" : "Save draft"}
              </Button>
              <Button type="button" variant="outline" render={<Link href="/rfqs" />}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
