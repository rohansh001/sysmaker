export type ComponentCategory =
  | 'cpu'
  | 'motherboard'
  | 'ram'
  | 'gpu'
  | 'storage'
  | 'psu'
  | 'cabinet'
  | 'cooler'
  | 'monitor'
  | 'keyboard'
  | 'mouse';

export interface BaseSpecifications {
  [key: string]: unknown;
}

export interface CpuSpecs extends BaseSpecifications {
  socket: string;
  cores: number;
  threads: number;
  baseClockGhz: number;
  boostClockGhz: number;
  tdpWatts: number;
  integratedGraphics: boolean;
  includesStockCooler: boolean;
  supportedMemory: ('DDR4' | 'DDR5')[];
  pcieVersion?: string;
  architecture?: string;
}

export interface MotherboardSpecs extends BaseSpecifications {
  socket: string;
  formFactor: 'ATX' | 'Micro-ATX' | 'Mini-ITX' | 'E-ATX';
  chipset: string;
  memoryType: 'DDR4' | 'DDR5';
  memorySlots: number;
  maxMemoryGb: number;
  m2Slots: number;
  sataPorts: number;
  hasWifi: boolean;
  pcieGen?: string;
}

export interface RamSpecs extends BaseSpecifications {
  type: 'DDR4' | 'DDR5';
  speedMhz: number;
  capacityGb: number;
  modules: number; // e.g. 1 or 2
  casLatency?: string;
  voltage?: number;
  rgb?: boolean;
}

export interface GpuSpecs extends BaseSpecifications {
  chipset: string;
  vramGb: number;
  vramType: string;
  lengthMm: number;
  recommendedPsuWatts: number;
  tdpWatts: number;
  pcieSlots?: number;
  hdmiPorts?: number;
  displayPorts?: number;
}

export interface StorageSpecs extends BaseSpecifications {
  type: 'NVMe M.2' | 'SATA 2.5"' | 'HDD 3.5"';
  capacityGb: number;
  readSpeedMbps?: number;
  writeSpeedMbps?: number;
  interface: 'PCIe 4.0' | 'PCIe 3.0' | 'SATA 3';
}

export interface PsuSpecs extends BaseSpecifications {
  wattage: number;
  efficiencyRating: '80+ White' | '80+ Bronze' | '80+ Gold' | '80+ Platinum';
  modularity: 'Non-Modular' | 'Semi-Modular' | 'Fully-Modular';
  formFactor: 'ATX' | 'SFX';
}

export interface CabinetSpecs extends BaseSpecifications {
  supportedFormFactors: ('ATX' | 'Micro-ATX' | 'Mini-ITX' | 'E-ATX')[];
  maxGpuLengthMm: number;
  maxCpuCoolerHeightMm: number;
  includedFans: number;
  sidePanel: 'Tempered Glass' | 'Mesh' | 'Solid';
}

export interface CoolerSpecs extends BaseSpecifications {
  type: 'Air' | 'AIO 240mm' | 'AIO 360mm' | 'AIO 120mm';
  heightMm: number;
  supportedSockets: string[];
  maxTdpWatts?: number;
}

export interface MonitorSpecs extends BaseSpecifications {
  screenSizeInches: number;
  resolution: '1080p' | '1440p' | '4K';
  refreshRateHz: number;
  panelType: 'IPS' | 'VA' | 'TN' | 'OLED';
  responseTimeMs: number;
}

export interface KeyboardSpecs extends BaseSpecifications {
  type: 'Mechanical' | 'Membrane';
  layout: 'Full-size' | 'TKL' | '65%' | '60%';
  connectivity: 'Wired' | 'Wireless' | 'Tri-mode';
  switchType?: string;
  backlight?: string;
}

export interface MouseSpecs extends BaseSpecifications {
  sensorDpi: number;
  weightGrams?: number;
  connectivity: 'Wired' | 'Wireless';
  programmableButtons?: number;
}

export type ComponentSpecs =
  | CpuSpecs
  | MotherboardSpecs
  | RamSpecs
  | GpuSpecs
  | StorageSpecs
  | PsuSpecs
  | CabinetSpecs
  | CoolerSpecs
  | MonitorSpecs
  | KeyboardSpecs
  | MouseSpecs
  | BaseSpecifications;

export interface Component {
  id: string;
  category: ComponentCategory;
  brand: string;
  name: string;
  priceINR: number;
  specifications: ComponentSpecs;
  imageUrl?: string | null;
  retailerUrl?: string | null;
  retailerName?: string;
  lastVerifiedAt?: string | null;
  dataSource: 'demo' | 'verified';
  warrantyYears?: number;
  description?: string;
  modelNumber?: string;
  asin?: string;
  flipkartId?: string;
}

export type RetailerId =
  | 'amazon_in'
  | 'flipkart'
  | 'mdcomputers'
  | 'vedant'
  | 'primeabgb';

export interface NormalizedRetailerOffer {
  retailerId: RetailerId;
  retailerName: string;
  retailerLogo?: string;
  productId: string; // ASIN, FSP ID, or SKU
  productTitle: string;
  priceINR: number;
  originalPriceINR?: number;
  inStock: boolean;
  stockStatus: 'in_stock' | 'out_of_stock' | 'limited_stock' | 'unknown';
  productUrl: string;
  dataSource: 'live_api' | 'cached_api' | 'catalog_reference';
  lastCheckedAt: string;
  cachedUntil?: string;
  matchConfidence: 'exact_model' | 'high_part_number' | 'catalog_fallback';
  modelIdentifier?: string;
  affiliateDisclosure?: string;
}

export interface RetailerApiStatus {
  retailerId: RetailerId;
  retailerName: string;
  isConfigured: boolean;
  connectionStatus: 'connected' | 'not_configured' | 'rate_limited' | 'error';
  errorMessage?: string;
  lastCheckedAt: string;
  requiresApprovedAccount: boolean;
  missingEnvVars?: string[];
}

export interface RetailerPricingResponse {
  componentId: string;
  componentName: string;
  modelIdentifier?: string;
  catalogPriceINR: number;
  offers: NormalizedRetailerOffer[];
  bestOffer?: NormalizedRetailerOffer;
  retailerStatuses: RetailerApiStatus[];
  isLiveApiConnected: boolean;
  notice: string;
}

export type BuildComponents = Partial<Record<ComponentCategory, Component>>;

export interface Build {
  id: string;
  name: string;
  components: BuildComponents;
  createdAt: string;
  updatedAt: string;
  includePeripheralsInBudget?: boolean;
  notes?: string;
}

export type IssueSeverity = 'error' | 'warning' | 'info';

export interface CompatibilityIssue {
  id: string;
  severity: IssueSeverity;
  category: string;
  title: string;
  message: string;
  affectedComponents: ComponentCategory[];
  isUnknown?: boolean;
}

export interface CompatibilityReport {
  isCompatible: boolean;
  status: 'compatible' | 'incompatible' | 'has_warnings' | 'unknown' | 'incomplete';
  statusLabel: string;
  summary: string;
  issues: CompatibilityIssue[];
  estimatedWattage: number;
  recommendedPsuWattage: number;
  coreComplete: boolean;
  missingCoreComponents: ComponentCategory[];
}

export interface PriceBreakdown {
  coreSubtotalINR: number;
  peripheralSubtotalINR: number;
  grandTotalINR: number;
  componentCount: number;
  taxEstimateINR: number;
  shippingEstimateINR: number;
  effectiveTotalINR: number;
  budgetCapINR?: number;
  budgetDeltaINR?: number;
  budgetStatus: 'within_budget' | 'over_budget' | 'no_budget_set';
}

export interface BenchmarkRecord {
  id: string;
  cpuName: string;
  cpuId?: string;
  gpuName: string;
  gpuId?: string;
  game: string;
  resolution: '1080p' | '1440p' | '4K';
  qualityPreset: 'Low' | 'Medium' | 'High' | 'Ultra';
  avgFps: number;
  low1PercentFps: number;
  source: string;
  testDate: string;
  driverVersion?: string;
  testSystemNotes?: string;
}

export type BudgetTier =
  | 'under-20k'
  | '20k-35k'
  | '35k-50k'
  | '50k-75k'
  | '75k-100k'
  | 'above-100k';

export type UseCase =
  | 'study-office'
  | 'programming'
  | 'graphic-video'
  | 'gaming'
  | 'workstation';

export interface RecommendationPreset {
  id: string;
  title: string;
  budgetTier: BudgetTier;
  useCase: UseCase;
  targetBudgetINR: number;
  componentIds: string[];
  rationale: string;
  tradeOffs: string[];
  highlights: string[];
}
