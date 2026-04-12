"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/auth";
import { AccentProvider } from "@/lib/accent";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AccentProvider>
        <AuthProvider>{children}</AuthProvider>
      </AccentProvider>
    </ThemeProvider>
  );
}
