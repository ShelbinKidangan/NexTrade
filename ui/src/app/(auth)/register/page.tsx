"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ businessName: "", fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.register(form);
      login(res.token, res.user, res.business);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-white text-sm font-bold">N</div>
          <span className="font-heading font-semibold">NexTrade</span>
        </div>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Register your business on NexTrade</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-xs text-danger">{error}</p>}
          <div>
            <label className="text-xs font-medium text-foreground-secondary">Business name</label>
            <Input value={form.businessName} onChange={set("businessName")} placeholder="Acme Industries" required />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground-secondary">Your name</label>
            <Input value={form.fullName} onChange={set("fullName")} placeholder="John Doe" required />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground-secondary">Email</label>
            <Input type="email" value={form.email} onChange={set("email")} required />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground-secondary">Password</label>
            <Input type="password" value={form.password} onChange={set("password")} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-xs text-foreground-secondary">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">Sign in</Link>
        </p>
      </CardFooter>
    </Card>
  );
}
