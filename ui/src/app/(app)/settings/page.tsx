"use client";

import {
  Building2, Users, ShieldCheck, Bell, CreditCard, Key, Palette, FileBadge, ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const sections = [
  {
    title: "Business",
    items: [
      { icon: Building2, title: "Business Profile", desc: "Logo, banner, about, capabilities, certifications", badge: "85% complete" },
      { icon: FileBadge, title: "Verification", desc: "Upload documents to earn the verified badge", badge: "Verified" },
      { icon: Users, title: "Team Members", desc: "Invite teammates and assign roles", badge: "4 members" },
    ],
  },
  {
    title: "Account",
    items: [
      { icon: Key, title: "Login & Security", desc: "Password, two-factor authentication, sessions", badge: null },
      { icon: Bell, title: "Notifications", desc: "Email and in-app notification preferences", badge: null },
      { icon: Palette, title: "Appearance", desc: "Theme, accent color, density", badge: null },
    ],
  },
  {
    title: "Plan",
    items: [
      { icon: CreditCard, title: "Billing & Plan", desc: "Current plan, invoices, payment methods", badge: "Pro" },
      { icon: ShieldCheck, title: "Privacy & Data", desc: "Data export, retention, deletion", badge: null },
    ],
  },
];

const team = [
  { name: "Shelbin Kidangan", role: "Admin", email: "shelbin@nextrade.example" },
  { name: "Anita Rao", role: "Catalog Manager", email: "anita@nextrade.example" },
  { name: "Karthik V", role: "Sales", email: "karthik@nextrade.example" },
  { name: "Priya M", role: "Procurement", email: "priya@nextrade.example" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-foreground-secondary">Manage your business profile, team, and preferences.</p>
      </div>

      {sections.map((section) => (
        <div key={section.title}>
          <h2 className="text-xs font-medium uppercase tracking-wide text-foreground-tertiary mb-2">
            {section.title}
          </h2>
          <div className="space-y-2">
            {section.items.map((item) => (
              <button
                key={item.title}
                className="w-full text-left flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-border-strong transition-colors"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-background-secondary text-foreground-secondary">
                  <item.icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.title}</span>
                    {item.badge && (
                      <Badge variant={item.badge === "Verified" || item.badge === "Pro" ? "success" : "outline"}>
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-foreground-secondary">{item.desc}</p>
                </div>
                <ChevronRight className="size-4 text-foreground-tertiary" />
              </button>
            ))}
          </div>
        </div>
      ))}

      <div>
        <h2 className="text-xs font-medium uppercase tracking-wide text-foreground-tertiary mb-2">
          Team
        </h2>
        <Card>
          <CardContent className="pt-2 pb-2">
            <ul className="divide-y divide-border">
              {team.map((m) => (
                <li key={m.email} className="flex items-center gap-3 py-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-accent-subtle text-accent text-xs font-medium">
                    {m.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{m.name}</div>
                    <div className="text-xs text-foreground-tertiary truncate">{m.email}</div>
                  </div>
                  <Badge variant="outline">{m.role}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
