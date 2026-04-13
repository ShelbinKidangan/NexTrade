"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Edit2, Save, X, Plus, Globe, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { businessesApi, ApiError } from "@/lib/api";
import type { BusinessDetailDto, UpdateProfileRequest } from "@/lib/types";

type Draft = Required<Pick<UpdateProfileRequest,
  "about" | "website" | "linkedInUrl" | "city" | "state" | "countryCode" | "capabilities" | "certifications" | "deliveryRegions"
>>;

function emptyDraft(): Draft {
  return {
    about: "", website: "", linkedInUrl: "",
    city: "", state: "", countryCode: "",
    capabilities: [], certifications: [], deliveryRegions: [],
  };
}

function draftFrom(b: BusinessDetailDto): Draft {
  const p = b.profile;
  return {
    about: p?.about ?? "",
    website: b.website ?? "",
    linkedInUrl: b.linkedInUrl ?? "",
    city: p?.city ?? "",
    state: p?.state ?? "",
    countryCode: p?.countryCode ?? "",
    capabilities: p?.capabilities ?? [],
    certifications: p?.certifications ?? [],
    deliveryRegions: p?.deliveryRegions ?? [],
  };
}

export default function ProfilePage() {
  const [business, setBusiness] = useState<BusinessDetailDto | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const b = await businessesApi.me();
      setBusiness(b);
      setDraft(draftFrom(b));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load your profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function save() {
    setSaving(true);
    setError("");
    try {
      await businessesApi.updateMe(draft);
      await load();
      setEditing(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  function cancel() {
    if (business) setDraft(draftFrom(business));
    setEditing(false);
  }

  if (loading) {
    return <div className="text-sm text-foreground-secondary">Loading profile…</div>;
  }

  if (!business) {
    return (
      <div className="rounded-md border border-danger/40 bg-danger/5 px-3 py-2 text-xs text-danger">
        {error || "No profile found."}
      </div>
    );
  }

  const p = business.profile;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">My Business Profile</h1>
          <p className="text-sm text-foreground-secondary">
            How your business appears to buyers across the NexTrade network.
          </p>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="outline" size="sm" onClick={cancel} disabled={saving}>
                <X className="size-4" /> Cancel
              </Button>
              <Button size="sm" onClick={save} disabled={saving}>
                <Save className="size-4" /> {saving ? "Saving…" : "Save changes"}
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => setEditing(true)}>
              <Edit2 className="size-4" /> Edit profile
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-danger/40 bg-danger/5 px-3 py-2 text-xs text-danger">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-start gap-4">
            <div className="flex size-16 items-center justify-center rounded-xl bg-background-secondary text-2xl font-bold text-foreground-secondary border border-border">
              {business.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold truncate">{business.name}</h2>
                {business.isVerified && <BadgeCheck className="size-5 text-accent" />}
              </div>
              <p className="text-sm text-foreground-secondary">{business.industry ?? "—"}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-foreground-secondary">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" /> {p?.city || "—"}, {p?.countryCode || "—"}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="size-3 fill-warning text-warning" /> {business.trustScore.toFixed(1)}
                </span>
                <span>Profile: {Math.round(p?.profileCompleteness ?? 0)}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 space-y-2">
          <h3 className="text-sm font-medium">About</h3>
          {editing ? (
            <textarea
              value={draft.about}
              onChange={(e) => setDraft({ ...draft, about: e.target.value })}
              rows={5}
              placeholder="Tell buyers what your business does…"
              className="w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm resize-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
            />
          ) : (
            <p className="text-sm text-foreground-secondary leading-relaxed whitespace-pre-wrap">
              {p?.about || <span className="text-foreground-tertiary italic">Not set.</span>}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TagList
          title="Capabilities"
          items={editing ? draft.capabilities : (p?.capabilities ?? [])}
          editing={editing}
          onChange={(v) => setDraft({ ...draft, capabilities: v })}
        />
        <TagList
          title="Certifications"
          items={editing ? draft.certifications : (p?.certifications ?? [])}
          editing={editing}
          onChange={(v) => setDraft({ ...draft, certifications: v })}
        />
        <TagList
          title="Delivery regions"
          items={editing ? draft.deliveryRegions : (p?.deliveryRegions ?? [])}
          editing={editing}
          onChange={(v) => setDraft({ ...draft, deliveryRegions: v })}
        />
        <Card>
          <CardContent className="pt-4 space-y-3">
            <h3 className="text-sm font-medium">Contact & location</h3>
            <TextField
              label="Website" icon={<Globe className="size-3" />}
              value={editing ? draft.website : (business.website ?? "")}
              editing={editing}
              onChange={(v) => setDraft({ ...draft, website: v })}
            />
            <TextField
              label="LinkedIn"
              value={editing ? draft.linkedInUrl : (business.linkedInUrl ?? "")}
              editing={editing}
              onChange={(v) => setDraft({ ...draft, linkedInUrl: v })}
            />
            <div className="grid grid-cols-3 gap-2">
              <TextField
                label="City"
                value={editing ? draft.city : (p?.city ?? "")}
                editing={editing}
                onChange={(v) => setDraft({ ...draft, city: v })}
              />
              <TextField
                label="State"
                value={editing ? draft.state : (p?.state ?? "")}
                editing={editing}
                onChange={(v) => setDraft({ ...draft, state: v })}
              />
              <TextField
                label="Country"
                value={editing ? draft.countryCode : (p?.countryCode ?? "")}
                editing={editing}
                onChange={(v) => setDraft({ ...draft, countryCode: v })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TagList({
  title, items, editing, onChange,
}: {
  title: string;
  items: string[];
  editing: boolean;
  onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const v = draft.trim();
    if (!v || items.includes(v)) return;
    onChange([...items, v]);
    setDraft("");
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <h3 className="text-sm font-medium mb-3">{title}</h3>
        <div className="flex flex-wrap gap-1.5">
          {items.length === 0 && !editing && (
            <p className="text-xs text-foreground-tertiary italic">None added yet.</p>
          )}
          {items.map((tag) => (
            <Badge key={tag} variant="outline" className="gap-1">
              {tag}
              {editing && (
                <button
                  type="button"
                  onClick={() => onChange(items.filter((t) => t !== tag))}
                  className="hover:text-danger"
                >
                  <X className="size-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
        {editing && (
          <div className="mt-3 flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); add(); }
              }}
              placeholder="Add new…"
              className="h-8 text-xs"
            />
            <Button type="button" size="xs" onClick={add}>
              <Plus className="size-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TextField({
  label, icon, value, editing, onChange,
}: {
  label: string;
  icon?: React.ReactNode;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-[11px] text-foreground-tertiary flex items-center gap-1 mb-0.5">
        {icon} {label}
      </label>
      {editing ? (
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-8 text-xs" />
      ) : (
        <div className="text-xs text-foreground">{value || "—"}</div>
      )}
    </div>
  );
}
