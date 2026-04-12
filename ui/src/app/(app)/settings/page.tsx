"use client";

import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>
      <p className="text-sm text-foreground-secondary">Manage your business profile, team, and preferences.</p>

      <div className="grid gap-4 max-w-2xl">
        {[
          { title: "Business Profile", desc: "Company info, logo, about, capabilities" },
          { title: "Team Members", desc: "Invite and manage your team" },
          { title: "Verification", desc: "Upload documents to get verified" },
          { title: "Notifications", desc: "Email and in-app notification preferences" },
        ].map((item) => (
          <div key={item.title} className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-border-strong transition-colors cursor-pointer">
            <div>
              <div className="text-sm font-medium">{item.title}</div>
              <div className="text-xs text-foreground-secondary">{item.desc}</div>
            </div>
            <Settings className="size-4 text-foreground-tertiary" />
          </div>
        ))}
      </div>
    </div>
  );
}
