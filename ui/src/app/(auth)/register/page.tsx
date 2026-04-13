"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Eye, EyeOff, Sparkles, Check, BadgeCheck, ShieldCheck,
  Zap, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { authApi, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const industries = [
  "Industrial Metals", "Packaging & Materials", "Electronics", "Chemicals",
  "Logistics & Freight", "Textiles & Apparel", "Industrial Automation",
  "Construction Materials", "Foundry & Casting", "Software & IT",
  "Renewable Energy", "Medical Devices", "Food & Beverage", "Other",
];

const companySizes = [
  "Micro (1–10)", "Small (10–50)", "Medium (50–200)", "Large (200–1000)", "Enterprise (1000+)",
];

const steps = [
  { label: "Business", desc: "Your company" },
  { label: "Account", desc: "You & security" },
  { label: "Review", desc: "Confirm details" },
];

function passwordScore(pw: string): { score: number; label: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const labels = ["Too short", "Weak", "Fair", "Good", "Strong"];
  return { score: s, label: labels[s] };
}

export default function RegisterPage() {
  const { login } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    businessName: "",
    industry: "",
    companySize: "",
    country: "",
    website: "",
    fullName: "",
    email: "",
    password: "",
    agree: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pwScore = passwordScore(form.password);

  const step0Valid =
    form.businessName.trim().length > 1 && form.industry && form.companySize && form.country;
  const step1Valid =
    form.fullName.trim().length > 1 &&
    /\S+@\S+\.\S+/.test(form.email) &&
    pwScore.score >= 3 &&
    form.agree;

  function next() {
    if (step === 0 && !step0Valid) return;
    if (step === 1 && !step1Valid) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.register({
        businessName: form.businessName,
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      });
      login(res.token, res.user, res.business);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — form */}
      <div className="flex flex-col p-6 lg:p-10 order-2 lg:order-1">
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
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-semibold">Create your business account</h1>
            <p className="text-sm text-foreground-secondary mt-1">
              Join NexTrade in under 2 minutes. No credit card required.
            </p>

            {/* Stepper */}
            <div className="mt-6 flex items-center gap-2">
              {steps.map((s, i) => {
                const active = i === step;
                const done = i < step;
                return (
                  <div key={s.label} className="flex-1 flex items-center gap-2">
                    <div
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${
                        active
                          ? "bg-accent text-white"
                          : done
                          ? "bg-success text-white"
                          : "bg-background-secondary text-foreground-tertiary"
                      }`}
                    >
                      {done ? <Check className="size-3" /> : i + 1}
                    </div>
                    <div className="hidden sm:block min-w-0">
                      <div className={`text-[11px] font-medium ${active ? "text-foreground" : "text-foreground-tertiary"}`}>
                        {s.label}
                      </div>
                    </div>
                    {i < steps.length - 1 && <div className="h-px flex-1 bg-border" />}
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              {step === 0 && (
                <>
                  <div>
                    <label className="text-xs font-medium text-foreground-secondary">
                      Business name
                    </label>
                    <Input
                      value={form.businessName}
                      onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                      placeholder="Acme Industries Pvt. Ltd."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-foreground-secondary">Industry</label>
                    <select
                      value={form.industry}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                      className="mt-1 w-full h-8 rounded-md border border-input bg-transparent px-2 text-sm"
                    >
                      <option value="">Select an industry</option>
                      {industries.map((ind) => (
                        <option key={ind} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-foreground-secondary">
                        Company size
                      </label>
                      <select
                        value={form.companySize}
                        onChange={(e) => setForm({ ...form, companySize: e.target.value })}
                        className="mt-1 w-full h-8 rounded-md border border-input bg-transparent px-2 text-sm"
                      >
                        <option value="">Select size</option>
                        {companySizes.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground-secondary">
                        Country
                      </label>
                      <Input
                        value={form.country}
                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                        placeholder="India"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-foreground-secondary">
                      Website <span className="text-foreground-tertiary">(optional)</span>
                    </label>
                    <Input
                      value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })}
                      placeholder="https://acme.example.com"
                      className="mt-1"
                    />
                    <p className="text-[11px] text-foreground-tertiary mt-1 flex items-center gap-1">
                      <Sparkles className="size-3 text-accent" />
                      We&apos;ll auto-fill your profile from your website
                    </p>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <div>
                    <label className="text-xs font-medium text-foreground-secondary">Your name</label>
                    <Input
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="John Doe"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-foreground-secondary">
                      Work email
                    </label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@company.com"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-foreground-secondary">Password</label>
                    <div className="relative mt-1">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="At least 8 characters"
                        className="pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-tertiary hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </button>
                    </div>
                    {form.password.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((n) => (
                            <div
                              key={n}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                pwScore.score >= n
                                  ? pwScore.score < 2
                                    ? "bg-danger"
                                    : pwScore.score < 3
                                    ? "bg-warning"
                                    : "bg-success"
                                  : "bg-background-secondary"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-foreground-tertiary mt-1">
                          Strength: <span className="font-medium text-foreground">{pwScore.label}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <label className="flex items-start gap-2 text-xs text-foreground-secondary select-none pt-1">
                    <input
                      type="checkbox"
                      checked={form.agree}
                      onChange={(e) => setForm({ ...form, agree: e.target.checked })}
                      className="mt-0.5 size-3.5 rounded border-border accent-accent"
                    />
                    <span>
                      I agree to the{" "}
                      <a href="#" className="text-accent hover:underline">Terms of Service</a>{" "}
                      and{" "}
                      <a href="#" className="text-accent hover:underline">Privacy Policy</a>
                    </span>
                  </label>
                </>
              )}

              {step === 2 && (
                <div className="rounded-lg border border-border bg-background-secondary/50 p-4 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-white font-semibold">
                      {form.businessName.charAt(0) || "?"}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{form.businessName || "—"}</div>
                      <div className="text-[11px] text-foreground-tertiary">
                        {form.industry || "—"} · {form.companySize || "—"} · {form.country || "—"}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground-secondary">Admin</span>
                      <span>{form.fullName || "—"}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground-secondary">Email</span>
                      <span className="truncate max-w-[200px]">{form.email || "—"}</span>
                    </div>
                    {form.website && (
                      <div className="flex justify-between text-xs">
                        <span className="text-foreground-secondary">Website</span>
                        <span className="truncate max-w-[200px]">{form.website}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-foreground-tertiary pt-2 border-t border-border">
                    You can update everything after signup. We&apos;ll send a verification link to
                    your email.
                  </p>
                </div>
              )}

              {error && (
                <div className="rounded-md border border-danger/40 bg-danger/5 px-3 py-2 text-xs text-danger">
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {step > 0 && (
                  <Button type="button" variant="outline" onClick={back} className="flex-1">
                    Back
                  </Button>
                )}
                {step < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={next}
                    disabled={step === 0 ? !step0Valid : !step1Valid}
                    className="flex-1"
                  >
                    Continue <ArrowRight className="size-3.5" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Creating account..." : "Create account"}
                  </Button>
                )}
              </div>
            </form>

            <p className="text-xs text-center text-foreground-secondary mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-accent hover:underline font-medium">
                Sign in
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
      <div className="hidden lg:flex order-1 lg:order-2 relative overflow-hidden bg-linear-to-bl from-accent-subtle via-background-secondary to-background border-l border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,var(--color-accent-subtle)_0%,transparent_60%)] pointer-events-none" />
        <div className="relative flex flex-col justify-center p-12 max-w-xl">
          <Badge variant="outline" className="gap-1 w-fit mb-5 bg-background/80">
            <Sparkles className="size-3 text-accent" /> Free forever plan
          </Badge>
          <h2 className="text-3xl font-semibold leading-tight">
            Everything you need to
            <br />
            grow your business.
          </h2>
          <p className="mt-3 text-sm text-foreground-secondary max-w-md">
            Build a verified profile, list your catalog, and get matched with businesses
            actively looking for what you sell.
          </p>

          <div className="mt-8 space-y-3">
            {[
              {
                icon: BadgeCheck,
                title: "Verified business profile",
                desc: "Earn trust with document verification and a public trust score.",
              },
              {
                icon: Zap,
                title: "AI-powered matching",
                desc: "Get notified when buyers search for what you offer.",
              },
              {
                icon: MessageSquare,
                title: "Real-time messaging & RFQs",
                desc: "Negotiate quotes and close deals without leaving the platform.",
              },
              {
                icon: ShieldCheck,
                title: "Compliance vault",
                desc: "Upload certifications once, share selectively with partners.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-3 rounded-lg border border-border bg-card/80 backdrop-blur p-3"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-accent-subtle text-accent shrink-0">
                  <f.icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium">{f.title}</div>
                  <div className="text-xs text-foreground-secondary leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-border bg-card/60 backdrop-blur p-4">
            <p className="text-xs text-foreground-secondary italic leading-relaxed">
              &ldquo;We went from zero online presence to our first export order in three weeks.
              NexTrade&apos;s verification and AI matching just work.&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-full bg-accent text-white text-xs font-semibold">
                R
              </div>
              <div>
                <div className="text-xs font-medium">Rahul Desai</div>
                <div className="text-[10px] text-foreground-tertiary">CEO, Acme Metals</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
