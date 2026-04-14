import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Admin console</h1>
        <p className="text-sm text-foreground-secondary">
          Placeholder shell. The full console lands in{" "}
          <Link href="#" className="text-accent hover:underline">Sprint 5</Link>.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 pb-6 flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-accent-subtle text-accent shrink-0">
            <Sparkles className="size-4" />
          </div>
          <div className="text-sm text-foreground-secondary leading-relaxed">
            You are signed in as a platform administrator. Sprint 1 only ships the
            auth shell — tenant moderation, verification queues, S2P seeding, and
            feature flags arrive in Sprint 5.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
