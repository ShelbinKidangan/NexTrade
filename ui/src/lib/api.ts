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
  CatalogMediaDto, CategoryDto,
  DiscoverItemDto, DiscoverBusinessDto, DiscoverItemsFilter, DiscoverBusinessesFilter,
  PublicBusinessProfileDto,
  SavedSupplierDto, SupplierListDto,
  ConnectionDto, FollowStatusDto,
  RfqDto, RfqDetailDto, CreateRfqRequest,
  QuoteDto, CreateQuoteRequest, ComparisonDto,
  DealConfirmationDto, CreateStandaloneDealRequest,
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
  get: (uid: string) =>
    apiFetch<CatalogItemDto>(`/api/catalog/${uid}`),
  create: (data: CreateCatalogItemRequest) =>
    apiFetch<CatalogItemDto>("/api/catalog", { method: "POST", body: JSON.stringify(data) }),
  update: (uid: string, data: UpdateCatalogItemRequest) =>
    apiFetch<CatalogItemDto>(`/api/catalog/${uid}`, { method: "PUT", body: JSON.stringify(data) }),
  setStatus: (uid: string, status: "Draft" | "Published" | "Archived") =>
    apiFetch<void>(`/api/catalog/${uid}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  remove: (uid: string) =>
    apiFetch<void>(`/api/catalog/${uid}`, { method: "DELETE" }),

  // Media
  listMedia: (uid: string) =>
    apiFetch<CatalogMediaDto[]>(`/api/catalog/${uid}/media`),
  uploadMedia: (uid: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiUpload<CatalogMediaDto>(`/api/catalog/${uid}/media`, fd);
  },
  deleteMedia: (uid: string, mediaId: number) =>
    apiFetch<void>(`/api/catalog/${uid}/media/${mediaId}`, { method: "DELETE" }),
  setPrimaryMedia: (uid: string, mediaId: number) =>
    apiFetch<void>(`/api/catalog/${uid}/media/${mediaId}/primary`, { method: "POST" }),
};

export const categoriesApi = {
  list: () => apiFetch<CategoryDto[]>("/api/catalog-categories", { auth: "none" }),
  create: (data: { name: string; slug: string; parentUid?: string; sortOrder?: number }) =>
    apiFetch<CategoryDto>("/api/catalog-categories", {
      method: "POST", body: JSON.stringify(data), auth: "admin",
    }),
  update: (uid: string, data: { name?: string; slug?: string; parentUid?: string; sortOrder?: number; isActive?: boolean }) =>
    apiFetch<void>(`/api/catalog-categories/${uid}`, {
      method: "PUT", body: JSON.stringify(data), auth: "admin",
    }),
  remove: (uid: string) =>
    apiFetch<void>(`/api/catalog-categories/${uid}`, { method: "DELETE", auth: "admin" }),
};

export const discoveryApi = {
  items: (filter: DiscoverItemsFilter) =>
    apiFetch<PagedResult<DiscoverItemDto>>(
      `/api/discover/items?${qs(filter as Record<string, string>)}`,
      { auth: "none" }
    ),
  businesses: (filter: DiscoverBusinessesFilter) =>
    apiFetch<PagedResult<DiscoverBusinessDto>>(
      `/api/discover/businesses?${qs(filter as Record<string, string>)}`,
      { auth: "none" }
    ),
  publicProfile: (uid: string) =>
    apiFetch<PublicBusinessProfileDto>(`/api/discover/business/${uid}`, { auth: "none" }),
};

export const savedSuppliersApi = {
  list: (listUid?: string) =>
    apiFetch<SavedSupplierDto[]>(`/api/saved-suppliers${listUid ? `?listUid=${listUid}` : ""}`),
  save: (data: { supplierUid: string; listUid?: string; notes?: string }) =>
    apiFetch<SavedSupplierDto>("/api/saved-suppliers", {
      method: "POST", body: JSON.stringify(data),
    }),
  update: (uid: string, data: { listUid?: string; notes?: string }) =>
    apiFetch<void>(`/api/saved-suppliers/${uid}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (uid: string) =>
    apiFetch<void>(`/api/saved-suppliers/${uid}`, { method: "DELETE" }),

  listLists: () => apiFetch<SupplierListDto[]>("/api/saved-suppliers/lists"),
  createList: (data: { name: string; description?: string }) =>
    apiFetch<SupplierListDto>("/api/saved-suppliers/lists", {
      method: "POST", body: JSON.stringify(data),
    }),
  updateList: (uid: string, data: { name?: string; description?: string }) =>
    apiFetch<void>(`/api/saved-suppliers/lists/${uid}`, {
      method: "PATCH", body: JSON.stringify(data),
    }),
  deleteList: (uid: string) =>
    apiFetch<void>(`/api/saved-suppliers/lists/${uid}`, { method: "DELETE" }),
};

type RfqListFilter = { page?: number; pageSize?: number; search?: string; status?: string };

export const rfqsApi = {
  mine: (filter: RfqListFilter = {}) =>
    apiFetch<PagedResult<RfqDto>>(`/api/rfqs/mine?${qs(filter as Record<string, string>)}`),
  targeted: (filter: RfqListFilter = {}) =>
    apiFetch<PagedResult<RfqDto>>(`/api/rfqs/targeted?${qs(filter as Record<string, string>)}`),
  public: (filter: RfqListFilter = {}) =>
    apiFetch<PagedResult<RfqDto>>(`/api/rfqs/public?${qs(filter as Record<string, string>)}`, { auth: "none" }),
  get: (uid: string) => apiFetch<RfqDetailDto>(`/api/rfqs/${uid}`),
  create: (data: CreateRfqRequest) =>
    apiFetch<RfqDto>("/api/rfqs", { method: "POST", body: JSON.stringify(data) }),
  update: (uid: string, data: Partial<CreateRfqRequest>) =>
    apiFetch<RfqDto>(`/api/rfqs/${uid}`, { method: "PATCH", body: JSON.stringify(data) }),
  publish: (uid: string) =>
    apiFetch<void>(`/api/rfqs/${uid}/publish`, { method: "POST" }),
  close: (uid: string) =>
    apiFetch<void>(`/api/rfqs/${uid}/close`, { method: "POST" }),
  cancel: (uid: string) =>
    apiFetch<void>(`/api/rfqs/${uid}/cancel`, { method: "POST" }),
};

export const quotesApi = {
  forRfq: (rfqUid: string) =>
    apiFetch<QuoteDto[]>(`/api/rfqs/${rfqUid}/quotes`),
  create: (rfqUid: string, data: CreateQuoteRequest) =>
    apiFetch<QuoteDto>(`/api/rfqs/${rfqUid}/quotes`, { method: "POST", body: JSON.stringify(data) }),
  update: (uid: string, data: Partial<CreateQuoteRequest>) =>
    apiFetch<QuoteDto>(`/api/quotes/${uid}`, { method: "PATCH", body: JSON.stringify(data) }),
  submit: (uid: string) =>
    apiFetch<void>(`/api/quotes/${uid}/submit`, { method: "POST" }),
  withdraw: (uid: string) =>
    apiFetch<void>(`/api/quotes/${uid}/withdraw`, { method: "POST" }),
  comparison: (rfqUid: string) =>
    apiFetch<ComparisonDto>(`/api/rfqs/${rfqUid}/quotes/comparison`),
  award: (rfqUid: string, quoteUid: string) =>
    apiFetch<void>(`/api/rfqs/${rfqUid}/award`, {
      method: "POST", body: JSON.stringify({ quoteUid }),
    }),
};

export const dealConfirmationsApi = {
  pending: () => apiFetch<DealConfirmationDto[]>("/api/deal-confirmations/pending"),
  mine: () => apiFetch<DealConfirmationDto[]>("/api/deal-confirmations/mine"),
  get: (uid: string) => apiFetch<DealConfirmationDto>(`/api/deal-confirmations/${uid}`),
  confirm: (uid: string) =>
    apiFetch<void>(`/api/deal-confirmations/${uid}/confirm`, { method: "POST" }),
  createStandalone: (data: CreateStandaloneDealRequest) =>
    apiFetch<DealConfirmationDto>("/api/deal-confirmations", {
      method: "POST", body: JSON.stringify(data),
    }),
};

export const connectionsApi = {
  following: () => apiFetch<ConnectionDto[]>("/api/connections/following"),
  followers: () => apiFetch<ConnectionDto[]>("/api/connections/followers"),
  follow: (targetUid: string) =>
    apiFetch<ConnectionDto>(`/api/connections/follow/${targetUid}`, { method: "POST" }),
  unfollow: (targetUid: string) =>
    apiFetch<void>(`/api/connections/follow/${targetUid}`, { method: "DELETE" }),
  followStatus: (targetUid: string) =>
    apiFetch<FollowStatusDto>(`/api/connections/follow/${targetUid}/status`, { auth: "none" }),
};
