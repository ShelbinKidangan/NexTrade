"use client";

import { TopNav } from "@/components/app/top-nav";

// TEMP: auth gate disabled for dev browsing. Re-enable before shipping.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <TopNav />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1280px] px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
