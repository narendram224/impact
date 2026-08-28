// Base row type representing SKU × Store data
export interface BaseRow {
  id: string;
  dept: string;
  cls: string;
  style: string;
  name: string;
  channel: 'Store' | 'Ecomm';
  ros: number;
  wos: number;
  age: number;
  price: number;
  elasticity: number;
  confidence: number;
  fin: number[];
  ia: number[];
}

// Style metadata
export interface StyleMeta {
  division: string;
  subclass: string;
  programRetail: string;
  programOnline: string;
  ccs: [string, string][];
}

// Enriched row after simulation
export interface EnrichedRow extends BaseRow {
  brand: string;
  division: string;
  subclass: string;
  programRetail: string;
  programOnline: string;
  ageWeeks: number;
  finData: SimulationData;
  iaData: SimulationData;
}

export interface SimulationData {
  discounts: number[];
  progression: string;
  band: 'low' | 'medium' | 'high';
  bopUnits: number;
  bopValue: number;
  stPct: number;
  stStatus: 'low' | 'medium' | 'high';
  eopUnits: number;
  eopValue: number;
}

// Aggregated hierarchy row
export interface HierarchyRow {
  key: string;
  groupKey: string;
  count: number;
  productLabel: string;
  productSub: string;
  store: string;
  items: EnrichedRow[];
  ros: number;
  wos: number;
  ageWeeks: number;
  bopUnits: number;
  bopValue: number;
  elasticityScore: number;
  elasticityBand: 'low' | 'medium' | 'high';
  confidenceScore: number;
  confidenceBand: 'low' | 'medium' | 'high';
  finDiscounts: number[];
  finProgression: string;
  finBand: 'low' | 'medium' | 'high';
  finStPct: number;
  finStStatus: 'low' | 'medium' | 'high';
  finEopUnits: number;
  finEopValue: number;
  finMemberProgKeys: string[];
  iaDiscounts: number[];
  iaProgression: string;
  iaBand: 'low' | 'medium' | 'high';
  iaStPct: number;
  iaStStatus: 'low' | 'medium' | 'high';
  iaEopUnits: number;
  iaEopValue: number;
  iaMemberProgKeys: string[];
}

// Progression row for "By Discount Progression" view
export interface ProgressionRow {
  key: string;
  progKey: string;
  count: number;
  discounts: number[];
  progression: string;
  pricing: 'finalised' | 'ia';
  band: 'low' | 'medium' | 'high';
  stStatus: 'low' | 'medium' | 'high';
  ros: number;
  wos: number;
  ageWeeks: number;
  elasticityScore: number;
  elasticityBand: 'low' | 'medium' | 'high';
  bopUnits: number;
  bopValue: number;
  eopUnits: number;
  eopValue: number;
  stPct: number;
}

// Progression universe item
export interface ProgUniverseItem {
  key: string;
  discounts: number[];
  pricing: 'finalised' | 'ia';
  count: number;
}

// Historical data point
export interface HistoryPoint {
  week: number;
  isForecast: boolean;
  baselineUnits: number;
  liftUnits: number;
  totalUnits: number;
  invUnits: number;
  msrp: number;
  sp: number;
  sellingPrice: number;
  auc: number;
  costPrice: number;
  discountPct: number;
  plannedDiscountPct: number;
  label?: string;
  offsetLabel?: string;
  spanWeeks?: number;
}

// Filter state
export interface FilterState {
  division: string[];
  department: string[];
  class_: string[];
  subclass: string[];
  style: string[];
  customerChoice: string[];
  programRetail: string[];
  programOnline: string[];
  channel: string[];
  storeId: string[];
}

// KPI values
export interface KPIValues {
  iaSellThrough: number;
  finSellThrough: number;
  lySellThrough: number;
  iaMargin: number;
  finMargin: number;
  lyMargin: number;
  iaVolume: number;
  finVolume: number;
  lyVolume: number;
}

// Metric definition
export interface MetricMeta {
  label: string;
  fmt: (v: number) => string;
}

// Chart axis option
export type MetricKey = 'stPct' | 'eopUnits' | 'ros' | 'wos' | 'ageWeeks';

// Perspective type
export type Perspective = 'finalised' | 'ia';

// Table view type
export type TableView = 'hierarchy' | 'progression';

// Timeline granularity
export type TimelineGranularity = 'weekly' | 'monthly' | 'quarterly';

// Right axis category
export type RightAxisCategory = 'price' | 'cost' | 'discount';

// Product hierarchy level
export type ProductLevel = 'brand' | 'division' | 'department' | 'class' | 'subclass' | 'style' | 'programRetail' | 'programOnline' | 'customerChoice';

// Store hierarchy level
export type StoreLevel = 'all' | 'channel' | 'store';

// Benchmark line keys
export type BenchmarkLineKey = 'basePrice' | 'sp' | 'aur' | 'aum' | 'auc' | 'costPrice' | 'weightedAvg';

// Sidebar route type
export interface SidebarRouteItem {
  label: string;
  value: string;
  icon: React.ReactNode;
  link: string;
  children?: SidebarRouteItem[];
}

// Filter tag for FiltersStrip
export interface FilterTagItem {
  id: string;
  label: string;
  required?: boolean;
  values: { label: string }[];
}
