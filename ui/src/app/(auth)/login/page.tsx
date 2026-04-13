"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Search, Sparkles, BadgeCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { authApi, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const DEMO_EMAIL = "demo@nextrade.app";
const DEMO_PASSWORD = "demo1234";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      login(res.token, res.user, res.business);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign-in failed. Please try again.");
      setLoading(false);
    }
  }

  function fillDemo() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — form */}
      <div className="flex flex-col p-6 lg:p-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-heading font-semibold">
            <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-white text-sm font-bold">
              N
            </div>
            NexTrade
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1 text-xs text-foreground-secondary hover:text-foreground"
          >
            <ArrowLeft className="size-3" /> Back to home
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-semibold">Welcome back</h1>
            <p className="text-sm text-foreground-secondary mt-1">
              Sign in to your NexTrade business account
            </p>

            <div className="mt-6 rounded-lg border border-dashed border-accent/40 bg-accent-subtle/40 p-3 flex items-start gap-2">
              <Sparkles className="size-4 text-accent shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">Try the demo account</p>
                <p className="text-[11px] text-foreground-secondary font-mono truncate">
                  {DEMO_EMAIL} · {DEMO_PASSWORD}
                </p>
              </div>
              <button
                onClick={fillDemo}
                type="button"
                className="text-[11px] font-medium text-accent hover:underline shrink-0"
              >
                Use demo
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 mt-5">
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
                  placeholder="you@company.com"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground-secondary">Password</label>
                  <a href="#" className="text-[11px] text-accent hover:underline">
                    Forgot?
                  </a>
                </div>
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

              <label className="flex items-center gap-2 text-xs text-foreground-secondary select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="size-3.5 rounded border-border accent-accent"
                />
                Keep me signed in for 30 days
              </label>

              <Button type="submit" className="w-full h-9" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-5">
              <div className="flex items-center gap-3 text-[10px] text-foreground-tertiary uppercase tracking-wide">
                <div className="h-px flex-1 bg-border" />
                Or continue with
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button type="button" variant="outline" size="sm" className="h-9">
                  Google
                </Button>
                <Button type="button" variant="outline" size="sm" className="h-9">
                  Microsoft
                </Button>
              </div>
            </div>

            <p className="text-xs text-center text-foreground-secondary mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-accent hover:underline font-medium">
                Create one
              </Link>
            </p>
          </div>
        </div>

        <p className="text-[11px] text-center text-foreground-tertiary">
          © 2026 NexTrade. <a href="#" className="hover:text-foreground">Privacy</a> ·{" "}
          <a href="#" className="hover:text-foreground">Terms</a>
        </p>
      </div>

      {/* Right — brand panel */}
      <div className="hidden lg:flex relative overflow-hidden bg-linear-to-br from-accent-subtle via-background-secondary to-background border-l border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,var(--color-accent-subtle)_0%,transparent_60%)] pointer-events-none" />
        <div className="relative flex flex-col justify-center p-12 max-w-xl">
          <Badge variant="outline" className="gap-1 w-fit mb-5 bg-background/80">
            <Sparkles className="size-3 text-accent" /> AI-powered B2B network
          </Badge>
          <h2 className="text-3xl font-semibold leading-tight">
            Discover suppliers with
            <br />
            natural language.
          </h2>
          <p className="mt-3 text-sm text-foreground-secondary max-w-md">
            Ask for what you need in plain English. Our AI matches you with verified businesses
            ranked by trust, capability, and location.
          </p>

          {/* Mock search preview */}
          <div className="mt-8 rounded-xl border border-border bg-card/80 backdrop-blur shadow-xl p-4">
            <div className="rounded-md border border-border bg-background px-3 py-2 flex items-center gap-2">
              <Search className="size-4 text-accent" />
              <span className="text-xs text-foreground-secondary flex-1 truncate">
                &quot;food-grade packaging near Mumbai with GMP&quot;
              </span>
              <Badge variant="default" className="gap-1 shrink-0">
                <Sparkles className="size-3" /> AI
              </Badge>
            </div>
            <div className="mt-3 space-y-2">
              {[
                { name: "FastPack Industries", score: 4.8, tag: "GMP · Food Grade" },
                { name: "GreenChem Solutions", score: 4.2, tag: "REACH · Compliant" },
                { name: "TextileHub Exports", score: 4.4, tag: "GOTS · Organic" },
              ].map((b, i) => (
                <div
                  key={b.name}
                  className="flex items-center gap-2 rounded-md border border-border bg-background p-2"
                >
                  <div className="flex size-8 items-center justify-center rounded-md bg-background-secondary text-xs font-semibold text-foreground-secondary">
                    {b.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium truncate">{b.name}</span>
                      {i < 2 && <BadgeCheck className="size-3 text-accent" />}
                    </div>
                    <div className="text-[10px] text-foreground-tertiary truncate">{b.tag}</div>
                  </div>
                  <div className="flex items-center gap-0.5 text-[11px]">
                    <Star className="size-3 fill-warning text-warning" /> {b.score}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { v: "12.4k+", l: "Verified businesses" },
              { v: "48", l: "Countries" },
              { v: "3.2k / mo", l: "RFQs matched" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-lg font-semibold">{s.v}</div>
                <div className="text-[11px] text-foreground-tertiary">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
