import type {
  BusinessDto, BusinessDetailDto, CatalogItemDto, PagedResult,
} from "@/lib/types";

export const mockBusinesses: BusinessDto[] = [
  {
    uid: "biz-acme-metals",
    name: "Acme Metals Pvt. Ltd.",
    isVerified: true,
    trustScore: 4.9,
    logo: null,
    about: "Precision metal fabrication and CNC machining with ISO 9001 and AS9100 certification. Serving aerospace, automotive, and industrial OEMs since 2008.",
    city: "Mumbai",
    countryCode: "IN",
    industry: "Industrial Metals",
    capabilities: ["CNC Machining", "Sheet Metal", "Welding", "Laser Cutting", "Powder Coating"],
    createdAt: "2024-02-14T10:00:00Z",
  },
  {
    uid: "biz-fastpack",
    name: "FastPack Industries",
    isVerified: true,
    trustScore: 4.8,
    logo: null,
    about: "Food-grade and pharmaceutical packaging specialists. Flexible pouches, rigid containers, and sustainable alternatives.",
    city: "Delhi",
    countryCode: "IN",
    industry: "Packaging & Materials",
    capabilities: ["Flexible Packaging", "Food Grade", "Custom Print", "Biodegradable"],
    createdAt: "2024-03-22T10:00:00Z",
  },
  {
    uid: "biz-steelworks",
    name: "SteelWorks Global",
    isVerified: true,
    trustScore: 4.6,
    logo: null,
    about: "Structural steel fabrication for construction and infrastructure. Certified AWS welders, full erection services.",
    city: "Pune",
    countryCode: "IN",
    industry: "Construction Materials",
    capabilities: ["Structural Steel", "Fabrication", "Erection"],
    createdAt: "2023-11-08T10:00:00Z",
  },
  {
    uid: "biz-electrocore",
    name: "ElectroCore Components",
    isVerified: true,
    trustScore: 4.7,
    logo: null,
    about: "Electronic component distribution and contract assembly. Authorized distributor for 40+ semiconductor brands.",
    city: "Bengaluru",
    countryCode: "IN",
    industry: "Electronics",
    capabilities: ["PCB Assembly", "Component Sourcing", "SMT", "Through-Hole"],
    createdAt: "2024-01-05T10:00:00Z",
  },
  {
    uid: "biz-greenchem",
    name: "GreenChem Solutions",
    isVerified: false,
    trustScore: 4.2,
    logo: null,
    about: "Specialty chemicals and eco-friendly industrial cleaners. REACH compliant, GMP certified manufacturing.",
    city: "Ahmedabad",
    countryCode: "IN",
    industry: "Chemicals",
    capabilities: ["Industrial Cleaners", "Specialty Chemicals", "Private Label"],
    createdAt: "2024-05-17T10:00:00Z",
  },
  {
    uid: "biz-logistix",
    name: "LogistiX Freight",
    isVerified: true,
    trustScore: 4.5,
    logo: null,
    about: "End-to-end logistics — ocean, air, and road. 12 warehouses across South Asia, DG-certified handling.",
    city: "Chennai",
    countryCode: "IN",
    industry: "Logistics & Freight",
    capabilities: ["Ocean Freight", "Air Cargo", "Warehousing", "Customs Clearance"],
    createdAt: "2023-09-01T10:00:00Z",
  },
  {
    uid: "biz-textilehub",
    name: "TextileHub Exports",
    isVerified: true,
    trustScore: 4.4,
    logo: null,
    about: "Knitted and woven garments for global brands. GOTS-certified organic cotton, SA8000 social compliance.",
    city: "Tirupur",
    countryCode: "IN",
    industry: "Textiles & Apparel",
    capabilities: ["Knitting", "Woven", "Dyeing", "Organic Cotton"],
    createdAt: "2024-04-12T10:00:00Z",
  },
  {
    uid: "biz-robotica",
    name: "Robotica Automation",
    isVerified: true,
    trustScore: 4.9,
    logo: null,
    about: "Industrial automation integrators. PLC, SCADA, robotic cells, and turnkey assembly lines for Tier-1 manufacturers.",
    city: "Coimbatore",
    countryCode: "IN",
    industry: "Industrial Automation",
    capabilities: ["PLC Programming", "SCADA", "Robot Integration", "Vision Systems"],
    createdAt: "2023-12-19T10:00:00Z",
  },
  {
    uid: "biz-precisioncast",
    name: "PrecisionCast Foundry",
    isVerified: false,
    trustScore: 4.1,
    logo: null,
    about: "Investment casting and sand casting up to 500 kg. Steel, aluminum, brass, and specialty alloys.",
    city: "Rajkot",
    countryCode: "IN",
    industry: "Foundry & Casting",
    capabilities: ["Investment Casting", "Sand Casting", "Aluminum", "Heat Treatment"],
    createdAt: "2024-06-02T10:00:00Z",
  },
  {
    uid: "biz-cloudforge",
    name: "CloudForge Technologies",
    isVerified: true,
    trustScore: 4.8,
    logo: null,
    about: "Custom B2B software and cloud infrastructure. AWS Advanced Partner, SOC 2 Type II certified.",
    city: "Hyderabad",
    countryCode: "IN",
    industry: "Software & IT",
    capabilities: ["Cloud Migration", "DevOps", "SaaS Development", "Data Engineering"],
    createdAt: "2024-02-28T10:00:00Z",
  },
  {
    uid: "biz-solargrid",
    name: "SolarGrid Energy",
    isVerified: true,
    trustScore: 4.6,
    logo: null,
    about: "Commercial solar EPC and rooftop installations. 180+ MW deployed, O&M contracts across 5 states.",
    city: "Jaipur",
    countryCode: "IN",
    industry: "Renewable Energy",
    capabilities: ["Solar EPC", "Rooftop PV", "O&M", "Net Metering"],
    createdAt: "2023-10-30T10:00:00Z",
  },
  {
    uid: "biz-medequip",
    name: "MedEquip Systems",
    isVerified: true,
    trustScore: 4.7,
    logo: null,
    about: "ISO 13485 certified medical device manufacturing. OEM/ODM for diagnostic and surgical instruments.",
    city: "Vadodara",
    countryCode: "IN",
    industry: "Medical Devices",
    capabilities: ["ISO 13485", "Sterile Packaging", "OEM/ODM", "CE Marking"],
    createdAt: "2024-03-08T10:00:00Z",
  },
];

export const mockBusinessDetails: Record<string, BusinessDetailDto> = Object.fromEntries(
  mockBusinesses.map((b) => [
    b.uid,
    {
      uid: b.uid,
      name: b.name,
      isVerified: b.isVerified,
      trustScore: b.trustScore,
      verifiedAt: b.isVerified ? "2024-06-01T00:00:00Z" : null,
      createdAt: b.createdAt,
      profile: {
        logo: b.logo,
        bannerImage: null,
        about: b.about,
        website: `https://${b.uid.replace("biz-", "")}.example.com`,
        linkedInUrl: `https://linkedin.com/company/${b.uid}`,
        yearEstablished: 2005 + Math.floor(Math.random() * 18),
        companySize: ["Small (10-50)", "Medium (50-200)", "Large (200-1000)"][Math.floor(Math.random() * 3)],
        city: b.city,
        state: null,
        countryCode: b.countryCode,
        capabilities: b.capabilities,
        certifications: b.isVerified ? ["ISO 9001", "ISO 14001"] : [],
        deliveryRegions: ["India", "SE Asia", "Middle East"],
        responseRate: 85 + Math.floor(Math.random() * 15),
        avgResponseTimeHours: 2 + Math.floor(Math.random() * 10),
        industry: b.industry,
      },
    },
  ])
);

export const mockCatalogItems: CatalogItemDto[] = [
  {
    uid: "cat-1",
    type: "Product",
    title: "Precision CNC Machined Aluminum Bracket",
    description: "Custom CNC machined 6061-T6 aluminum brackets. Tolerances to ±0.02mm.",
    category: "Metal Parts",
    pricingType: "Range",
    priceMin: 12,
    priceMax: 28,
    currencyCode: "USD",
    minOrderQuantity: 100,
    leadTimeDays: 14,
    status: "Published",
    viewCount: 342,
    inquiryCount: 12,
    primaryImageUrl: null,
    createdAt: "2026-02-10T10:00:00Z",
  },
  {
    uid: "cat-2",
    type: "Service",
    title: "ISO 9001 Certified Contract Machining",
    description: "Small and medium batch production runs with full traceability and CoC.",
    category: "Manufacturing Services",
    pricingType: "ContactForQuote",
    priceMin: null,
    priceMax: null,
    currencyCode: null,
    minOrderQuantity: null,
    leadTimeDays: 21,
    status: "Published",
    viewCount: 218,
    inquiryCount: 8,
    primaryImageUrl: null,
    createdAt: "2026-01-28T10:00:00Z",
  },
  {
    uid: "cat-3",
    type: "Product",
    title: "Stainless Steel Sheet Metal Enclosure",
    description: "IP65-rated 316 stainless enclosures for industrial controls.",
    category: "Enclosures",
    pricingType: "Fixed",
    priceMin: 145,
    priceMax: null,
    currencyCode: "USD",
    minOrderQuantity: 25,
    leadTimeDays: 18,
    status: "Published",
    viewCount: 189,
    inquiryCount: 6,
    primaryImageUrl: null,
    createdAt: "2026-03-04T10:00:00Z",
  },
  {
    uid: "cat-4",
    type: "Product",
    title: "Laser-Cut Steel Gusset Plates",
    description: "Structural gussets in mild and high-tensile steel, to drawing.",
    category: "Metal Parts",
    pricingType: "Range",
    priceMin: 4,
    priceMax: 18,
    currencyCode: "USD",
    minOrderQuantity: 500,
    leadTimeDays: 10,
    status: "Published",
    viewCount: 267,
    inquiryCount: 9,
    primaryImageUrl: null,
    createdAt: "2026-03-15T10:00:00Z",
  },
  {
    uid: "cat-5",
    type: "Service",
    title: "Powder Coating & Industrial Finishing",
    description: "RAL-color matched powder coating with salt-spray testing.",
    category: "Surface Finishing",
    pricingType: "ContactForQuote",
    priceMin: null,
    priceMax: null,
    currencyCode: null,
    minOrderQuantity: null,
    leadTimeDays: 7,
    status: "Draft",
    viewCount: 0,
    inquiryCount: 0,
    primaryImageUrl: null,
    createdAt: "2026-04-01T10:00:00Z",
  },
  {
    uid: "cat-6",
    type: "Product",
    title: "Welded Steel Subassembly",
    description: "MIG/TIG welded subassemblies with CMM-inspection reports.",
    category: "Weldments",
    pricingType: "Range",
    priceMin: 85,
    priceMax: 320,
    currencyCode: "USD",
    minOrderQuantity: 20,
    leadTimeDays: 25,
    status: "Published",
    viewCount: 154,
    inquiryCount: 5,
    primaryImageUrl: null,
    createdAt: "2026-02-20T10:00:00Z",
  },
  {
    uid: "cat-7",
    type: "Product",
    title: "Custom Extruded Aluminum Profiles",
    description: "6000-series aluminum extrusions with anodized finish.",
    category: "Extrusions",
    pricingType: "Range",
    priceMin: 3,
    priceMax: 12,
    currencyCode: "USD",
    minOrderQuantity: 1000,
    leadTimeDays: 30,
    status: "Published",
    viewCount: 98,
    inquiryCount: 3,
    primaryImageUrl: null,
    createdAt: "2026-03-28T10:00:00Z",
  },
  {
    uid: "cat-8",
    type: "Service",
    title: "Reverse Engineering & 3D Scanning",
    description: "GOM and laser scanning services with CAD reconstruction.",
    category: "Engineering Services",
    pricingType: "ContactForQuote",
    priceMin: null,
    priceMax: null,
    currencyCode: null,
    minOrderQuantity: null,
    leadTimeDays: 5,
    status: "Draft",
    viewCount: 0,
    inquiryCount: 0,
    primaryImageUrl: null,
    createdAt: "2026-04-05T10:00:00Z",
  },
  {
    uid: "cat-9",
    type: "Product",
    title: "Legacy Cast Iron Flanges (Archived)",
    description: "Discontinued line, replaced by forged equivalent.",
    category: "Fittings",
    pricingType: "Fixed",
    priceMin: 22,
    priceMax: null,
    currencyCode: "USD",
    minOrderQuantity: 50,
    leadTimeDays: null,
    status: "Archived",
    viewCount: 42,
    inquiryCount: 0,
    primaryImageUrl: null,
    createdAt: "2025-11-10T10:00:00Z",
  },
];

export interface MockRfq {
  uid: string;
  title: string;
  description: string;
  status: "Draft" | "Open" | "Closed" | "Awarded" | "Cancelled";
  responseDeadline: string;
  itemCount: number;
  quoteCount: number;
  deliveryLocation: string;
  createdAt: string;
  visibility: "Public" | "Targeted";
  category: string;
}

export const mockRfqs: MockRfq[] = [
  {
    uid: "rfq-142",
    title: "500 units — Aluminum CNC brackets, annual contract",
    description: "Seeking a long-term supplier for precision-machined aluminum brackets. Annual volume 500 units, quarterly releases.",
    status: "Open",
    responseDeadline: "2026-04-25T17:00:00Z",
    itemCount: 3,
    quoteCount: 7,
    deliveryLocation: "Chennai, IN",
    createdAt: "2026-04-08T09:00:00Z",
    visibility: "Public",
    category: "Metal Parts",
  },
  {
    uid: "rfq-141",
    title: "Custom industrial enclosures — IP65 rated",
    description: "Stainless steel enclosures for outdoor control panels. 25 units with possible follow-on order.",
    status: "Open",
    responseDeadline: "2026-04-30T17:00:00Z",
    itemCount: 2,
    quoteCount: 4,
    deliveryLocation: "Mumbai, IN",
    createdAt: "2026-04-10T09:00:00Z",
    visibility: "Targeted",
    category: "Enclosures",
  },
  {
    uid: "rfq-140",
    title: "Logistics RFQ — Mumbai to Rotterdam",
    description: "Need ocean freight for 8 containers/month. Food-grade handling required.",
    status: "Open",
    responseDeadline: "2026-04-20T17:00:00Z",
    itemCount: 1,
    quoteCount: 3,
    deliveryLocation: "Mumbai → Rotterdam",
    createdAt: "2026-04-06T09:00:00Z",
    visibility: "Public",
    category: "Logistics",
  },
  {
    uid: "rfq-139",
    title: "Food-grade flexible packaging pouches",
    description: "Custom printed stand-up pouches with zipper. 100k units initial order.",
    status: "Awarded",
    responseDeadline: "2026-04-01T17:00:00Z",
    itemCount: 2,
    quoteCount: 6,
    deliveryLocation: "Delhi, IN",
    createdAt: "2026-03-15T09:00:00Z",
    visibility: "Public",
    category: "Packaging",
  },
  {
    uid: "rfq-138",
    title: "Solar panel supply for 2 MW rooftop",
    description: "Tier-1 monocrystalline panels, 540W+, with 25-year warranty. Installation quote optional.",
    status: "Closed",
    responseDeadline: "2026-03-25T17:00:00Z",
    itemCount: 1,
    quoteCount: 12,
    deliveryLocation: "Jaipur, IN",
    createdAt: "2026-03-05T09:00:00Z",
    visibility: "Public",
    category: "Renewable Energy",
  },
  {
    uid: "rfq-137",
    title: "PCB assembly — small batch prototypes",
    description: "SMT assembly for 50 boards, 4-layer, mixed 0402/0603 components.",
    status: "Awarded",
    responseDeadline: "2026-03-20T17:00:00Z",
    itemCount: 1,
    quoteCount: 5,
    deliveryLocation: "Bengaluru, IN",
    createdAt: "2026-03-01T09:00:00Z",
    visibility: "Targeted",
    category: "Electronics",
  },
  {
    uid: "rfq-136-draft",
    title: "Industrial cleaners — private label",
    description: "Seeking supplier for eco-friendly industrial cleaner, 200L drums, private label.",
    status: "Draft",
    responseDeadline: "2026-05-01T17:00:00Z",
    itemCount: 1,
    quoteCount: 0,
    deliveryLocation: "Multiple",
    createdAt: "2026-04-12T09:00:00Z",
    visibility: "Public",
    category: "Chemicals",
  },
  {
    uid: "rfq-135",
    title: "Investment cast stainless components",
    description: "Complex geometry investment castings in 316L stainless. Small batch, high mix.",
    status: "Cancelled",
    responseDeadline: "2026-03-10T17:00:00Z",
    itemCount: 4,
    quoteCount: 2,
    deliveryLocation: "Pune, IN",
    createdAt: "2026-02-25T09:00:00Z",
    visibility: "Public",
    category: "Foundry",
  },
];

export interface MockConnection {
  uid: string;
  businessUid: string;
  name: string;
  industry: string;
  city: string;
  isVerified: boolean;
  type: "Connection" | "Following" | "Follower" | "Request";
  isPreferred: boolean;
  connectedAt: string;
  mutualCount: number;
}

export const mockConnections: MockConnection[] = [
  { uid: "c1", businessUid: "biz-acme-metals", name: "Acme Metals Pvt. Ltd.", industry: "Industrial Metals", city: "Mumbai", isVerified: true, type: "Connection", isPreferred: true, connectedAt: "2026-02-14T10:00:00Z", mutualCount: 12 },
  { uid: "c2", businessUid: "biz-fastpack", name: "FastPack Industries", industry: "Packaging", city: "Delhi", isVerified: true, type: "Connection", isPreferred: false, connectedAt: "2026-03-01T10:00:00Z", mutualCount: 7 },
  { uid: "c3", businessUid: "biz-logistix", name: "LogistiX Freight", industry: "Logistics", city: "Chennai", isVerified: true, type: "Connection", isPreferred: true, connectedAt: "2026-01-20T10:00:00Z", mutualCount: 18 },
  { uid: "c4", businessUid: "biz-electrocore", name: "ElectroCore Components", industry: "Electronics", city: "Bengaluru", isVerified: true, type: "Connection", isPreferred: false, connectedAt: "2026-03-22T10:00:00Z", mutualCount: 4 },
  { uid: "c5", businessUid: "biz-robotica", name: "Robotica Automation", industry: "Industrial Automation", city: "Coimbatore", isVerified: true, type: "Following", isPreferred: false, connectedAt: "2026-02-28T10:00:00Z", mutualCount: 6 },
  { uid: "c6", businessUid: "biz-cloudforge", name: "CloudForge Technologies", industry: "Software & IT", city: "Hyderabad", isVerified: true, type: "Following", isPreferred: false, connectedAt: "2026-04-01T10:00:00Z", mutualCount: 2 },
  { uid: "c7", businessUid: "biz-greenchem", name: "GreenChem Solutions", industry: "Chemicals", city: "Ahmedabad", isVerified: false, type: "Follower", isPreferred: false, connectedAt: "2026-04-05T10:00:00Z", mutualCount: 1 },
  { uid: "c8", businessUid: "biz-solargrid", name: "SolarGrid Energy", industry: "Renewable Energy", city: "Jaipur", isVerified: true, type: "Follower", isPreferred: false, connectedAt: "2026-04-08T10:00:00Z", mutualCount: 3 },
  { uid: "c9", businessUid: "biz-medequip", name: "MedEquip Systems", industry: "Medical Devices", city: "Vadodara", isVerified: true, type: "Request", isPreferred: false, connectedAt: "2026-04-11T10:00:00Z", mutualCount: 2 },
  { uid: "c10", businessUid: "biz-textilehub", name: "TextileHub Exports", industry: "Textiles", city: "Tirupur", isVerified: true, type: "Request", isPreferred: false, connectedAt: "2026-04-12T10:00:00Z", mutualCount: 5 },
];

export interface MockMessage {
  uid: string;
  sender: "me" | "them";
  content: string;
  sentAt: string;
}

export interface MockConversation {
  uid: string;
  businessUid: string;
  businessName: string;
  context: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
  online: boolean;
  messages: MockMessage[];
}

export const mockConversations: MockConversation[] = [
  {
    uid: "conv-1",
    businessUid: "biz-acme-metals",
    businessName: "Acme Metals Pvt. Ltd.",
    context: "RFQ #142 — Aluminum brackets",
    lastMessage: "Sending revised quote shortly. Can do $11/unit at 1000+.",
    lastMessageAt: "2026-04-13T09:42:00Z",
    unread: 2,
    online: true,
    messages: [
      { uid: "m1", sender: "me", content: "Hi — interested in your CNC brackets for an annual contract. Can you confirm your tolerance spec?", sentAt: "2026-04-12T14:10:00Z" },
      { uid: "m2", sender: "them", content: "Hi! Yes, we hold ±0.02mm on critical dims. Drawings ready?", sentAt: "2026-04-12T14:25:00Z" },
      { uid: "m3", sender: "me", content: "Drawings attached. Looking at 500 units/quarter. What's your best landed price?", sentAt: "2026-04-12T14:30:00Z" },
      { uid: "m4", sender: "them", content: "For 500 units quarterly, we can do $12/unit FOB Mumbai. Lead time 14 days.", sentAt: "2026-04-12T15:50:00Z" },
      { uid: "m5", sender: "me", content: "Can you do $11 for 1000+ units annual commit?", sentAt: "2026-04-13T09:15:00Z" },
      { uid: "m6", sender: "them", content: "Sending revised quote shortly. Can do $11/unit at 1000+.", sentAt: "2026-04-13T09:42:00Z" },
    ],
  },
  {
    uid: "conv-2",
    businessUid: "biz-fastpack",
    businessName: "FastPack Industries",
    context: "General inquiry",
    lastMessage: "Samples will ship Monday via DTDC. Tracking to follow.",
    lastMessageAt: "2026-04-13T08:15:00Z",
    unread: 1,
    online: false,
    messages: [
      { uid: "m1", sender: "them", content: "Thanks for connecting! Saw your query on stand-up pouches.", sentAt: "2026-04-11T11:00:00Z" },
      { uid: "m2", sender: "me", content: "Yes — need 100k food-grade pouches with zipper. Custom print.", sentAt: "2026-04-11T11:20:00Z" },
      { uid: "m3", sender: "them", content: "Can do. We'll send samples of our standard film stock for review.", sentAt: "2026-04-12T09:30:00Z" },
      { uid: "m4", sender: "them", content: "Samples will ship Monday via DTDC. Tracking to follow.", sentAt: "2026-04-13T08:15:00Z" },
    ],
  },
  {
    uid: "conv-3",
    businessUid: "biz-logistix",
    businessName: "LogistiX Freight",
    context: "RFQ #140 — Ocean freight",
    lastMessage: "Confirmed booking for weekly sailing out of JNPT.",
    lastMessageAt: "2026-04-12T16:30:00Z",
    unread: 0,
    online: true,
    messages: [
      { uid: "m1", sender: "me", content: "Need a quote for Mumbai → Rotterdam, 8 x 40HC/month, food-grade.", sentAt: "2026-04-10T10:00:00Z" },
      { uid: "m2", sender: "them", content: "Acknowledged. Sending USD/EUR rates within 24h.", sentAt: "2026-04-10T10:45:00Z" },
      { uid: "m3", sender: "them", content: "Confirmed booking for weekly sailing out of JNPT.", sentAt: "2026-04-12T16:30:00Z" },
    ],
  },
  {
    uid: "conv-4",
    businessUid: "biz-robotica",
    businessName: "Robotica Automation",
    context: "Profile inquiry",
    lastMessage: "Happy to share reference installations — which sectors?",
    lastMessageAt: "2026-04-11T14:00:00Z",
    unread: 0,
    online: false,
    messages: [
      { uid: "m1", sender: "me", content: "Looking at your robotic cell integration service. Need reference customers in food & beverage.", sentAt: "2026-04-11T13:30:00Z" },
      { uid: "m2", sender: "them", content: "Happy to share reference installations — which sectors?", sentAt: "2026-04-11T14:00:00Z" },
    ],
  },
  {
    uid: "conv-5",
    businessUid: "biz-electrocore",
    businessName: "ElectroCore Components",
    context: "RFQ #137 — PCB assembly",
    lastMessage: "Boards are in conformal coating stage. Ship Thursday.",
    lastMessageAt: "2026-04-09T17:20:00Z",
    unread: 0,
    online: false,
    messages: [
      { uid: "m1", sender: "me", content: "Hi — any update on the 50-unit prototype run?", sentAt: "2026-04-09T12:00:00Z" },
      { uid: "m2", sender: "them", content: "Boards are in conformal coating stage. Ship Thursday.", sentAt: "2026-04-09T17:20:00Z" },
    ],
  },
];

export interface MockActivity {
  uid: string;
  type: "view" | "quote" | "follow" | "cert" | "message";
  text: string;
  subject?: string;
  at: string;
}

export const mockActivities: MockActivity[] = [
  { uid: "a1", type: "view", text: "viewed your profile", subject: "Acme Metals Pvt. Ltd.", at: "2026-04-13T09:45:00Z" },
  { uid: "a2", type: "quote", text: "New quote received on", subject: "RFQ #142", at: "2026-04-13T08:20:00Z" },
  { uid: "a3", type: "follow", text: "started following you", subject: "TechParts Inc", at: "2026-04-13T07:10:00Z" },
  { uid: "a4", type: "message", text: "sent a message about", subject: "RFQ #140", at: "2026-04-12T16:30:00Z" },
  { uid: "a5", type: "cert", text: "Your ISO 9001 cert expires in 14 days", at: "2026-04-12T09:00:00Z" },
  { uid: "a6", type: "view", text: "viewed your catalog", subject: "FastPack Industries", at: "2026-04-12T08:55:00Z" },
  { uid: "a7", type: "quote", text: "Quote accepted on", subject: "RFQ #139", at: "2026-04-11T14:22:00Z" },
];

export const mockStats = {
  profileViews: { value: 142, change: 12 },
  catalogViews: { value: 384, change: 5 },
  openRfqs: { value: 3, change: 0 },
  quotesReceived: { value: 7, change: 40 },
};

export function mockPaged<T>(items: T[], page = 1, pageSize = 20): PagedResult<T> {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    totalCount: items.length,
    page,
    pageSize,
    totalPages: Math.ceil(items.length / pageSize),
    hasNext: start + pageSize < items.length,
    hasPrevious: page > 1,
  };
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}
