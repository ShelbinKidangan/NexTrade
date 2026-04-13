"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BadgeCheck, Camera, Globe, MapPin, Users, Calendar, Star,
  Edit2, Eye, Save, Sparkles, Plus, X, Check, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  mockBusinessDetails, mockProfileCompleteness, mockTeamMembers,
  timeAgo,
} from "@/lib/mock-data";

const DEMO_UID = "biz-acme-metals";

const tabs = ["overview", "details", "team", "verification"] as const;

export default function ProfilePage() {
  const business = mockBusinessDetails[DEMO_UID];
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("overview");
  const [editing, setEditing] = useState(false);
  const p = business.profile!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">My Business Profile</h1>
          <p className="text-sm text-foreground-secondary">
            How your business appears to buyers across the NexTrade network.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" render={<Link href={`/business/${DEMO_UID}`} />}>
            <Eye className="size-4" /> Preview public profile
          </Button>
          {editing ? (
            <Button size="sm" onClick={() => setEditing(false)}>
              <Save className="size-4" /> Save changes
            </Button>
          ) : (
            <Button size="sm" onClick={() => setEditing(true)}>
              <Edit2 className="size-4" /> Edit profile
            </Button>
          )}
        </div>
      </div>

      {/* Completeness bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <div>
              <h3 className="text-sm font-medium">Profile completeness</h3>
              <p className="text-xs text-foreground-secondary">
                Businesses with 80%+ profiles get 3× more inquiries.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold">{mockProfileCompleteness.score}%</div>
              <div className="text-[11px] text-foreground-tertiary">4 steps remaining</div>
            </div>
          </div>
          <div className="h-2 rounded-full bg-background-secondary overflow-hidden mb-4">
            <div
              className="h-full bg-linear-to-r from-accent to-accent/70"
              style={{ width: `${mockProfileCompleteness.score}%` }}
            />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
            {mockProfileCompleteness.sections.map((s) => (
              <div
                key={s.label}
                className={`flex items-center gap-2 text-xs rounded-md px-2 py-1.5 ${
                  s.completed ? "text-foreground-secondary" : "text-foreground font-medium bg-background-secondary"
                }`}
              >
                {s.completed ? (
                  <Check className="size-3 text-success shrink-0" />
                ) : (
                  <Plus className="size-3 text-accent shrink-0" />
                )}
                <span className="truncate">{s.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Banner + avatar */}
      <div className="relative h-44 rounded-xl bg-linear-to-br from-accent/20 via-accent/10 to-accent/5 border border-border overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_50%,white_0%,transparent_50%)]" />
        <button className="absolute top-3 right-3 flex items-center gap-1.5 rounded-md bg-background/80 backdrop-blur px-2 py-1 text-xs text-foreground hover:bg-background">
          <Camera className="size-3" /> Change banner
        </button>
        <div className="absolute -bottom-8 left-6 flex size-20 items-center justify-center rounded-xl bg-background border border-border text-3xl font-bold text-foreground-secondary shadow-sm">
          {business.name.charAt(0)}
          <button className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-accent text-white border-2 border-background">
            <Camera className="size-3" />
          </button>
        </div>
      </div>

      <div className="pl-30 -mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{business.name}</h2>
            {business.isVerified && <BadgeCheck className="size-5 text-accent" />}
          </div>
          <p className="text-sm text-foreground-secondary">{p.industry}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-foreground-secondary">
            <span className="flex items-center gap-1">
              <MapPin className="size-3" /> {p.city}, {p.countryCode}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="size-3" /> Est. {p.yearEstablished}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3" /> {p.companySize}
            </span>
            <span className="flex items-center gap-1">
              <Star className="size-3 fill-warning text-warning" /> {business.trustScore.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-sm capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? "border-accent text-foreground font-medium"
                : "border-transparent text-foreground-secondary hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">About</h3>
                  <Button variant="ghost" size="xs">
                    <Sparkles className="size-3" /> Rewrite with AI
                  </Button>
                </div>
                {editing ? (
                  <textarea
                    defaultValue={p.about ?? ""}
                    rows={5}
                    className="w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm resize-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
                  />
                ) : (
                  <p className="text-sm text-foreground-secondary leading-relaxed">{p.about}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium">Capabilities</h3>
                  {editing && (
                    <Button variant="outline" size="xs">
                      <Plus className="size-3" /> Add
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {p.capabilities.map((cap) => (
                    <Badge key={cap} variant="outline" className="gap-1">
                      {cap}
                      {editing && <X className="size-3 cursor-pointer hover:text-danger" />}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium">Certifications</h3>
                  {editing && (
                    <Button variant="outline" size="xs">
                      <Plus className="size-3" /> Add
                    </Button>
                  )}
                </div>
                {p.certifications.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {p.certifications.map((c) => (
                      <Badge key={c} variant="success" className="gap-1">
                        <BadgeCheck className="size-3" /> {c}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-foreground-tertiary">No certifications added yet.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <h3 className="text-sm font-medium mb-3">Delivery regions</h3>
                <div className="flex flex-wrap gap-1.5">
                  {p.deliveryRegions.map((r) => (
                    <Badge key={r} variant="secondary">{r}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="pt-4 space-y-3">
                <h3 className="text-sm font-medium">Contact & links</h3>
                <Field label="Website" icon={<Globe className="size-3" />} value={p.website} editing={editing} />
                <Field label="LinkedIn" icon={<ExternalLink className="size-3" />} value={p.linkedInUrl} editing={editing} />
                <Field label="Headquarters" icon={<MapPin className="size-3" />} value={`${p.city}, ${p.countryCode}`} editing={editing} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 space-y-2">
                <h3 className="text-sm font-medium mb-1">Activity stats</h3>
                <div className="flex justify-between text-xs">
                  <span className="text-foreground-secondary">Response rate</span>
                  <span className="font-medium">{p.responseRate}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-foreground-secondary">Avg response</span>
                  <span className="font-medium">~{p.avgResponseTimeHours}h</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-foreground-secondary">Trust score</span>
                  <span className="font-medium flex items-center gap-1">
                    <Star className="size-3 fill-warning text-warning" /> {business.trustScore.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-foreground-secondary">Profile views (30d)</span>
                  <span className="font-medium">142</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <h3 className="text-sm font-medium mb-2">Embeddable widget</h3>
                <p className="text-xs text-foreground-secondary mb-2">
                  Show your catalog on your own website with a copy-paste widget.
                </p>
                <Button variant="outline" size="xs" className="w-full">Get embed code</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Details */}
      {activeTab === "details" && (
        <Card>
          <CardContent className="pt-4 space-y-4">
            <h3 className="text-sm font-medium mb-1">Company details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Legal name" value="Acme Metals Pvt. Ltd." editing={editing} />
              <Field label="Industry" value={p.industry ?? ""} editing={editing} />
              <Field label="Year established" value={String(p.yearEstablished ?? "")} editing={editing} />
              <Field label="Company size" value={p.companySize ?? ""} editing={editing} />
              <Field label="GST number" value="27AAFCA1234B1Z5" editing={editing} />
              <Field label="CIN" value="U27100MH2008PTC181234" editing={editing} />
              <Field label="Tax region" value="India" editing={editing} />
              <Field label="Primary currency" value="USD" editing={editing} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team */}
      {activeTab === "team" && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Team members</h3>
              <Button size="xs">
                <Plus className="size-3" /> Invite member
              </Button>
            </div>
            <ul className="divide-y divide-border">
              {mockTeamMembers.map((m) => (
                <li key={m.uid} className="flex items-center gap-3 py-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-accent-subtle text-accent text-xs font-medium">
                    {m.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{m.name}</span>
                      {m.status === "Invited" && <Badge variant="outline">Invited</Badge>}
                    </div>
                    <div className="text-xs text-foreground-tertiary truncate">{m.email}</div>
                  </div>
                  <Badge variant="secondary">{m.role}</Badge>
                  <div className="text-[11px] text-foreground-tertiary hidden md:block min-w-24 text-right">
                    {m.status === "Active" ? `Active ${timeAgo(m.lastActive)}` : "—"}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Verification */}
      {activeTab === "verification" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-success-subtle">
                  <BadgeCheck className="size-5 text-success" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Verification status: Verified</h3>
                  <p className="text-xs text-foreground-secondary">
                    Verified on 2024-06-01. Re-verification required by 2027-06-01.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Business license", status: "Verified" },
                  { label: "Tax registration (GST)", status: "Verified" },
                  { label: "Incorporation certificate", status: "Verified" },
                  { label: "Company email domain", status: "Verified" },
                  { label: "Physical address check", status: "Pending" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-xs py-2 border-b border-border last:border-0">
                    <span>{row.label}</span>
                    <Badge variant={row.status === "Verified" ? "success" : "warning"}>
                      {row.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <h3 className="text-sm font-medium mb-2">Why verification matters</h3>
              <ul className="space-y-2 text-xs text-foreground-secondary">
                <li className="flex gap-2"><Check className="size-3 text-success shrink-0 mt-0.5" /> Verified businesses get 4× more RFQ invites</li>
                <li className="flex gap-2"><Check className="size-3 text-success shrink-0 mt-0.5" /> Trust score weighted heavily on verification</li>
                <li className="flex gap-2"><Check className="size-3 text-success shrink-0 mt-0.5" /> Eligible for featured listings</li>
                <li className="flex gap-2"><Check className="size-3 text-success shrink-0 mt-0.5" /> Priority in AI matching for open RFQs</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function Field({
  label, icon, value, editing,
}: {
  label: string;
  icon?: React.ReactNode;
  value: string | null;
  editing: boolean;
}) {
  return (
    <div>
      <label className="text-[11px] text-foreground-tertiary flex items-center gap-1 mb-0.5">
        {icon} {label}
      </label>
      {editing ? (
        <Input defaultValue={value ?? ""} />
      ) : (
        <div className="text-xs text-foreground">{value || "—"}</div>
      )}
    </div>
  );
}
