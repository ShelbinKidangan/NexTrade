export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Business
export interface BusinessDto {
  uid: string;
  name: string;
  isVerified: boolean;
  trustScore: number;
  logo: string | null;
  about: string | null;
  city: string | null;
  countryCode: string | null;
  industry: string | null;
  capabilities: string[];
  createdAt: string;
}

export interface BusinessDetailDto {
  uid: string;
  name: string;
  isVerified: boolean;
  trustScore: number;
  verifiedAt: string | null;
  industry: string | null;
  companySize: string | null;
  yearEstablished: number | null;
  website: string | null;
  linkedInUrl: string | null;
  profileSource: string;
  profile: ProfileDto | null;
  createdAt: string;
}

export interface ProfileDto {
  logo: string | null;
  bannerImage: string | null;
  about: string | null;
  city: string | null;
  state: string | null;
  countryCode: string | null;
  capabilities: string[];
  certifications: string[];
  deliveryRegions: string[];
  additionalLocations: string[];
  socialLinks: Record<string, string>;
  responseRate: number;
  avgResponseTimeHours: number;
  profileCompleteness: number;
}

export interface UpdateProfileRequest {
  about?: string;
  website?: string;
  linkedInUrl?: string;
  yearEstablished?: number;
  companySize?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  countryCode?: string;
  capabilities?: string[];
  certifications?: string[];
  deliveryRegions?: string[];
  industryUid?: string;
}

export interface BusinessFilter {
  page?: number;
  pageSize?: number;
  search?: string;
  industry?: string;
  country?: string;
  verifiedOnly?: boolean;
}

// Catalog
export interface CatalogItemDto {
  uid: string;
  type: string;
  title: string;
  description: string | null;
  category: string | null;
  pricingType: string;
  priceMin: number | null;
  priceMax: number | null;
  currencyCode: string | null;
  minOrderQuantity: number | null;
  leadTimeDays: number | null;
  status: string;
  viewCount: number;
  inquiryCount: number;
  primaryImageUrl: string | null;
  createdAt: string;
}

export interface CreateCatalogItemRequest {
  type: string;
  title: string;
  description?: string;
  specifications?: string;
  categoryUid?: string;
  pricingType: string;
  priceMin?: number;
  priceMax?: number;
  currencyCode?: string;
  minOrderQuantity?: number;
  leadTimeDays?: number;
  deliveryRegions?: string[];
}

export interface UpdateCatalogItemRequest {
  title?: string;
  description?: string;
  specifications?: string;
  categoryUid?: string;
  pricingType?: string;
  priceMin?: number;
  priceMax?: number;
  currencyCode?: string;
  minOrderQuantity?: number;
  leadTimeDays?: number;
  deliveryRegions?: string[];
}

export interface CatalogFilter {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  status?: string;
  categoryUid?: string;
}
