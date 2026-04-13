"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi, session, ApiError } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.adminLogin({ email, password });
      session.setAdmin(res.token, res.user);
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign-in failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-secondary/40 px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-foreground text-background">
            <ShieldCheck className="size-4" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-none">NexTrade</div>
            <div className="text-[11px] text-foreground-tertiary mt-0.5">Platform admin</div>
          </div>
        </div>

        <h1 className="text-lg font-semibold">Sign in to admin console</h1>
        <p className="text-xs text-foreground-secondary mt-0.5">
          Restricted to seeded platform administrators.
        </p>

        <form onSubmit={submit} className="mt-5 space-y-3">
          {error && (
            <div className="rounded-md border border-danger/40 bg-danger/5 px-3 py-2 text-xs text-danger">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-foreground-secondary">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nextrade.local"
              className="mt-1"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground-secondary">Password</label>
            <div className="relative mt-1">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pr-9"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-tertiary hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full h-9" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
