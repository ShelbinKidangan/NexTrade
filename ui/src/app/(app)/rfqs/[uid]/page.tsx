"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, BadgeCheck, MapPin, Calendar, Globe, Lock,
  Trophy, Send, X, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { rfqsApi, quotesApi, dealConfirmationsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ReviewModal } from "@/components/app/review-modal";
import type {
  RfqDetailDto, QuoteDto, CreateQuoteItemRequest, DealConfirmationDto,
} from "@/lib/types";

const statusVariant: Record<RfqDetailDto["status"], "success" | "warning" | "secondary" | "outline" | "destructive"> = {
  Open: "success",
  Awarded: "warning",
  Draft: "outline",
  Closed: "secondary",
  Cancelled: "destructive",
};

export default function RfqDetailPage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = use(params);
  const { business } = useAuth();
  const [rfq, setRfq] = useState<RfqDetailDto | null>(null);
  const [quotes, setQuotes] = useState<QuoteDto[]>([]);
  const [pendingDeal, setPendingDeal] = useState<DealConfirmationDto | null>(null);
  const [confirmedDeal, setConfirmedDeal] = useState<DealConfirmationDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const r = await rfqsApi.get(uid);
      setRfq(r);
      const q = await quotesApi.forRfq(uid);
      setQuotes(q);
      // Deals referencing this RFQ (either side)
      try {
        const [pending, mine] = await Promise.all([
          dealConfirmationsApi.pending(),
          dealConfirmationsApi.mine(),
        ]);
        setPendingDeal(pending.find((d) => d.rfqUid === uid) ?? null);
        setConfirmedDeal(
          mine.find((d) => d.rfqUid === uid && d.confirmedAt !== null) ?? null
        );
      } catch {}
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load RFQ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  if (loading) return <p className="text-sm text-foreground-secondary">Loading…</p>;
  if (error || !rfq) return <p className="text-sm text-danger">{error || "RFQ not found"}</p>;

  const isBuyer = business?.uid === rfq.buyerBusinessUid;
  const myQuote = quotes.find((q) => q.supplierBusinessUid === business?.uid);
  const canQuote = !isBuyer && rfq.status === "Open" && !myQuote;

  async function handlePublish() {
    setBusy(true);
    try { await rfqsApi.publish(uid); await load(); }
    finally { setBusy(false); }
  }
  async function handleClose() {
    setBusy(true);
    try { await rfqsApi.close(uid); await load(); }
    finally { setBusy(false); }
  }
  async function handleAward(quoteUid: string) {
    if (!confirm("Award this quote? This will reject all other quotes and move the RFQ to Awarded.")) return;
    setBusy(true);
    try { await quotesApi.award(uid, quoteUid); await load(); }
    catch (e) { alert(e instanceof Error ? e.message : "Failed to award"); }
    finally { setBusy(false); }
  }
  async function handleConfirmDeal() {
    if (!pendingDeal) return;
    setBusy(true);
    try { await dealConfirmationsApi.confirm(pendingDeal.uid); await load(); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" render={<Link href="/rfqs" />}>
          <ArrowLeft className="size-4" /> Back to RFQs
        </Button>
      </div>

      {/* Review prompt (both sides confirmed) */}
      {confirmedDeal && !pendingDeal && (
        <Card className="bg-success/10 border-success/30">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-sm font-medium">Deal confirmed — leave a review</h3>
                <p className="text-xs text-foreground-secondary mt-1">
                  Share how the deal went. Your review contributes to the other party's trust score.
                </p>
              </div>
              <Button size="sm" onClick={() => setShowReview(true)}>Leave review</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deal confirmation banner */}
      {pendingDeal && (
        <Card className="bg-warning-subtle/30 border-warning/30">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="size-4 text-warning" />
                  <h3 className="text-sm font-medium">Deal confirmation pending</h3>
                </div>
                <p className="text-xs text-foreground-secondary">
                  Confirm the off-platform deal with{" "}
                  <strong>
                    {isBuyer ? pendingDeal.supplierBusinessName : pendingDeal.buyerBusinessName}
                  </strong>{" "}
                  so both sides have a shared record. This unlocks reviews.
                </p>
              </div>
              <Button size="sm" onClick={handleConfirmDeal} disabled={busy}>
                Confirm deal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={statusVariant[rfq.status]}>{rfq.status}</Badge>
            <Badge variant="outline" className="gap-1">
              {rfq.visibility === "Public" ? <Globe className="size-3" /> : <Lock className="size-3" />}
              {rfq.visibility}
            </Badge>
            <span className="text-xs text-foreground-tertiary">
              by {rfq.buyerBusinessName}
            </span>
          </div>
          <h1 className="text-xl font-semibold mt-1">{rfq.title}</h1>
          {rfq.description && (
            <p className="text-sm text-foreground-secondary max-w-2xl mt-1">{rfq.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-foreground-tertiary">
            {rfq.deliveryLocation && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3" /> {rfq.deliveryLocation}
              </span>
            )}
            {rfq.responseDeadline && (
              <span className="flex items-center gap-1">
                <Calendar className="size-3" /> Due {new Date(rfq.responseDeadline).toLocaleDateString()}
              </span>
            )}
            <span>{rfq.items.length} line {rfq.items.length === 1 ? "item" : "items"}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {isBuyer && rfq.status === "Draft" && (
            <Button size="sm" onClick={handlePublish} disabled={busy}>Publish</Button>
          )}
          {isBuyer && rfq.status === "Open" && (
            <>
              <Button variant="outline" size="sm" onClick={handleClose} disabled={busy}>Close</Button>
              <Button size="sm" render={<Link href={`/rfqs/${uid}/compare`} />}>
                <Trophy className="size-4" /> Compare & award
              </Button>
            </>
          )}
          {canQuote && (
            <Button size="sm" onClick={() => setShowQuoteForm(true)}>
              <Send className="size-4" /> Submit quote
            </Button>
          )}
        </div>
      </div>

      {/* Line items */}
      <Card>
        <CardContent className="pt-4">
          <h3 className="text-sm font-medium mb-3">Line items</h3>
          <div className="space-y-2">
            {rfq.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b border-border last:border-0 py-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium">{item.description}</div>
                  {item.specifications && (
                    <div className="text-xs text-foreground-secondary">{item.specifications}</div>
                  )}
                </div>
                {item.quantity && (
                  <div className="text-xs font-medium shrink-0">
                    {item.quantity} {item.unitOfMeasure ?? ""}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Targeted suppliers */}
      {isBuyer && rfq.visibility === "Targeted" && rfq.targets.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <h3 className="text-sm font-medium mb-3">Invited suppliers</h3>
            <div className="flex flex-wrap gap-2">
              {rfq.targets.map((t) => (
                <Badge key={t.supplierBusinessUid} variant="outline">
                  {t.supplierName ?? t.supplierBusinessUid}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quote list / quote composer */}
      <Card>
        <CardContent className="pt-4">
          <h3 className="text-sm font-medium mb-3">
            {isBuyer ? `Quotes received (${quotes.length})` : "Your quote"}
          </h3>
          {quotes.length === 0 ? (
            <p className="text-xs text-foreground-tertiary">No quotes yet.</p>
          ) : (
            <div className="space-y-3">
              {quotes.map((q) => (
                <div
                  key={q.uid}
                  className="border border-border rounded-md p-3"
                >
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-sm font-medium">{q.supplierBusinessName}</span>
                    {q.supplierVerified && <BadgeCheck className="size-4 text-accent" />}
                    <Badge variant={q.status === "Accepted" ? "success" : q.status === "Rejected" ? "destructive" : "outline"}>
                      {q.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <Metric label="Total" value={q.totalAmount ? `${q.currencyCode ?? ""} ${q.totalAmount}` : "—"} />
                    <Metric
                      label="Lead time"
                      value={
                        q.items[0]?.leadTimeDays
                          ? `${q.items[0].leadTimeDays} days`
                          : "—"
                      }
                    />
                    <Metric
                      label="Valid until"
                      value={q.validUntil ? new Date(q.validUntil).toLocaleDateString() : "—"}
                    />
                    <Metric label="Line items" value={`${q.items.length}`} />
                  </div>
                  {q.notes && (
                    <p className="text-xs text-foreground-secondary mt-2">{q.notes}</p>
                  )}
                  {isBuyer && rfq.status === "Open" && q.status !== "Withdrawn" && (
                    <div className="mt-3">
                      <Button size="xs" onClick={() => handleAward(q.uid)} disabled={busy}>
                        Award this quote
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showQuoteForm && (
        <QuoteComposer
          rfq={rfq}
          onClose={() => setShowQuoteForm(false)}
          onSubmitted={() => {
            setShowQuoteForm(false);
            load();
          }}
        />
      )}

      {showReview && confirmedDeal && (
        <ReviewModal
          dealConfirmationUid={confirmedDeal.uid}
          counterpartyName={
            isBuyer ? confirmedDeal.supplierBusinessName : confirmedDeal.buyerBusinessName
          }
          onClose={() => setShowReview(false)}
          onSubmitted={() => {
            setShowReview(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-foreground-tertiary">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function QuoteComposer({
  rfq, onClose, onSubmitted,
}: {
  rfq: RfqDetailDto;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  type Row = {
    rfqItemId: number;
    description: string;
    unitPrice: string;
    quantity: string;
    leadTimeDays: string;
    minOrderQuantity: string;
    incoterms: string;
  };
  const [rows, setRows] = useState<Row[]>(
    rfq.items.map((i) => ({
      rfqItemId: i.id,
      description: i.description,
      unitPrice: "",
      quantity: i.quantity?.toString() ?? "1",
      leadTimeDays: "",
      minOrderQuantity: "",
      incoterms: "",
    }))
  );
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [notes, setNotes] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalAmount = rows.reduce((sum, r) => {
    const up = Number(r.unitPrice) || 0;
    const qty = Number(r.quantity) || 0;
    return sum + up * qty;
  }, 0);

  const setRow = (i: number, field: keyof Row, value: string) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const items: CreateQuoteItemRequest[] = rows
        .filter((r) => r.unitPrice && r.quantity)
        .map((r, idx) => ({
          rfqItemId: r.rfqItemId,
          unitPrice: Number(r.unitPrice),
          quantity: Number(r.quantity),
          totalPrice: Number(r.unitPrice) * Number(r.quantity),
          leadTimeDays: r.leadTimeDays ? Number(r.leadTimeDays) : undefined,
          minOrderQuantity: r.minOrderQuantity ? Number(r.minOrderQuantity) : undefined,
          incoterms: r.incoterms || undefined,
          sortOrder: idx,
        }));
      if (items.length === 0) throw new Error("At least one priced line item is required");

      const created = await quotesApi.create(rfq.uid, {
        totalAmount,
        currencyCode,
        validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
        notes: notes || undefined,
        items,
      });
      await quotesApi.submit(created.uid);
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit quote");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto p-4">
      <Card className="w-full max-w-2xl my-8">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Submit quote</h2>
            <Button variant="ghost" size="xs" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-xs text-danger">{error}</p>}

            <div className="space-y-2">
              {rows.map((r, i) => (
                <div key={r.rfqItemId} className="border border-border rounded p-2 space-y-2">
                  <div className="text-sm font-medium">{r.description}</div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Unit price"
                      value={r.unitPrice}
                      onChange={(e) => setRow(i, "unitPrice", e.target.value)}
                      required
                    />
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={r.quantity}
                      onChange={(e) => setRow(i, "quantity", e.target.value)}
                      required
                    />
                    <Input
                      type="number"
                      placeholder="Lead days"
                      value={r.leadTimeDays}
                      onChange={(e) => setRow(i, "leadTimeDays", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="MOQ"
                      value={r.minOrderQuantity}
                      onChange={(e) => setRow(i, "minOrderQuantity", e.target.value)}
                    />
                    <Input
                      placeholder="Incoterms (e.g. FOB, CIF)"
                      value={r.incoterms}
                      onChange={(e) => setRow(i, "incoterms", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground-secondary">Currency</label>
                <Input value={currencyCode} onChange={(e) => setCurrencyCode(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground-secondary">Valid until</label>
                <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground-secondary">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-transparent px-2.5 py-1.5 text-sm"
                placeholder="Terms, incoterms, payment expectations…"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                Total: <strong>{currencyCode} {totalAmount.toFixed(2)}</strong>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Submitting…" : "Submit quote"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
