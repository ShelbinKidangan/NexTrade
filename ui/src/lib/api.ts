const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body?: Record<string, unknown>
  ) {
    super(ApiError.extractMessage(status, statusText, body));
  }

  private static extractMessage(
    status: number, statusText: string, body?: Record<string, unknown>
  ): string {
    if (!body) return `API error: ${status} ${statusText}`;
    if (typeof body.message === "string") return body.message;
    if (typeof body.error === "string") return body.error;
    if (body.errors && typeof body.errors === "object") {
      const msgs = Object.values(body.errors as Record<string, string[]>).flat();
      if (msgs.length) return msgs.join(". ");
    }
    if (typeof body.title === "string") return body.title;
    return `API error: ${status} ${statusText}`;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let body: Record<string, unknown> | undefined;
    try { body = await res.json(); } catch {}

    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return new Promise<never>(() => {});
    }

    throw new ApiError(res.status, res.statusText, body);
  }

  if (res.status === 204 || res.headers.get("content-length") === "0") return undefined as T;
  return res.json() as Promise<T>;
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: formData,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });

  if (!res.ok) {
    let body: Record<string, unknown> | undefined;
    try { body = await res.json(); } catch {}
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return new Promise<never>(() => {});
    }
    throw new ApiError(res.status, res.statusText, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Typed API clients ──────────────────────────────────────────

import type {
  PagedResult, BusinessDto, BusinessDetailDto, UpdateProfileRequest, BusinessFilter,
  CatalogItemDto, CreateCatalogItemRequest, UpdateCatalogItemRequest, CatalogFilter,
} from "@/lib/types";

function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") p.set(k, String(v));
  }
  return p.toString();
}

export const authApi = {
  register: (data: { businessName: string; fullName: string; email: string; password: string }) =>
    apiFetch<{ token: string; user: { uid: string; fullName: string; email: string }; business: { uid: string; name: string } }>(
      "/api/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    apiFetch<{ token: string; user: { uid: string; fullName: string; email: string }; business: { uid: string; name: string } }>(
      "/api/auth/login", { method: "POST", body: JSON.stringify(data) }),
};

export const businessesApi = {
  discover: (filter: BusinessFilter) =>
    apiFetch<PagedResult<BusinessDto>>(`/api/businesses/discover?${qs(filter as Record<string, string>)}`),
  get: (uid: string) =>
    apiFetch<BusinessDetailDto>(`/api/businesses/${uid}`),
  updateProfile: (uid: string, data: UpdateProfileRequest) =>
    apiFetch<void>(`/api/businesses/${uid}/profile`, { method: "PUT", body: JSON.stringify(data) }),
};

export const catalogApi = {
  list: (filter: CatalogFilter) =>
    apiFetch<PagedResult<CatalogItemDto>>(`/api/catalog?${qs(filter as Record<string, string>)}`),
  create: (data: CreateCatalogItemRequest) =>
    apiFetch<CatalogItemDto>("/api/catalog", { method: "POST", body: JSON.stringify(data) }),
  update: (uid: string, data: UpdateCatalogItemRequest) =>
    apiFetch<CatalogItemDto>(`/api/catalog/${uid}`, { method: "PUT", body: JSON.stringify(data) }),
  publish: (uid: string) =>
    apiFetch<void>(`/api/catalog/${uid}/publish`, { method: "POST" }),
  archive: (uid: string) =>
    apiFetch<void>(`/api/catalog/${uid}/archive`, { method: "POST" }),
};
