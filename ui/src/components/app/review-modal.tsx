"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { reviewsApi } from "@/lib/api";

type Ratings = {
  overall: number;
  quality: number;
  communication: number;
  delivery: number;
  value: number;
};

export function ReviewModal({
  dealConfirmationUid,
  counterpartyName,
  onClose,
  onSubmitted,
}: {
  dealConfirmationUid: string;
  counterpartyName: string;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [ratings, setRatings] = useState<Ratings>({
    overall: 0, quality: 0, communication: 0, delivery: 0, value: 0,
  });
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (ratings.overall < 1) {
      setError("Overall rating is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await reviewsApi.create({
        dealConfirmationUid,
        overallRating: ratings.overall,
        qualityRating: ratings.quality || undefined,
        communicationRating: ratings.communication || undefined,
        deliveryRating: ratings.delivery || undefined,
        valueRating: ratings.value || undefined,
        comment: comment || undefined,
      });
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto p-4">
      <Card className="w-full max-w-md my-8">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Review {counterpartyName}</h2>
            <Button variant="ghost" size="xs" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-xs text-danger">{error}</p>}

            <StarRow
              label="Overall *"
              value={ratings.overall}
              onChange={(v) => setRatings({ ...ratings, overall: v })}
            />
            <StarRow
              label="Quality"
              value={ratings.quality}
              onChange={(v) => setRatings({ ...ratings, quality: v })}
            />
            <StarRow
              label="Communication"
              value={ratings.communication}
              onChange={(v) => setRatings({ ...ratings, communication: v })}
            />
            <StarRow
              label="Delivery"
              value={ratings.delivery}
              onChange={(v) => setRatings({ ...ratings, delivery: v })}
            />
            <StarRow
              label="Value"
              value={ratings.value}
              onChange={(v) => setRatings({ ...ratings, value: v })}
            />

            <div>
              <label className="text-xs font-medium text-foreground-secondary">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-transparent px-2.5 py-1.5 text-sm"
                placeholder="Share what went well or what could improve…"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting…" : "Submit review"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function StarRow({
  label, value, onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-foreground-secondary w-28">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="p-0.5"
          >
            <Star
              className={`size-5 ${
                n <= value ? "fill-warning text-warning" : "text-foreground-tertiary"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
