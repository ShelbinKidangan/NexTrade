"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { dealConfirmationsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { DealConfirmationDto } from "@/lib/types";

export function DealConfirmationBanner() {
  const { business } = useAuth();
  const [pending, setPending] = useState<DealConfirmationDto[]>([]);
  const [busyUid, setBusyUid] = useState<string | null>(null);

  const load = () =>
    dealConfirmationsApi
      .pending()
      .then(setPending)
      .catch(() => {});

  useEffect(() => {
    load();
  }, []);

  async function confirm(uid: string) {
    setBusyUid(uid);
    try {
      await dealConfirmationsApi.confirm(uid);
      await load();
    } finally {
      setBusyUid(null);
    }
  }

  if (pending.length === 0) return null;

  return (
    <div className="space-y-2">
      {pending.map((d) => {
        const isBuyer = business?.uid === d.buyerBusinessUid;
        const counterparty = isBuyer ? d.supplierBusinessName : d.buyerBusinessName;
        return (
          <Card key={d.uid} className="bg-warning-subtle/30 border-warning/30">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="size-4 text-warning" />
                    <h3 className="text-sm font-medium">Deal confirmation pending</h3>
                  </div>
                  <p className="text-xs text-foreground-secondary">
                    {d.rfqTitle ? (
                      <>
                        Confirm the deal with <strong>{counterparty}</strong> on{" "}
                        <Link href={`/rfqs/${d.rfqUid}`} className="text-accent hover:underline">
                          {d.rfqTitle}
                        </Link>
                        .
                      </>
                    ) : (
                      <>
                        Confirm the off-platform deal with <strong>{counterparty}</strong>.
                      </>
                    )}{" "}
                    This unlocks reviews and trust scoring.
                  </p>
                </div>
                <Button size="sm" onClick={() => confirm(d.uid)} disabled={busyUid === d.uid}>
                  {busyUid === d.uid ? "Confirming…" : "Confirm deal"}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
