"use client";

import { useEffect, useMemo, useState } from "react";
import { Upload, FileText, BadgeCheck, AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { complianceApi } from "@/lib/api";
import type { ComplianceDocumentDto, CreateComplianceDocumentMetadata } from "@/lib/types";

const docTypes = [
  "BusinessLicense", "TaxRegistration", "IsoCert", "Insurance", "AuditReport", "Other",
] as const;

const statusVariant: Record<
  ComplianceDocumentDto["status"],
  "success" | "warning" | "destructive" | "outline"
> = {
  Verified: "success",
  Pending: "outline",
  Rejected: "destructive",
  Expired: "warning",
};

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

export default function CompliancePage() {
  const [docs, setDocs] = useState<ComplianceDocumentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [busyUid, setBusyUid] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = () =>
    complianceApi
      .list()
      .then(setDocs)
      .catch((e) => setError(e.message ?? "Failed to load documents"))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(
    () => ({
      total: docs.length,
      verified: docs.filter((d) => d.status === "Verified").length,
      pending: docs.filter((d) => d.status === "Pending").length,
      expiring: docs.filter((d) => {
        const days = daysUntil(d.expiryDate);
        return days !== null && days >= 0 && days <= 30;
      }).length,
    }),
    [docs]
  );

  async function handleDelete(uid: string) {
    if (!confirm("Delete this document?")) return;
    setBusyUid(uid);
    try {
      await complianceApi.remove(uid);
      await load();
    } finally {
      setBusyUid(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Compliance vault</h1>
          <p className="text-sm text-foreground-secondary">
            Upload certificates and licenses. Verified documents unlock the verified badge.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowUpload(true)}>
          <Upload className="size-4" /> Upload document
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total" value={counts.total} />
        <Stat label="Verified" value={counts.verified} />
        <Stat label="Pending" value={counts.pending} />
        <Stat label="Expiring ≤30d" value={counts.expiring} />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {loading ? (
        <p className="text-sm text-foreground-secondary">Loading…</p>
      ) : docs.length === 0 ? (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="size-10 rounded-full bg-background-secondary flex items-center justify-center mb-3">
                <FileText className="size-5 text-foreground-tertiary" />
              </div>
              <p className="text-sm text-foreground-secondary">No documents yet</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {docs.map((d) => {
            const days = daysUntil(d.expiryDate);
            const expiringSoon = days !== null && days >= 0 && days <= 30;
            return (
              <Card key={d.uid}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background-secondary">
                        {d.status === "Verified" ? (
                          <BadgeCheck className="size-5 text-success" />
                        ) : expiringSoon ? (
                          <AlertTriangle className="size-5 text-warning" />
                        ) : (
                          <FileText className="size-5 text-foreground-tertiary" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-medium truncate">{d.title}</h3>
                          <Badge variant={statusVariant[d.status]}>{d.status}</Badge>
                          <Badge variant="outline">{d.type}</Badge>
                        </div>
                        {d.issuingBody && (
                          <p className="text-xs text-foreground-secondary mt-0.5">Issued by {d.issuingBody}</p>
                        )}
                        <div className="flex flex-wrap gap-3 text-[11px] text-foreground-tertiary mt-1">
                          {d.expiryDate && (
                            <span className={expiringSoon ? "text-warning font-medium" : ""}>
                              Expires {new Date(d.expiryDate).toLocaleDateString()}
                              {days !== null ? ` (${days}d)` : ""}
                            </span>
                          )}
                          <a
                            href={d.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline"
                          >
                            {d.fileName}
                          </a>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleDelete(d.uid)}
                      disabled={busyUid === d.uid}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={() => {
            setShowUpload(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="text-2xl font-semibold">{value}</div>
        <div className="text-xs text-foreground-secondary">{label}</div>
      </CardContent>
    </Card>
  );
}

function UploadModal({
  onClose, onUploaded,
}: {
  onClose: () => void;
  onUploaded: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<string>("IsoCert");
  const [title, setTitle] = useState("");
  const [issuingBody, setIssuingBody] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [visibility, setVisibility] = useState<CreateComplianceDocumentMetadata["visibility"]>("Private");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("File is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await complianceApi.upload(file, {
        type,
        title,
        issuingBody: issuingBody || undefined,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
        visibility,
      });
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto p-4">
      <Card className="w-full max-w-md my-8">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Upload document</h2>
            <Button variant="ghost" size="xs" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-xs text-danger">{error}</p>}

            <div>
              <label className="text-xs font-medium text-foreground-secondary">File *</label>
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground-secondary">Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-md border border-input bg-transparent px-2.5 py-1.5 text-sm"
              >
                {docTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground-secondary">Title *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground-secondary">Issuing body</label>
              <Input value={issuingBody} onChange={(e) => setIssuingBody(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground-secondary">Expiry date</label>
              <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground-secondary">Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as CreateComplianceDocumentMetadata["visibility"])}
                className="w-full rounded-md border border-input bg-transparent px-2.5 py-1.5 text-sm"
              >
                <option value="Private">Private</option>
                <option value="SharedOnRequest">Shared on request</option>
                <option value="Public">Public</option>
              </select>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Uploading…" : "Upload"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
