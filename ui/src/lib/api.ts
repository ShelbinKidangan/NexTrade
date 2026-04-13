const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// JWT + session storage helpers. Admin and tenant tokens are kept separate so
// an admin logout doesn't kick the tenant session out of the same browser.
const TOKEN_KEY = "token";
const ADMIN_TOKEN_KEY = "admin_token";
const USER_KEY = "user";
const BUSINESS_KEY = "business";
const ADMIN_USER_KEY = "admin_user";

type StoredUser = { uid: string; fullName: string; email: string; isPlatformAdmin: boolean };
type StoredBusiness = { uid: string; name: string };

export const session = {
  setTenant(token: string, user: StoredUser, business: StoredBusiness) {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(BUSINESS_KEY, JSON.stringify(business));
  },
  setAdmin(token: string, user: StoredUser) {
    if (typeof window === "undefined") return;
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
  },
  getUser(): StoredUser | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  },
  getBusiness(): StoredBusiness | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(BUSINESS_KEY);
    return raw ? (JSON.parse(raw) as StoredBusiness) : null;
  },
  getAdminUser(): StoredUser | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  },
  hasTenant(): boolean {
    return typeof window !== "undefined" && !!localStorage.getItem(TOKEN_KEY);
  },
  hasAdmin(): boolean {
    return typeof window !== "undefined" && !!localStorage.getItem(ADMIN_TOKEN_KEY);
  },
  clearTenant() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(BUSINESS_KEY);
  },
  clearAdmin() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  },
};

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

type AuthScope = "tenant" | "admin" | "none";

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { auth?: AuthScope }
): Promise<T> {
  const scope: AuthScope = init?.auth ?? "tenant";
  const token = typeof window === "undefined"
    ? null
    : scope === "admin"
      ? localStorage.getItem(ADMIN_TOKEN_KEY)
      : scope === "tenant"
        ? localStorage.getItem(TOKEN_KEY)
        : null;

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
      if (scope === "admin") {
        session.clearAdmin();
        window.location.href = "/admin/login";
      } else if (scope === "tenant") {
        session.clearTenant();
        window.location.href = "/login";
      }
      return new Promise<never>(() => {});
    }

    throw new ApiError(res.status, res.statusText, body);
  }

  if (res.status === 204 || res.headers.get("content-length") === "0") return undefined as T;
  return res.json() as Promise<T>;
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: formData,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });

  if (!res.ok) {
    let body: Record<string, unknown> | undefined;
    try { body = await res.json(); } catch {}
    if (res.status === 401 && typeof window !== "undefined") {
      session.clearTenant();
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

type AuthResponse = {
  token: string;
  user: { uid: string; fullName: string; email: string; isPlatformAdmin: boolean };
  business: { uid: string; name: string };
};

type AdminAuthResponse = {
  token: string;
  user: { uid: string; fullName: string; email: string; isPlatformAdmin: boolean };
};

export const authApi = {
  register: (data: { businessName: string; fullName: string; email: string; password: string }) =>
    apiFetch<AuthResponse>("/api/auth/register", {
      method: "POST", body: JSON.stringify(data), auth: "none",
    }),
  login: (data: { email: string; password: string }) =>
    apiFetch<AuthResponse>("/api/auth/login", {
      method: "POST", body: JSON.stringify(data), auth: "none",
    }),
  adminLogin: (data: { email: string; password: string }) =>
    apiFetch<AdminAuthResponse>("/api/auth/admin-login", {
      method: "POST", body: JSON.stringify(data), auth: "none",
    }),
};

export const businessesApi = {
  discover: (filter: BusinessFilter) =>
    apiFetch<PagedResult<BusinessDto>>(
      `/api/businesses/discover?${qs(filter as Record<string, string>)}`,
      { auth: "none" }
    ),
  get: (uid: string) =>
    apiFetch<BusinessDetailDto>(`/api/businesses/${uid}`, { auth: "none" }),
  me: () =>
    apiFetch<BusinessDetailDto>("/api/businesses/me"),
  updateMe: (data: UpdateProfileRequest) =>
    apiFetch<void>("/api/businesses/me", { method: "PATCH", body: JSON.stringify(data) }),
};

type IndustryDto = { uid: string; name: string; slug: string; parentUid: string | null; sortOrder: number };
type CountryDto = { code: string; code3: string; name: string };
type CurrencyDto = { code: string; name: string; symbol: string; decimalPlaces: number };

export const referenceApi = {
  industries: () => apiFetch<IndustryDto[]>("/api/reference/industries", { auth: "none" }),
  countries: () => apiFetch<CountryDto[]>("/api/reference/countries", { auth: "none" }),
  currencies: () => apiFetch<CurrencyDto[]>("/api/reference/currencies", { auth: "none" }),
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
