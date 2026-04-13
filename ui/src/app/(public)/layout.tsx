"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/app/theme-switcher";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-50 h-12 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-full max-w-[1280px] items-center gap-6 px-4">
          <Link href="/" className="flex items-center gap-2 font-heading text-base font-semibold">
            <div className="flex size-7 items-center justify-center rounded-lg bg-accent text-white text-xs font-bold">N</div>
            NexTrade
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/search" className="px-3 py-1.5 text-sm rounded-md text-foreground-secondary hover:text-foreground hover:bg-background-secondary">
              Discover
            </Link>
            <Link href="/due-diligence" className="px-3 py-1.5 text-sm rounded-md text-foreground-secondary hover:text-foreground hover:bg-background-secondary">
              Due Diligence
            </Link>
            <Link href="/pricing" className="px-3 py-1.5 text-sm rounded-md text-foreground-secondary hover:text-foreground hover:bg-background-secondary">
              Pricing
            </Link>
          </nav>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Button variant="ghost" size="sm" render={<Link href="/login" />}>Sign in</Button>
            <Button size="sm" render={<Link href="/register" />}>Get started</Button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border mt-12">
        <div className="mx-auto max-w-[1280px] px-4 py-6 flex flex-wrap items-center justify-between gap-3 text-xs text-foreground-tertiary">
          <div>© 2026 NexTrade · Supplier intelligence platform</div>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-foreground">About</Link>
            <Link href="/" className="hover:text-foreground">Privacy</Link>
            <Link href="/" className="hover:text-foreground">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
