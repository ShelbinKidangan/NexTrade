"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, ShieldCheck, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { session } from "@/lib/api";

// Admin login lives under the same route group so it doesn't inherit the shell
// chrome. Everything else under (admin)/ requires a seeded platform-admin token.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginRoute = pathname === "/admin/login";
  const [adminEmail] = useState<string | null>(() =>
    typeof window === "undefined" ? null : session.getAdminUser()?.email ?? null
  );

  useEffect(() => {
    if (isLoginRoute) return;
    if (!session.hasAdmin()) {
      router.replace("/admin/login");
    }
  }, [isLoginRoute, router, pathname]);

  if (isLoginRoute) return <>{children}</>;

  function logout() {
    session.clearAdmin();
    router.replace("/admin/login");
  }

  return (
    <div className="flex h-full">
      <aside className="w-60 shrink-0 border-r border-border bg-background-secondary/30 flex flex-col">
        <div className="h-14 flex items-center gap-2 px-4 border-b border-border">
          <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background text-sm font-bold">
            N
          </div>
          <div>
            <div className="text-sm font-semibold leading-none">NexTrade</div>
            <div className="text-[10px] text-foreground-tertiary flex items-center gap-1 mt-0.5">
              <ShieldCheck className="size-2.5" /> Platform admin
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          <NavItem href="/admin/dashboard" icon={<LayoutDashboard className="size-4" />} label="Dashboard" />
        </nav>
        <div className="p-3 border-t border-border">
          <div className="text-[11px] text-foreground-tertiary truncate mb-2">{adminEmail ?? ""}</div>
          <Button variant="outline" size="sm" onClick={logout} className="w-full">
            <LogOut className="size-3.5" /> Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1280px] px-6 py-8">{children}</div>
      </main>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs ${
        active
          ? "bg-foreground text-background font-medium"
          : "text-foreground-secondary hover:bg-background hover:text-foreground"
      }`}
    >
      {icon} {label}
    </Link>
  );
}
