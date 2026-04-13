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
      industry: b.industry,
      companySize: ["Small (10-50)", "Medium (50-200)", "Large (200-1000)"][Math.floor(Math.random() * 3)],
      yearEstablished: 2005 + Math.floor(Math.random() * 18),
      website: `https://${b.uid.replace("biz-", "")}.example.com`,
      linkedInUrl: `https://linkedin.com/company/${b.uid}`,
      profileSource: "SelfRegistered",
      profile: {
        logo: b.logo,
        bannerImage: null,
        about: b.about,
        city: b.city,
        state: null,
        countryCode: b.countryCode,
        capabilities: b.capabilities,
        certifications: b.isVerified ? ["ISO 9001", "ISO 14001"] : [],
        deliveryRegions: ["India", "SE Asia", "Middle East"],
        additionalLocations: [],
        socialLinks: {},
        responseRate: 85 + Math.floor(Math.random() * 15),
        avgResponseTimeHours: 2 + Math.floor(Math.random() * 10),
        profileCompleteness: 75,
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

// ─── Catalog metadata (seller, specs, tags, images) ───────────────────────────

export interface MockCatalogMeta {
  sellerUid: string;
  specifications: Record<string, string>;
  tags: string[];
  colorGradient: [string, string];
  rating: number;
  reviewCount: number;
}

export const mockCatalogMeta: Record<string, MockCatalogMeta> = {
  "cat-1": { sellerUid: "biz-acme-metals", specifications: { Material: "6061-T6 Aluminum", Finish: "Anodized", Tolerance: "±0.02mm", "Max dim": "300×200×80mm" }, tags: ["Aerospace", "Automotive", "ISO 9001", "Small batch"], colorGradient: ["#6366f1", "#8b5cf6"], rating: 4.9, reviewCount: 42 },
  "cat-2": { sellerUid: "biz-acme-metals", specifications: { Certifications: "ISO 9001, AS9100D", "Batch size": "50–5000", Traceability: "Full CoC", Industries: "Aerospace, Medical" }, tags: ["ISO 9001", "AS9100D", "Full traceability"], colorGradient: ["#10b981", "#3b82f6"], rating: 4.8, reviewCount: 28 },
  "cat-3": { sellerUid: "biz-acme-metals", specifications: { Material: "316 Stainless Steel", IP: "IP65", "Wall thickness": "1.6mm", "Door type": "Hinged / bolted" }, tags: ["IP65", "Outdoor", "Stainless", "316L"], colorGradient: ["#0ea5e9", "#6366f1"], rating: 4.7, reviewCount: 18 },
  "cat-4": { sellerUid: "biz-steelworks", specifications: { Material: "Mild / HT steel", Thickness: "6–25mm", Process: "CNC laser cut", Tolerance: "±0.1mm" }, tags: ["Structural", "Laser cut", "High volume"], colorGradient: ["#f59e0b", "#ef4444"], rating: 4.5, reviewCount: 35 },
  "cat-5": { sellerUid: "biz-acme-metals", specifications: { "Color system": "RAL", Process: "Electrostatic spray", Testing: "Salt-spray 500h", "Max part": "3m × 1.2m" }, tags: ["RAL", "Salt-spray", "Industrial"], colorGradient: ["#ec4899", "#f59e0b"], rating: 4.6, reviewCount: 14 },
  "cat-6": { sellerUid: "biz-steelworks", specifications: { Process: "MIG/TIG", Material: "MS, SS, Aluminum", Inspection: "CMM + FPI", "Max size": "2.4 × 1.8m" }, tags: ["MIG/TIG", "CMM inspected", "Welded"], colorGradient: ["#8b5cf6", "#0ea5e9"], rating: 4.7, reviewCount: 22 },
  "cat-7": { sellerUid: "biz-acme-metals", specifications: { Alloy: "6063-T5", "Profile types": "Rectangular / T / U / I", Finish: "Anodized / mill", "Max length": "6m" }, tags: ["Extrusion", "Anodized", "Custom profile"], colorGradient: ["#14b8a6", "#3b82f6"], rating: 4.4, reviewCount: 9 },
  "cat-8": { sellerUid: "biz-robotica", specifications: { Equipment: "GOM ATOS, Laser", Accuracy: "±0.03mm", "CAD output": "STEP, IGES, SLDPRT", Turnaround: "5–10 days" }, tags: ["GOM", "Reverse engineering", "CAD"], colorGradient: ["#f43f5e", "#8b5cf6"], rating: 4.9, reviewCount: 16 },
  "cat-9": { sellerUid: "biz-acme-metals", specifications: { Material: "Cast iron", Size: "DN50–DN300", Standard: "ANSI / DIN" }, tags: ["Legacy", "Replaced"], colorGradient: ["#6b7280", "#9ca3af"], rating: 4.0, reviewCount: 3 },
  // New items across other sellers
  "cat-10": { sellerUid: "biz-fastpack", specifications: { Type: "Stand-up pouch with zipper", Film: "PET/PE/EVOH", MOQ: "10,000 pcs", Print: "Up to 8 colors", "Food-grade": "Yes" }, tags: ["Food grade", "Zipper", "Printed", "Biodegradable"], colorGradient: ["#22c55e", "#14b8a6"], rating: 4.8, reviewCount: 31 },
  "cat-11": { sellerUid: "biz-fastpack", specifications: { Material: "HDPE / PP", Capacity: "250ml – 5L", "Neck finish": "28mm / 38mm", "Pharma grade": "Optional" }, tags: ["Rigid", "Pharma", "Food-grade"], colorGradient: ["#0891b2", "#3b82f6"], rating: 4.6, reviewCount: 18 },
  "cat-12": { sellerUid: "biz-electrocore", specifications: { Service: "SMT + through-hole", "Board layers": "1–12", "BGA/QFN": "Yes", "Min lot": "10 boards", "IPC class": "Class 3" }, tags: ["SMT", "IPC Class 3", "Prototype to production"], colorGradient: ["#3b82f6", "#8b5cf6"], rating: 4.9, reviewCount: 47 },
  "cat-13": { sellerUid: "biz-electrocore", specifications: { Type: "Authorized distribution", Brands: "TI, ST, NXP, Infineon, Microchip", Leadtime: "1–6 weeks", Packaging: "T&R, Tube, Tray" }, tags: ["Authorized", "Semiconductors", "In-stock"], colorGradient: ["#ec4899", "#6366f1"], rating: 4.7, reviewCount: 62 },
  "cat-14": { sellerUid: "biz-logistix", specifications: { Route: "Asia ↔ Europe / Americas", "Container types": "20GP, 40GP, 40HC, 40RF", Incoterms: "FOB / CIF / DDP", "Dangerous goods": "Certified" }, tags: ["Ocean freight", "DG certified", "Door-to-door"], colorGradient: ["#0ea5e9", "#06b6d4"], rating: 4.6, reviewCount: 55 },
  "cat-15": { sellerUid: "biz-logistix", specifications: { "Warehouse locations": "12 across South Asia", "Total area": "540,000 sqft", "Temperature controlled": "Available", WMS: "SAP EWM" }, tags: ["3PL", "WMS", "SA coverage"], colorGradient: ["#f59e0b", "#ef4444"], rating: 4.5, reviewCount: 29 },
  "cat-16": { sellerUid: "biz-solargrid", specifications: { "Panel type": "Monocrystalline", "Power range": "540W – 600W", "Warranty product": "12 years", "Warranty output": "25 years", "Tier-1": "Yes" }, tags: ["Tier-1", "Monocrystalline", "25-yr warranty"], colorGradient: ["#f59e0b", "#eab308"], rating: 4.7, reviewCount: 24 },
  "cat-17": { sellerUid: "biz-solargrid", specifications: { Service: "Turnkey EPC", "Capacity range": "100kW – 5MW", Warranty: "5 years O&M", Coverage: "Pan-India" }, tags: ["EPC", "Turnkey", "O&M included"], colorGradient: ["#f97316", "#f59e0b"], rating: 4.6, reviewCount: 19 },
  "cat-18": { sellerUid: "biz-textilehub", specifications: { Fabric: "100% GOTS Organic Cotton", GSM: "140–260", Certifications: "GOTS, SA8000, Fair Trade", MOQ: "500 pcs/color" }, tags: ["GOTS", "SA8000", "Organic", "Knitted"], colorGradient: ["#84cc16", "#22c55e"], rating: 4.8, reviewCount: 38 },
  "cat-19": { sellerUid: "biz-robotica", specifications: { "Cell type": "Robotic assembly / palletizing", Controllers: "Siemens / Rockwell / Mitsubishi", Integration: "Turnkey", Commissioning: "Included" }, tags: ["Turnkey", "Robot cells", "PLC + Vision"], colorGradient: ["#6366f1", "#a855f7"], rating: 4.9, reviewCount: 17 },
  "cat-20": { sellerUid: "biz-cloudforge", specifications: { Service: "Cloud migration", Partner: "AWS Advanced", "SOC 2": "Type II", Methodology: "6R framework" }, tags: ["AWS", "SOC 2", "DevOps"], colorGradient: ["#2563eb", "#06b6d4"], rating: 4.8, reviewCount: 26 },
  "cat-21": { sellerUid: "biz-medequip", specifications: { Standard: "ISO 13485", "Class": "IIa / IIb", "CE Marking": "Available", "Sterile packaging": "Yes" }, tags: ["ISO 13485", "CE", "OEM/ODM"], colorGradient: ["#14b8a6", "#0ea5e9"], rating: 4.8, reviewCount: 21 },
  "cat-22": { sellerUid: "biz-greenchem", specifications: { Form: "Liquid concentrate", Packaging: "5L / 20L / 200L drum", Certifications: "REACH, GMP", "Private label": "Yes" }, tags: ["Eco-friendly", "REACH", "Private label"], colorGradient: ["#10b981", "#84cc16"], rating: 4.3, reviewCount: 12 },
};

const additionalCatalogItems: CatalogItemDto[] = [
  { uid: "cat-10", type: "Product", title: "Food-Grade Stand-Up Pouch with Zipper", description: "Custom-printed multi-layer pouches for snacks, pet food, and dry goods. Barrier films available.", category: "Flexible Packaging", pricingType: "Range", priceMin: 0.08, priceMax: 0.22, currencyCode: "USD", minOrderQuantity: 10000, leadTimeDays: 21, status: "Published", viewCount: 512, inquiryCount: 24, primaryImageUrl: null, createdAt: "2026-02-14T10:00:00Z" },
  { uid: "cat-11", type: "Product", title: "Rigid HDPE Containers — Pharma Grade", description: "ISO 15378 compliant HDPE bottles for nutraceutical and pharma applications.", category: "Rigid Packaging", pricingType: "Range", priceMin: 0.35, priceMax: 1.20, currencyCode: "USD", minOrderQuantity: 5000, leadTimeDays: 28, status: "Published", viewCount: 284, inquiryCount: 11, primaryImageUrl: null, createdAt: "2026-02-20T10:00:00Z" },
  { uid: "cat-12", type: "Service", title: "PCB Assembly — SMT & Through-Hole", description: "Contract PCB assembly from prototype to production. IPC Class 2/3.", category: "Electronics Manufacturing", pricingType: "ContactForQuote", priceMin: null, priceMax: null, currencyCode: null, minOrderQuantity: 10, leadTimeDays: 10, status: "Published", viewCount: 687, inquiryCount: 32, primaryImageUrl: null, createdAt: "2026-01-30T10:00:00Z" },
  { uid: "cat-13", type: "Product", title: "Semiconductor Component Sourcing", description: "Authorized distribution for TI, ST, NXP, Infineon and 40+ brands. Franchise stock.", category: "Electronic Components", pricingType: "ContactForQuote", priceMin: null, priceMax: null, currencyCode: null, minOrderQuantity: null, leadTimeDays: 7, status: "Published", viewCount: 823, inquiryCount: 41, primaryImageUrl: null, createdAt: "2026-01-12T10:00:00Z" },
  { uid: "cat-14", type: "Service", title: "Ocean Freight — Asia to Europe & Americas", description: "Weekly sailings from JNPT, Chennai, and Mundra. Full container and LCL.", category: "Freight Forwarding", pricingType: "ContactForQuote", priceMin: null, priceMax: null, currencyCode: null, minOrderQuantity: null, leadTimeDays: 28, status: "Published", viewCount: 445, inquiryCount: 19, primaryImageUrl: null, createdAt: "2026-02-01T10:00:00Z" },
  { uid: "cat-15", type: "Service", title: "3PL Warehousing & Fulfillment", description: "12 warehouses across South Asia with WMS integration. Temperature controlled zones available.", category: "Warehousing", pricingType: "ContactForQuote", priceMin: null, priceMax: null, currencyCode: null, minOrderQuantity: null, leadTimeDays: 5, status: "Published", viewCount: 298, inquiryCount: 13, primaryImageUrl: null, createdAt: "2026-02-18T10:00:00Z" },
  { uid: "cat-16", type: "Product", title: "Tier-1 Monocrystalline Solar Panels (540W+)", description: "Bifacial monocrystalline panels with 25-year warranty. Tier-1 BloombergNEF listed.", category: "Solar Equipment", pricingType: "Range", priceMin: 0.21, priceMax: 0.28, currencyCode: "USD", minOrderQuantity: 500, leadTimeDays: 45, status: "Published", viewCount: 612, inquiryCount: 27, primaryImageUrl: null, createdAt: "2026-03-02T10:00:00Z" },
  { uid: "cat-17", type: "Service", title: "Commercial Solar EPC — Rooftop & Ground Mount", description: "Turnkey EPC from site survey to grid connection. 100kW to 5MW projects.", category: "Renewable Energy Services", pricingType: "ContactForQuote", priceMin: null, priceMax: null, currencyCode: null, minOrderQuantity: null, leadTimeDays: 90, status: "Published", viewCount: 367, inquiryCount: 21, primaryImageUrl: null, createdAt: "2026-03-10T10:00:00Z" },
  { uid: "cat-18", type: "Product", title: "GOTS-Certified Organic Cotton Knitwear", description: "Private-label knitted garments from GOTS-certified organic cotton. SA8000 compliant facility.", category: "Apparel", pricingType: "Range", priceMin: 3.40, priceMax: 12.80, currencyCode: "USD", minOrderQuantity: 500, leadTimeDays: 60, status: "Published", viewCount: 394, inquiryCount: 17, primaryImageUrl: null, createdAt: "2026-03-05T10:00:00Z" },
  { uid: "cat-19", type: "Service", title: "Robotic Assembly Cell Integration", description: "Turnkey robotic assembly cells and palletizing systems. PLC + vision integrated.", category: "Industrial Automation", pricingType: "ContactForQuote", priceMin: null, priceMax: null, currencyCode: null, minOrderQuantity: null, leadTimeDays: 120, status: "Published", viewCount: 254, inquiryCount: 14, primaryImageUrl: null, createdAt: "2026-02-26T10:00:00Z" },
  { uid: "cat-20", type: "Service", title: "AWS Cloud Migration — Enterprise 6R", description: "End-to-end AWS migration services using the 6R framework. SOC 2 Type II.", category: "Cloud Services", pricingType: "ContactForQuote", priceMin: null, priceMax: null, currencyCode: null, minOrderQuantity: null, leadTimeDays: 60, status: "Published", viewCount: 412, inquiryCount: 22, primaryImageUrl: null, createdAt: "2026-03-15T10:00:00Z" },
  { uid: "cat-21", type: "Product", title: "ISO 13485 Diagnostic Instrument (OEM/ODM)", description: "CE-marked diagnostic instruments for OEM/ODM. Class IIa medical device.", category: "Medical Devices", pricingType: "ContactForQuote", priceMin: null, priceMax: null, currencyCode: null, minOrderQuantity: 100, leadTimeDays: 75, status: "Published", viewCount: 189, inquiryCount: 9, primaryImageUrl: null, createdAt: "2026-03-20T10:00:00Z" },
  { uid: "cat-22", type: "Product", title: "Eco-Friendly Industrial Cleaner Concentrate", description: "REACH-compliant eco-friendly cleaner concentrate. Private labeling available.", category: "Specialty Chemicals", pricingType: "Range", priceMin: 3.20, priceMax: 4.80, currencyCode: "USD", minOrderQuantity: 500, leadTimeDays: 14, status: "Published", viewCount: 167, inquiryCount: 8, primaryImageUrl: null, createdAt: "2026-03-25T10:00:00Z" },
];

mockCatalogItems.push(...additionalCatalogItems);

export function getCatalogSeller(itemUid: string): BusinessDto | undefined {
  const meta = mockCatalogMeta[itemUid];
  if (!meta) return undefined;
  return mockBusinesses.find((b) => b.uid === meta.sellerUid);
}

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

// ─── Saved suppliers ───────────────────────────────────────────────────────────

export interface MockSupplierList {
  uid: string;
  name: string;
  description: string;
  supplierCount: number;
  color: string;
  createdAt: string;
  supplierUids: string[];
}

export const mockSupplierLists: MockSupplierList[] = [
  {
    uid: "list-1",
    name: "CNC vendors — shortlisted",
    description: "Pre-vetted CNC machining suppliers for annual contract renewal",
    supplierCount: 4,
    color: "#6366f1",
    createdAt: "2026-02-10T10:00:00Z",
    supplierUids: ["biz-acme-metals", "biz-steelworks", "biz-precisioncast", "biz-robotica"],
  },
  {
    uid: "list-2",
    name: "Backup packaging suppliers",
    description: "Secondary options for packaging continuity planning",
    supplierCount: 2,
    color: "#10b981",
    createdAt: "2026-02-22T10:00:00Z",
    supplierUids: ["biz-fastpack", "biz-greenchem"],
  },
  {
    uid: "list-3",
    name: "Electronics & PCB",
    description: "All PCB assembly and component sourcing partners",
    supplierCount: 3,
    color: "#f59e0b",
    createdAt: "2026-03-05T10:00:00Z",
    supplierUids: ["biz-electrocore", "biz-robotica", "biz-cloudforge"],
  },
  {
    uid: "list-4",
    name: "Logistics partners",
    description: "Freight and warehousing vendors",
    supplierCount: 1,
    color: "#ec4899",
    createdAt: "2026-01-18T10:00:00Z",
    supplierUids: ["biz-logistix"],
  },
];

export interface MockSavedSupplier {
  uid: string;
  businessUid: string;
  savedAt: string;
  listUids: string[];
  note: string | null;
  lastActivity: string;
}

export const mockSavedSuppliers: MockSavedSupplier[] = [
  { uid: "s1", businessUid: "biz-acme-metals", savedAt: "2026-02-14T10:00:00Z", listUids: ["list-1"], note: "Primary CNC vendor. Annual review in Q3.", lastActivity: "2026-04-13T09:42:00Z" },
  { uid: "s2", businessUid: "biz-fastpack", savedAt: "2026-03-01T10:00:00Z", listUids: ["list-2"], note: "Good for small runs, slower on large orders.", lastActivity: "2026-04-13T08:15:00Z" },
  { uid: "s3", businessUid: "biz-steelworks", savedAt: "2026-02-18T10:00:00Z", listUids: ["list-1"], note: null, lastActivity: "2026-04-10T14:20:00Z" },
  { uid: "s4", businessUid: "biz-electrocore", savedAt: "2026-03-22T10:00:00Z", listUids: ["list-3"], note: "Authorized distributor — lead times reliable.", lastActivity: "2026-04-09T17:20:00Z" },
  { uid: "s5", businessUid: "biz-robotica", savedAt: "2026-02-28T10:00:00Z", listUids: ["list-1", "list-3"], note: "Premium pricing but excellent quality.", lastActivity: "2026-04-11T14:00:00Z" },
  { uid: "s6", businessUid: "biz-logistix", savedAt: "2026-01-20T10:00:00Z", listUids: ["list-4"], note: null, lastActivity: "2026-04-12T16:30:00Z" },
  { uid: "s7", businessUid: "biz-precisioncast", savedAt: "2026-03-15T10:00:00Z", listUids: ["list-1"], note: "Foundry backup for complex geometries.", lastActivity: "2026-04-05T10:00:00Z" },
  { uid: "s8", businessUid: "biz-cloudforge", savedAt: "2026-04-01T10:00:00Z", listUids: ["list-3"], note: null, lastActivity: "2026-04-08T11:30:00Z" },
  { uid: "s9", businessUid: "biz-greenchem", savedAt: "2026-03-28T10:00:00Z", listUids: ["list-2"], note: "Waiting on verification docs.", lastActivity: "2026-04-03T09:00:00Z" },
];

// ─── Compliance vault ──────────────────────────────────────────────────────────

export interface MockComplianceDoc {
  uid: string;
  name: string;
  type: "ISO Cert" | "License" | "Insurance" | "Audit Report" | "Tax Registration";
  issuingBody: string;
  issuedAt: string;
  expiresAt: string | null;
  status: "Active" | "Expiring Soon" | "Expired" | "Pending Review";
  fileName: string;
  fileSize: string;
  sharedWith: string[];
  uploadedAt: string;
  parsedByAi: boolean;
}

export const mockComplianceDocs: MockComplianceDoc[] = [
  {
    uid: "doc-1",
    name: "ISO 9001:2015 Quality Management",
    type: "ISO Cert",
    issuingBody: "TÜV SÜD",
    issuedAt: "2023-05-10T00:00:00Z",
    expiresAt: "2026-05-10T00:00:00Z",
    status: "Expiring Soon",
    fileName: "iso9001-2023.pdf",
    fileSize: "2.4 MB",
    sharedWith: ["biz-fastpack", "biz-logistix"],
    uploadedAt: "2023-05-15T10:00:00Z",
    parsedByAi: true,
  },
  {
    uid: "doc-2",
    name: "ISO 14001 Environmental Management",
    type: "ISO Cert",
    issuingBody: "Bureau Veritas",
    issuedAt: "2024-03-20T00:00:00Z",
    expiresAt: "2027-03-20T00:00:00Z",
    status: "Active",
    fileName: "iso14001-2024.pdf",
    fileSize: "1.8 MB",
    sharedWith: [],
    uploadedAt: "2024-03-25T10:00:00Z",
    parsedByAi: true,
  },
  {
    uid: "doc-3",
    name: "General Liability Insurance",
    type: "Insurance",
    issuingBody: "ICICI Lombard",
    issuedAt: "2025-11-01T00:00:00Z",
    expiresAt: "2026-11-01T00:00:00Z",
    status: "Active",
    fileName: "gl-insurance-2025.pdf",
    fileSize: "512 KB",
    sharedWith: ["biz-acme-metals"],
    uploadedAt: "2025-11-05T10:00:00Z",
    parsedByAi: true,
  },
  {
    uid: "doc-4",
    name: "GST Registration Certificate",
    type: "Tax Registration",
    issuingBody: "GSTN",
    issuedAt: "2018-07-01T00:00:00Z",
    expiresAt: null,
    status: "Active",
    fileName: "gst-cert.pdf",
    fileSize: "180 KB",
    sharedWith: [],
    uploadedAt: "2023-01-10T10:00:00Z",
    parsedByAi: false,
  },
  {
    uid: "doc-5",
    name: "AS9100 Aerospace Quality",
    type: "ISO Cert",
    issuingBody: "DNV",
    issuedAt: "2024-08-12T00:00:00Z",
    expiresAt: "2027-08-12T00:00:00Z",
    status: "Active",
    fileName: "as9100-2024.pdf",
    fileSize: "3.1 MB",
    sharedWith: ["biz-robotica"],
    uploadedAt: "2024-08-20T10:00:00Z",
    parsedByAi: true,
  },
  {
    uid: "doc-6",
    name: "Factory License (Maharashtra)",
    type: "License",
    issuingBody: "Govt of Maharashtra",
    issuedAt: "2022-04-15T00:00:00Z",
    expiresAt: "2026-04-28T00:00:00Z",
    status: "Expiring Soon",
    fileName: "factory-license.pdf",
    fileSize: "420 KB",
    sharedWith: [],
    uploadedAt: "2022-04-20T10:00:00Z",
    parsedByAi: true,
  },
  {
    uid: "doc-7",
    name: "2025 Third-Party Quality Audit",
    type: "Audit Report",
    issuingBody: "SGS India",
    issuedAt: "2025-10-05T00:00:00Z",
    expiresAt: null,
    status: "Pending Review",
    fileName: "audit-sgs-2025.pdf",
    fileSize: "5.7 MB",
    sharedWith: [],
    uploadedAt: "2025-10-12T10:00:00Z",
    parsedByAi: false,
  },
];

// ─── Quotes (for RFQ detail / compare) ─────────────────────────────────────────

export interface MockQuote {
  uid: string;
  rfqUid: string;
  businessUid: string;
  businessName: string;
  isVerified: boolean;
  trustScore: number;
  unitPrice: number;
  currencyCode: string;
  totalPrice: number;
  leadTimeDays: number;
  paymentTerms: string;
  incoterms: string;
  validUntil: string;
  submittedAt: string;
  status: "Pending" | "Under Review" | "Shortlisted" | "Awarded" | "Rejected";
  notes: string;
  attachmentCount: number;
}

export const mockQuotes: MockQuote[] = [
  { uid: "q1", rfqUid: "rfq-142", businessUid: "biz-acme-metals", businessName: "Acme Metals Pvt. Ltd.", isVerified: true, trustScore: 4.9, unitPrice: 11, currencyCode: "USD", totalPrice: 5500, leadTimeDays: 14, paymentTerms: "Net 30", incoterms: "FOB Mumbai", validUntil: "2026-05-15T00:00:00Z", submittedAt: "2026-04-12T10:00:00Z", status: "Shortlisted", notes: "Annual commit pricing. Tolerances ±0.02mm guaranteed. CoC included.", attachmentCount: 3 },
  { uid: "q2", rfqUid: "rfq-142", businessUid: "biz-steelworks", businessName: "SteelWorks Global", isVerified: true, trustScore: 4.6, unitPrice: 13.5, currencyCode: "USD", totalPrice: 6750, leadTimeDays: 10, paymentTerms: "50% advance", incoterms: "EXW Pune", validUntil: "2026-05-10T00:00:00Z", submittedAt: "2026-04-11T14:00:00Z", status: "Under Review", notes: "Faster lead time but higher unit cost. Can scale to 2000 units.", attachmentCount: 2 },
  { uid: "q3", rfqUid: "rfq-142", businessUid: "biz-precisioncast", businessName: "PrecisionCast Foundry", isVerified: false, trustScore: 4.1, unitPrice: 9.5, currencyCode: "USD", totalPrice: 4750, leadTimeDays: 21, paymentTerms: "Net 45", incoterms: "FOB Rajkot", validUntil: "2026-05-01T00:00:00Z", submittedAt: "2026-04-10T09:30:00Z", status: "Pending", notes: "Best price but longer lead time. Not yet verified on platform.", attachmentCount: 1 },
  { uid: "q4", rfqUid: "rfq-142", businessUid: "biz-robotica", businessName: "Robotica Automation", isVerified: true, trustScore: 4.9, unitPrice: 14, currencyCode: "USD", totalPrice: 7000, leadTimeDays: 12, paymentTerms: "Net 30", incoterms: "FOB Coimbatore", validUntil: "2026-05-20T00:00:00Z", submittedAt: "2026-04-12T16:00:00Z", status: "Pending", notes: "Premium pricing. Full automation and inspection report included.", attachmentCount: 4 },
];

// ─── Analytics / intelligence ──────────────────────────────────────────────────

export const mockAnalytics = {
  profileViewsByWeek: [
    { week: "W10", views: 82 },
    { week: "W11", views: 96 },
    { week: "W12", views: 124 },
    { week: "W13", views: 112 },
    { week: "W14", views: 138 },
    { week: "W15", views: 142 },
  ],
  viewerBreakdown: [
    { industry: "Automotive", percent: 32 },
    { industry: "Aerospace", percent: 24 },
    { industry: "Industrial", percent: 18 },
    { industry: "Construction", percent: 14 },
    { industry: "Electronics", percent: 12 },
  ],
  topProducts: [
    { title: "Precision CNC Machined Aluminum Bracket", views: 342, inquiries: 12 },
    { title: "Laser-Cut Steel Gusset Plates", views: 267, inquiries: 9 },
    { title: "ISO 9001 Certified Contract Machining", views: 218, inquiries: 8 },
    { title: "Stainless Steel Sheet Metal Enclosure", views: 189, inquiries: 6 },
    { title: "Welded Steel Subassembly", views: 154, inquiries: 5 },
  ],
  rfqPerformance: {
    winRate: 34,
    avgResponseTimeHours: 3.2,
    networkAvgHours: 5.8,
    responded: 18,
    total: 26,
  },
  benchmarks: [
    { label: "Profile completeness", you: 85, network: 62 },
    { label: "Response rate", you: 92, network: 74 },
    { label: "Verified docs", you: 6, network: 3 },
    { label: "Catalog items", you: 9, network: 12 },
  ],
  suggestions: [
    { title: "Add ISO 14001 certification", impact: "+18% visibility", body: "7 of 10 top competitors in your category are ISO 14001 certified." },
    { title: "Expand to Southeast Asia delivery regions", impact: "+24% reach", body: "Network RFQ volume for SE Asia delivery is up 40% this quarter." },
    { title: "Add 3 more catalog items", impact: "+12% profile views", body: "Businesses with 12+ items get 35% more inquiries on average." },
  ],
  risks: [
    { supplier: "Acme Metals Pvt. Ltd.", issue: "ISO 9001 cert expires in 14 days", severity: "high" as const },
    { supplier: "GreenChem Solutions", issue: "Review score declined from 4.5 to 4.2", severity: "medium" as const },
    { supplier: "PrecisionCast Foundry", issue: "No activity on profile for 42 days", severity: "low" as const },
  ],
  demandSignals: [
    { category: "EV battery components", change: "+212%", region: "India" },
    { category: "Aerospace fasteners", change: "+48%", region: "SE Asia" },
    { category: "Industrial automation", change: "+34%", region: "Middle East" },
  ],
};

// ─── Due diligence ────────────────────────────────────────────────────────────

export interface MockDueDiligence {
  companyName: string;
  gstNumber: string;
  cinNumber: string;
  incorporationDate: string;
  status: "Active" | "Struck Off" | "Dormant";
  registeredAddress: string;
  directors: string[];
  paidUpCapital: string;
  authorisedCapital: string;
  lastFilingDate: string;
  gstCompliance: "Compliant" | "Non-Compliant" | "Unknown";
  importExportCode: string | null;
  msmeCategory: string | null;
  onNextrade: boolean;
  nextradeUid: string | null;
  trustScore: number | null;
  verifiedCerts: string[];
  riskFlags: string[];
}

export const mockDueDiligence: MockDueDiligence = {
  companyName: "Acme Metals Pvt. Ltd.",
  gstNumber: "27AAFCA1234B1Z5",
  cinNumber: "U27100MH2008PTC181234",
  incorporationDate: "2008-06-12",
  status: "Active",
  registeredAddress: "Plot 14, MIDC Industrial Area, Andheri East, Mumbai 400093",
  directors: ["Rajiv Mehta", "Sunita Mehta", "Arun Kumar"],
  paidUpCapital: "₹50,00,000",
  authorisedCapital: "₹1,00,00,000",
  lastFilingDate: "2025-09-30",
  gstCompliance: "Compliant",
  importExportCode: "0308012345",
  msmeCategory: "Medium Enterprise",
  onNextrade: true,
  nextradeUid: "biz-acme-metals",
  trustScore: 4.9,
  verifiedCerts: ["ISO 9001:2015", "AS9100D", "ISO 14001"],
  riskFlags: [],
};

// ─── Profile completeness ─────────────────────────────────────────────────────

export const mockProfileCompleteness = {
  score: 72,
  sections: [
    { label: "Basic information", completed: true, weight: 10 },
    { label: "About & description", completed: true, weight: 10 },
    { label: "Logo & banner", completed: true, weight: 8 },
    { label: "Capabilities", completed: true, weight: 10 },
    { label: "Certifications", completed: true, weight: 12 },
    { label: "Delivery regions", completed: true, weight: 8 },
    { label: "Catalog items (5+)", completed: true, weight: 14 },
    { label: "Business verification", completed: false, weight: 15 },
    { label: "Team members", completed: false, weight: 5 },
    { label: "Compliance documents", completed: false, weight: 8 },
  ],
};

// ─── Team members ─────────────────────────────────────────────────────────────

export interface MockTeamMember {
  uid: string;
  name: string;
  email: string;
  role: "Admin" | "Catalog Manager" | "Sales" | "Procurement";
  status: "Active" | "Invited";
  lastActive: string;
}

export const mockTeamMembers: MockTeamMember[] = [
  { uid: "tm1", name: "Rajiv Mehta", email: "rajiv@acmemetals.com", role: "Admin", status: "Active", lastActive: "2026-04-13T09:30:00Z" },
  { uid: "tm2", name: "Priya Desai", email: "priya@acmemetals.com", role: "Catalog Manager", status: "Active", lastActive: "2026-04-13T08:15:00Z" },
  { uid: "tm3", name: "Vikram Singh", email: "vikram@acmemetals.com", role: "Sales", status: "Active", lastActive: "2026-04-12T17:40:00Z" },
  { uid: "tm4", name: "Anjali Rao", email: "anjali@acmemetals.com", role: "Procurement", status: "Invited", lastActive: "2026-04-11T11:00:00Z" },
];

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
