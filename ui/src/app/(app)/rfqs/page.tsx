"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function RfqsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">RFQs</h1>
        <Button size="sm">Create RFQ</Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-10 rounded-full bg-background-secondary flex items-center justify-center mb-3">
              <FileText className="size-5 text-foreground-tertiary" />
            </div>
            <p className="text-sm text-foreground-secondary">No RFQs yet</p>
            <p className="text-xs text-foreground-tertiary mt-1">Create a Request for Quote to get competitive bids from businesses.</p>
            <Button size="sm" className="mt-4">Create your first RFQ</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
