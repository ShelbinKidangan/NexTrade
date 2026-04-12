"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Palette, Sun, Moon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccent, accents, type Accent } from "@/lib/accent";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const { accent, setAccent } = useAccent();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div ref={ref} className="relative">
      <Button variant="ghost" size="icon-sm" onClick={() => setOpen(!open)}>
        <Palette className="size-4" />
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-popover p-3 shadow-lg animate-fade-in">
          <div className="mb-3">
            <div className="mb-2 text-xs font-medium text-foreground-secondary">Appearance</div>
            <div className="flex gap-1 rounded-md bg-background-secondary p-1">
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 rounded px-2 py-1.5 text-xs transition-colors",
                  !isDark ? "bg-background text-foreground shadow-sm" : "text-foreground-secondary hover:text-foreground"
                )}
              >
                <Sun className="size-3.5" /> Light
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 rounded px-2 py-1.5 text-xs transition-colors",
                  isDark ? "bg-background text-foreground shadow-sm" : "text-foreground-secondary hover:text-foreground"
                )}
              >
                <Moon className="size-3.5" /> Dark
              </button>
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs font-medium text-foreground-secondary">Accent</div>
            <div className="grid grid-cols-4 gap-2">
              {accents.map((a) => (
                <AccentSwatch
                  key={a.value}
                  accent={a}
                  selected={accent === a.value}
                  isDark={isDark}
                  onClick={() => setAccent(a.value)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AccentSwatch({
  accent, selected, isDark, onClick,
}: {
  accent: { value: Accent; label: string; light: string; dark: string };
  selected: boolean;
  isDark: boolean;
  onClick: () => void;
}) {
  const color = isDark ? accent.dark : accent.light;
  return (
    <button
      type="button"
      onClick={onClick}
      title={accent.label}
      className={cn(
        "group flex flex-col items-center gap-1 rounded-md p-1 transition-colors hover:bg-background-secondary",
        selected && "bg-background-secondary"
      )}
    >
      <div
        className="relative flex size-7 items-center justify-center rounded-full ring-1 ring-border"
        style={{ backgroundColor: color }}
      >
        {selected && <Check className="size-3.5 text-white" />}
      </div>
      <span className="text-[10px] text-foreground-secondary">{accent.label}</span>
    </button>
  );
}
