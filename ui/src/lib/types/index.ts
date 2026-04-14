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
export interface CatalogMediaDto {
  id: number;
  url: string;
  fileName: string;
  fileSize: number;
  isPrimary: boolean;
  sortOrder: number;
}

export interface CatalogItemDto {
  uid: string;
  type: string;
  title: string;
  description: string | null;
  category: string | null;
  categoryUid: string | null;
  pricingType: string;
  priceMin: number | null;
  priceMax: number | null;
  currencyCode: string | null;
  minOrderQuantity: number | null;
  leadTimeDays: number | null;
  deliveryRegions: string[];
  status: string;
  viewCount: number;
  inquiryCount: number;
  primaryImageUrl: string | null;
  media: CatalogMediaDto[];
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

// Catalog categories
export interface CategoryDto {
  uid: string;
  name: string;
  slug: string;
  parentUid: string | null;
  level: number;
  sortOrder: number;
  isActive: boolean;
}

// Discovery
export interface DiscoverItemDto {
  uid: string;
  title: string;
  description: string | null;
  type: string;
  category: string | null;
  pricingType: string;
  priceMin: number | null;
  priceMax: number | null;
  currencyCode: string | null;
  leadTimeDays: number | null;
  primaryImageUrl: string | null;
  supplierUid: string;
  supplierName: string;
  supplierVerified: boolean;
  supplierCountry: string | null;
  createdAt: string;
}

export interface DiscoverBusinessDto {
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
  publishedItemCount: number;
  createdAt: string;
}

export interface DiscoverItemsFilter {
  search?: string;
  categoryUid?: string;
  type?: string;
  industry?: string;
  country?: string;
  page?: number;
  pageSize?: number;
}

export interface DiscoverBusinessesFilter {
  search?: string;
  industry?: string;
  country?: string;
  verifiedOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PublicBusinessProfileDto {
  uid: string;
  name: string;
  isVerified: boolean;
  trustScore: number;
  logo: string | null;
  bannerImage: string | null;
  about: string | null;
  industry: string | null;
  city: string | null;
  countryCode: string | null;
  capabilities: string[];
  certifications: string[];
  deliveryRegions: string[];
  yearEstablished: number;
  companySize: string | null;
  website: string | null;
  followerCount: number;
  publishedItemCount: number;
  hasComplianceDocs: boolean;
  items: DiscoverItemDto[];
}

// Saved suppliers
export interface SavedSupplierDto {
  uid: string;
  supplierUid: string;
  supplierName: string;
  supplierVerified: boolean;
  supplierLogo: string | null;
  supplierCountry: string | null;
  listUid: string | null;
  listName: string | null;
  notes: string | null;
  createdAt: string;
}

export interface SupplierListDto {
  uid: string;
  name: string;
  description: string | null;
  supplierCount: number;
  createdAt: string;
}

// Connections
export interface ConnectionDto {
  uid: string;
  requesterUid: string;
  targetUid: string;
  type: string;
  status: string;
  otherUid: string;
  otherName: string;
  otherVerified: boolean;
  otherLogo: string | null;
  otherCountry: string | null;
  createdAt: string;
}

export interface FollowStatusDto {
  isFollowing: boolean;
  followerCount: number;
}

// RFQ + Quote
export interface RfqItemDto {
  id: number;
  description: string;
  specifications: string | null;
  quantity: number | null;
  unitOfMeasure: string | null;
  categoryUid: string | null;
  sortOrder: number;
}

export interface RfqTargetDto {
  supplierBusinessUid: string;
  supplierName: string | null;
  sentAt: string | null;
}

export interface RfqDto {
  uid: string;
  buyerBusinessUid: string;
  buyerBusinessName: string;
  title: string;
  description: string | null;
  visibility: "Public" | "Targeted";
  status: "Draft" | "Open" | "Closed" | "Awarded" | "Cancelled";
  responseDeadline: string | null;
  deliveryLocation: string | null;
  deliveryTimeline: string | null;
  attachments: string[];
  itemCount: number;
  quoteCount: number;
  createdAt: string;
}

export interface RfqDetailDto {
  uid: string;
  buyerBusinessUid: string;
  buyerBusinessName: string;
  title: string;
  description: string | null;
  visibility: "Public" | "Targeted";
  status: "Draft" | "Open" | "Closed" | "Awarded" | "Cancelled";
  responseDeadline: string | null;
  deliveryLocation: string | null;
  deliveryTimeline: string | null;
  attachments: string[];
  items: RfqItemDto[];
  targets: RfqTargetDto[];
  createdAt: string;
}

export interface CreateRfqItemRequest {
  description: string;
  specifications?: string;
  quantity?: number;
  unitOfMeasure?: string;
  categoryUid?: string;
  sortOrder?: number;
}

export interface CreateRfqRequest {
  title: string;
  description?: string;
  visibility: "Public" | "Targeted";
  responseDeadline?: string;
  deliveryLocation?: string;
  deliveryTimeline?: string;
  attachments?: string[];
  items: CreateRfqItemRequest[];
  targetedSupplierUids?: string[];
}

export interface QuoteItemDto {
  id: number;
  rfqItemId: number | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  leadTimeDays: number | null;
  minOrderQuantity: number | null;
  incoterms: string | null;
  notes: string | null;
  sortOrder: number;
}

export interface QuoteDto {
  uid: string;
  rfqUid: string;
  supplierBusinessUid: string;
  supplierBusinessName: string;
  supplierVerified: boolean;
  supplierTrustScore: number;
  status: "Draft" | "Submitted" | "Revised" | "Accepted" | "Rejected" | "Withdrawn";
  totalAmount: number | null;
  currencyCode: string | null;
  validUntil: string | null;
  notes: string | null;
  attachments: string[];
  items: QuoteItemDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuoteItemRequest {
  rfqItemId?: number | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  leadTimeDays?: number;
  minOrderQuantity?: number;
  incoterms?: string;
  notes?: string;
  sortOrder?: number;
}

export interface CreateQuoteRequest {
  totalAmount?: number;
  currencyCode?: string;
  validUntil?: string;
  notes?: string;
  attachments?: string[];
  items: CreateQuoteItemRequest[];
}

export interface ComparisonCellDto {
  quoteUid: string;
  unitPrice: number | null;
  totalPrice: number | null;
  leadTimeDays: number | null;
}

export interface ComparisonRowDto {
  rfqItemId: number | null;
  description: string;
  cells: ComparisonCellDto[];
}

export interface ComparisonDto {
  rfqUid: string;
  rfqTitle: string;
  quotes: QuoteDto[];
  rows: ComparisonRowDto[];
}

export interface DealConfirmationDto {
  uid: string;
  rfqUid: string | null;
  rfqTitle: string | null;
  quoteUid: string | null;
  buyerBusinessUid: string;
  buyerBusinessName: string;
  supplierBusinessUid: string;
  supplierBusinessName: string;
  buyerConfirmed: boolean;
  buyerConfirmedAt: string | null;
  supplierConfirmed: boolean;
  supplierConfirmedAt: string | null;
  confirmedAt: string | null;
  dealValue: number | null;
  currencyCode: string | null;
  createdAt: string;
}

export interface CreateStandaloneDealRequest {
  counterpartyBusinessUid: string;
  currentTenantIsBuyer: boolean;
  dealValue?: number;
  currencyCode?: string;
}

// Messaging
export interface ConversationParticipantDto {
  businessUid: string;
  businessName: string;
  isVerified: boolean;
}

export interface MessageDto {
  id: number;
  conversationUid: string;
  senderUserId: number;
  senderBusinessUid: string;
  senderBusinessName: string;
  content: string;
  attachments: string[];
  readAt: string | null;
  createdAt: string;
}

export interface ConversationDto {
  uid: string;
  context: "General" | "Rfq";
  contextRefUid: string | null;
  contextRefTitle: string | null;
  participants: ConversationParticipantDto[];
  lastMessage: MessageDto | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FindOrCreateConversationRequest {
  counterpartyBusinessUid: string;
  context: "General" | "Rfq";
  contextRefUid?: string;
}

// Compliance
export interface ComplianceDocumentDto {
  uid: string;
  type: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileName: string;
  issuingBody: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  status: "Pending" | "Verified" | "Rejected" | "Expired";
  rejectionReason: string | null;
  verifiedAt: string | null;
  visibility: "Private" | "SharedOnRequest" | "Public";
  createdAt: string;
}

export interface CreateComplianceDocumentMetadata {
  type: string;
  title: string;
  description?: string;
  issuingBody?: string;
  issueDate?: string;
  expiryDate?: string;
  visibility: "Private" | "SharedOnRequest" | "Public";
}

// Reviews
export interface ReviewDto {
  uid: string;
  reviewerBusinessUid: string;
  reviewerBusinessName: string;
  reviewedBusinessUid: string;
  dealConfirmationUid: string;
  overallRating: number;
  qualityRating: number | null;
  communicationRating: number | null;
  deliveryRating: number | null;
  valueRating: number | null;
  comment: string | null;
  isVerifiedDeal: boolean;
  createdAt: string;
}

export interface CreateReviewRequest {
  dealConfirmationUid: string;
  overallRating: number;
  qualityRating?: number;
  communicationRating?: number;
  deliveryRating?: number;
  valueRating?: number;
  comment?: string;
}

// Trust score
export interface TrustScoreBreakdown {
  total: number;
  reviewScore: number;
  reviewCount: number;
  complianceScore: number;
  complianceVerifiedCount: number;
  complianceTotalCount: number;
  responseScore: number;
  rfqQuotedCount: number;
  rfqInvitedCount: number;
  recencyScore: number;
  lastActivityAt: string | null;
}
