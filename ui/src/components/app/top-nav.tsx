"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { ThemeSwitcher } from "@/components/app/theme-switcher";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Discover", href: "/discover" },
  { label: "Catalog", href: "/catalog" },
  { label: "RFQs", href: "/rfqs" },
  { label: "Suppliers", href: "/suppliers" },
  { label: "Messages", href: "/messages" },
  { label: "Compliance", href: "/compliance" },
  { label: "Intelligence", href: "/intelligence" },
];

export function TopNav() {
  const pathname = usePathname();
  const { user, business, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 h-12 border-b border-border bg-background">
      <div className="mx-auto flex h-full max-w-[1280px] items-center gap-6 px-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-heading text-base font-semibold">
          <div className="flex size-7 items-center justify-center rounded-lg bg-accent text-white text-xs font-bold">N</div>
          NexTrade
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors",
                pathname.startsWith(item.href)
                  ? "bg-background-secondary text-foreground font-medium"
                  : "text-foreground-secondary hover:text-foreground hover:bg-background-secondary"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm">
            <Search className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm">
            <Bell className="size-4" />
          </Button>
          <ThemeSwitcher />

          {/* User menu */}
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-border">
            <Link href="/profile" className="flex size-7 items-center justify-center rounded-full bg-accent-subtle text-accent text-xs font-medium hover:ring-2 hover:ring-accent/30">
              {user?.fullName?.charAt(0) || business?.name?.charAt(0) || "N"}
            </Link>
            <div className="text-xs">
              <Link href="/profile" className="block font-medium text-foreground truncate max-w-[120px] hover:text-accent">
                {business?.name || "My Business"}
              </Link>
              <div className="flex gap-2">
                <Link href="/settings" className="text-foreground-tertiary hover:text-foreground transition-colors">
                  Settings
                </Link>
                <button onClick={logout} className="text-foreground-tertiary hover:text-danger transition-colors">
                  Sign out
                </button>
              </div>
            </div>
          </div>

          {/* Mobile hamburger */}
          <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block px-3 py-2 text-sm rounded-md",
                pathname.startsWith(item.href)
                  ? "bg-background-secondary text-foreground font-medium"
                  : "text-foreground-secondary"
              )}
            >
              {item.label}
            </Link>
          ))}
          <button onClick={logout} className="block w-full text-left px-3 py-2 text-sm text-danger">
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}
