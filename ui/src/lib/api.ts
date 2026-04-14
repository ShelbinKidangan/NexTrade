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
  ConversationDto, MessageDto, FindOrCreateConversationRequest,
  ComplianceDocumentDto, CreateComplianceDocumentMetadata,
  ReviewDto, CreateReviewRequest, TrustScoreBreakdown,
} from "@/lib/types";

export const API_BASE_URL = API_BASE;

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

export const conversationsApi = {
  list: () =>
    apiFetch<PagedResult<ConversationDto>>("/api/conversations"),
  get: (uid: string) =>
    apiFetch<ConversationDto>(`/api/conversations/${uid}`),
  messages: (uid: string, page = 1, pageSize = 50) =>
    apiFetch<PagedResult<MessageDto>>(`/api/conversations/${uid}/messages?page=${page}&pageSize=${pageSize}`),
  send: (uid: string, content: string, attachments: string[] = []) =>
    apiFetch<MessageDto>(`/api/conversations/${uid}/messages`, {
      method: "POST", body: JSON.stringify({ content, attachments }),
    }),
  read: (uid: string, messageId: number) =>
    apiFetch<void>(`/api/conversations/${uid}/read`, {
      method: "POST", body: JSON.stringify({ messageId }),
    }),
  findOrCreate: (data: FindOrCreateConversationRequest) =>
    apiFetch<ConversationDto>("/api/conversations/find-or-create", {
      method: "POST", body: JSON.stringify(data),
    }),
};

export const complianceApi = {
  list: () => apiFetch<ComplianceDocumentDto[]>("/api/compliance/documents"),
  get: (uid: string) => apiFetch<ComplianceDocumentDto>(`/api/compliance/documents/${uid}`),
  upload: (file: File, metadata: CreateComplianceDocumentMetadata) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("metadata", JSON.stringify(metadata));
    return apiUpload<ComplianceDocumentDto>("/api/compliance/documents", fd);
  },
  remove: (uid: string) =>
    apiFetch<void>(`/api/compliance/documents/${uid}`, { method: "DELETE" }),
  verify: (uid: string) =>
    apiFetch<void>(`/api/compliance/documents/${uid}/verify`, {
      method: "POST", auth: "admin",
    }),
  reject: (uid: string, reason: string) =>
    apiFetch<void>(`/api/compliance/documents/${uid}/reject`, {
      method: "POST", body: JSON.stringify({ reason }), auth: "admin",
    }),
};

export const reviewsApi = {
  create: (data: CreateReviewRequest) =>
    apiFetch<ReviewDto>("/api/reviews", { method: "POST", body: JSON.stringify(data) }),
  forBusiness: (uid: string, page = 1, pageSize = 20) =>
    apiFetch<PagedResult<ReviewDto>>(`/api/businesses/${uid}/reviews?page=${page}&pageSize=${pageSize}`, { auth: "none" }),
};

export const trustScoreApi = {
  get: (uid: string) =>
    apiFetch<TrustScoreBreakdown>(`/api/businesses/${uid}/trust-score`, { auth: "none" }),
  recompute: (uid: string) =>
    apiFetch<{ uid: string; trustScore: number }>(
      `/api/businesses/${uid}/trust-score/recompute`,
      { method: "POST", auth: "admin" }
    ),
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

// ── Admin console ──────────────────────────────────────────

export type AdminBusinessRow = {
  uid: string; name: string; isVerified: boolean; trustScore: number;
  isActive: boolean; isSuspended: boolean; suspendedAt: string | null;
  industry: string | null; country: string | null; logo: string | null;
  publishedItemCount: number; openRfqCount: number; complianceDocCount: number;
  profileSource: string; createdAt: string;
};
export type AdminBusinessDetail = AdminBusinessRow & {
  subdomain: string | null; verifiedAt: string | null;
  suspensionReason: string | null; yearEstablished: number | null;
  companySize: string | null; website: string | null; linkedInUrl: string | null;
  about: string | null; city: string | null; countryCode: string | null;
  userCount: number; complianceVerifiedCount: number; complianceTotalCount: number;
};
export type AdminBusinessFilter = {
  page?: number; pageSize?: number; search?: string;
  status?: string; verifiedOnly?: boolean; country?: string;
};

export type AdminComplianceDoc = {
  uid: string; businessUid: string; businessName: string;
  type: string; title: string; description: string | null;
  fileUrl: string; fileName: string;
  issuingBody: string | null; issueDate: string | null; expiryDate: string | null;
  status: string; visibility: string; createdAt: string;
};
export type AdminVerificationFilter = {
  page?: number; pageSize?: number; status?: string;
  type?: string; country?: string; tenantUid?: string; ageDays?: number;
};

export type AdminIndustry = {
  uid: string; name: string; slug: string; parentUid: string | null;
  sortOrder: number; isActive: boolean;
};
export type AdminCountry = { uid: string; code: string; code3: string; name: string; isActive: boolean };
export type AdminCurrency = { uid: string; code: string; name: string; symbol: string; decimalPlaces: number; isActive: boolean };
export type AdminCatalogCategory = {
  uid: string; name: string; slug: string; parentUid: string | null;
  level: number; sortOrder: number; isActive: boolean;
};

export type AdminUserRow = {
  uid: string; email: string; fullName: string;
  isActive: boolean; isPlatformAdmin: boolean; isLockedOut: boolean;
  tenantId: string | null; tenantName: string | null;
  lastLoginAt: string | null; createdAt: string;
};
export type AdminUserFilter = {
  page?: number; pageSize?: number; search?: string;
  tenantUid?: string; lockedOnly?: boolean;
};

export type AdminCatalogItemRow = {
  uid: string; title: string; type: string; status: string;
  supplierUid: string; supplierName: string; createdAt: string;
};
export type AdminRfqRow = {
  uid: string; title: string; status: string; moderation: string;
  buyerUid: string; buyerName: string; createdAt: string;
};
export type AdminReviewRow = {
  uid: string; overallRating: number; comment: string | null;
  moderation: string;
  reviewerUid: string; reviewedUid: string;
  reviewerName: string | null; reviewedName: string | null;
  createdAt: string;
};
export type ContentFilter = { page?: number; pageSize?: number; search?: string; status?: string };

export type AdminOverview = {
  businessesTotal: number; businessesLast30d: number;
  verifiedBusinesses: number; verifiedRate: number;
  publishedItems: number; openRfqs: number; dealsConfirmed: number;
  activeUsersMonthly: number;
  avgQuoteResponseHours: number;
  trustDistribution: { range: string; count: number }[];
};
export type AdminTimeseriesPoint = { date: string; value: number };

export type AdminAuditEntry = {
  uid: string; adminUserId: number; adminEmail: string; action: string;
  targetEntity: string | null; targetUid: string | null;
  payload: string | null; route: string | null; method: string | null;
  statusCode: number | null; ipAddress: string | null;
  createdAt: string;
};

export const admin = {
  // businesses
  listBusinesses: (filter: AdminBusinessFilter) =>
    apiFetch<PagedResult<AdminBusinessRow>>(
      `/api/admin/businesses?${qs(filter as Record<string, string>)}`,
      { auth: "admin" }
    ),
  getBusiness: (uid: string) =>
    apiFetch<AdminBusinessDetail>(`/api/admin/businesses/${uid}`, { auth: "admin" }),
  verifyBusiness: (uid: string) =>
    apiFetch<void>(`/api/admin/businesses/${uid}/verify`, { method: "POST", auth: "admin" }),
  suspendBusiness: (uid: string, reason: string) =>
    apiFetch<void>(`/api/admin/businesses/${uid}/suspend`, {
      method: "POST", body: JSON.stringify({ reason }), auth: "admin",
    }),
  unsuspendBusiness: (uid: string) =>
    apiFetch<void>(`/api/admin/businesses/${uid}/unsuspend`, { method: "POST", auth: "admin" }),
  deleteBusiness: (uid: string) =>
    apiFetch<void>(`/api/admin/businesses/${uid}/delete`, { method: "POST", auth: "admin" }),

  // verifications (compliance queue)
  listVerifications: (filter: AdminVerificationFilter) =>
    apiFetch<PagedResult<AdminComplianceDoc>>(
      `/api/admin/verifications/compliance?${qs(filter as Record<string, string>)}`,
      { auth: "admin" }
    ),
  approveVerification: (uid: string) =>
    apiFetch<void>(`/api/admin/verifications/compliance/${uid}/approve`, { method: "POST", auth: "admin" }),
  rejectVerification: (uid: string, reason: string) =>
    apiFetch<void>(`/api/admin/verifications/compliance/${uid}/reject`, {
      method: "POST", body: JSON.stringify({ reason }), auth: "admin",
    }),
  bulkApproveVerifications: (uids: string[]) =>
    apiFetch<{ approved: number }>("/api/admin/verifications/compliance/bulk-approve", {
      method: "POST", body: JSON.stringify({ uids }), auth: "admin",
    }),

  // reference data
  listIndustries: () => apiFetch<AdminIndustry[]>("/api/admin/industries", { auth: "admin" }),
  createIndustry: (data: { name: string; slug: string; parentUid?: string; sortOrder: number }) =>
    apiFetch<AdminIndustry>("/api/admin/industries", {
      method: "POST", body: JSON.stringify(data), auth: "admin",
    }),
  updateIndustry: (uid: string, data: { name?: string; slug?: string; parentUid?: string; sortOrder?: number; isActive?: boolean }) =>
    apiFetch<void>(`/api/admin/industries/${uid}`, {
      method: "PUT", body: JSON.stringify(data), auth: "admin",
    }),
  deleteIndustry: (uid: string) =>
    apiFetch<void>(`/api/admin/industries/${uid}`, { method: "DELETE", auth: "admin" }),
  reorderIndustries: (uids: string[]) =>
    apiFetch<void>("/api/admin/industries/reorder", {
      method: "POST", body: JSON.stringify({ uids }), auth: "admin",
    }),

  listCountries: () => apiFetch<AdminCountry[]>("/api/admin/countries", { auth: "admin" }),
  createCountry: (data: { code: string; code3: string; name: string }) =>
    apiFetch<AdminCountry>("/api/admin/countries", {
      method: "POST", body: JSON.stringify(data), auth: "admin",
    }),
  updateCountry: (uid: string, data: { name?: string; isActive?: boolean }) =>
    apiFetch<void>(`/api/admin/countries/${uid}`, {
      method: "PUT", body: JSON.stringify(data), auth: "admin",
    }),

  listCurrencies: () => apiFetch<AdminCurrency[]>("/api/admin/currencies", { auth: "admin" }),
  createCurrency: (data: { code: string; name: string; symbol: string; decimalPlaces: number }) =>
    apiFetch<AdminCurrency>("/api/admin/currencies", {
      method: "POST", body: JSON.stringify(data), auth: "admin",
    }),
  updateCurrency: (uid: string, data: { name?: string; symbol?: string; decimalPlaces?: number; isActive?: boolean }) =>
    apiFetch<void>(`/api/admin/currencies/${uid}`, {
      method: "PUT", body: JSON.stringify(data), auth: "admin",
    }),

  listAdminCatalogCategories: () =>
    apiFetch<AdminCatalogCategory[]>("/api/admin/catalog-categories", { auth: "admin" }),
  createAdminCatalogCategory: (data: { name: string; slug: string; parentUid?: string; sortOrder: number }) =>
    apiFetch<AdminCatalogCategory>("/api/admin/catalog-categories", {
      method: "POST", body: JSON.stringify(data), auth: "admin",
    }),
  updateAdminCatalogCategory: (uid: string, data: { name?: string; slug?: string; parentUid?: string; sortOrder?: number; isActive?: boolean }) =>
    apiFetch<void>(`/api/admin/catalog-categories/${uid}`, {
      method: "PUT", body: JSON.stringify(data), auth: "admin",
    }),
  deleteAdminCatalogCategory: (uid: string) =>
    apiFetch<void>(`/api/admin/catalog-categories/${uid}`, { method: "DELETE", auth: "admin" }),

  // users
  listUsers: (filter: AdminUserFilter) =>
    apiFetch<PagedResult<AdminUserRow>>(
      `/api/admin/users?${qs(filter as Record<string, string>)}`,
      { auth: "admin" }
    ),
  unlockUser: (uid: string) =>
    apiFetch<void>(`/api/admin/users/${uid}/unlock`, { method: "POST", auth: "admin" }),
  resetUserPassword: (uid: string, newPassword: string) =>
    apiFetch<void>(`/api/admin/users/${uid}/reset-password`, {
      method: "POST", body: JSON.stringify({ newPassword }), auth: "admin",
    }),
  promoteUser: (uid: string) =>
    apiFetch<void>(`/api/admin/users/${uid}/promote`, { method: "POST", auth: "admin" }),
  demoteUser: (uid: string) =>
    apiFetch<void>(`/api/admin/users/${uid}/demote`, { method: "POST", auth: "admin" }),

  // content moderation
  listCatalogItems: (filter: ContentFilter) =>
    apiFetch<PagedResult<AdminCatalogItemRow>>(
      `/api/admin/content/catalog-items?${qs(filter as Record<string, string>)}`,
      { auth: "admin" }
    ),
  hideCatalogItem: (uid: string) =>
    apiFetch<void>(`/api/admin/content/catalog-items/${uid}/hide`, { method: "POST", auth: "admin" }),
  flagCatalogItem: (uid: string) =>
    apiFetch<void>(`/api/admin/content/catalog-items/${uid}/flag`, { method: "POST", auth: "admin" }),
  deleteCatalogItem: (uid: string) =>
    apiFetch<void>(`/api/admin/content/catalog-items/${uid}/delete`, { method: "POST", auth: "admin" }),

  listContentRfqs: (filter: ContentFilter) =>
    apiFetch<PagedResult<AdminRfqRow>>(
      `/api/admin/content/rfqs?${qs(filter as Record<string, string>)}`,
      { auth: "admin" }
    ),
  hideContentRfq: (uid: string) =>
    apiFetch<void>(`/api/admin/content/rfqs/${uid}/hide`, { method: "POST", auth: "admin" }),
  flagContentRfq: (uid: string) =>
    apiFetch<void>(`/api/admin/content/rfqs/${uid}/flag`, { method: "POST", auth: "admin" }),
  deleteContentRfq: (uid: string) =>
    apiFetch<void>(`/api/admin/content/rfqs/${uid}/delete`, { method: "POST", auth: "admin" }),

  listContentReviews: (filter: ContentFilter) =>
    apiFetch<PagedResult<AdminReviewRow>>(
      `/api/admin/content/reviews?${qs(filter as Record<string, string>)}`,
      { auth: "admin" }
    ),
  hideContentReview: (uid: string) =>
    apiFetch<void>(`/api/admin/content/reviews/${uid}/hide`, { method: "POST", auth: "admin" }),
  flagContentReview: (uid: string) =>
    apiFetch<void>(`/api/admin/content/reviews/${uid}/flag`, { method: "POST", auth: "admin" }),
  deleteContentReview: (uid: string) =>
    apiFetch<void>(`/api/admin/content/reviews/${uid}/delete`, { method: "POST", auth: "admin" }),

  // metrics
  metricsOverview: () =>
    apiFetch<AdminOverview>("/api/admin/metrics/overview", { auth: "admin" }),
  metricsTimeseries: (metric: string, days: number) =>
    apiFetch<AdminTimeseriesPoint[]>(
      `/api/admin/metrics/timeseries?metric=${metric}&days=${days}`,
      { auth: "admin" }
    ),

  // audit log
  listAuditLog: (filter: { page?: number; pageSize?: number; action?: string; targetEntity?: string }) =>
    apiFetch<PagedResult<AdminAuditEntry>>(
      `/api/admin/audit-log?${qs(filter as Record<string, string>)}`,
      { auth: "admin" }
    ),
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
