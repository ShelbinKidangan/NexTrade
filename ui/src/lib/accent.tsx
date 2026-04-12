"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Accent = "blue" | "indigo" | "teal" | "warm";

export const accents: { value: Accent; label: string; light: string; dark: string }[] = [
  { value: "blue", label: "Blue", light: "#1A6EE8", dark: "#3B82F6" },
  { value: "indigo", label: "Indigo", light: "#5B5BD6", dark: "#8B7EF0" },
  { value: "teal", label: "Teal", light: "#0D9488", dark: "#14B8A6" },
  { value: "warm", label: "Warm", light: "#E8741A", dark: "#F59E42" },
];

interface AccentContext {
  accent: Accent;
  setAccent: (a: Accent) => void;
}

const Ctx = createContext<AccentContext | null>(null);

export function AccentProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState<Accent>("blue");

  useEffect(() => {
    const stored = (localStorage.getItem("accent") as Accent | null) ?? "blue";
    setAccentState(stored);
    applyAccent(stored);
  }, []);

  const setAccent = useCallback((a: Accent) => {
    setAccentState(a);
    localStorage.setItem("accent", a);
    applyAccent(a);
  }, []);

  return <Ctx value={{ accent, setAccent }}>{children}</Ctx>;
}

function applyAccent(a: Accent) {
  if (a === "blue") document.documentElement.removeAttribute("data-accent");
  else document.documentElement.setAttribute("data-accent", a);
}

export function useAccent() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAccent must be used within AccentProvider");
  return ctx;
}
