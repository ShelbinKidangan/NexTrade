"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, MessageSquare, Bell, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

const navItems = [
  { label: "Discover", href: "/discover" },
  { label: "Catalog", href: "/catalog" },
  { label: "RFQs", href: "/rfqs" },
  { label: "Messages", href: "/messages" },
  { label: "Network", href: "/connections" },
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

          {/* User menu */}
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-border">
            <div className="flex size-7 items-center justify-center rounded-full bg-accent-subtle text-accent text-xs font-medium">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            <div className="text-xs">
              <div className="font-medium text-foreground truncate max-w-[120px]">{business?.name}</div>
              <button onClick={logout} className="text-foreground-tertiary hover:text-danger transition-colors">
                Sign out
              </button>
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
