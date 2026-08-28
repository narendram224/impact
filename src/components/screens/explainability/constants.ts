import type { FilterTagItem } from '../../../types';

export const STRATEGY_INFO = {
  name: 'Fall Clearance — Outerwear & Denim',
  startDate: '10/02/2026',
  endDate: '11/13/2026',
  days: 42,
};

export const STEPS = [
  { num: 1, label: 'Products & Stores', status: 'done' as const },
  { num: 2, label: 'MD Guard Rails & Objectives & Rules', status: 'done' as const },
  { num: 3, label: 'IA Recommended Results', status: 'active' as const },
];

export const filterTags: FilterTagItem[] = [
  {
    id: 'country',
    label: 'Country',
    required: true,
    values: [{ label: 'United States' }],
  },
  {
    id: 'brand',
    label: 'Brand',
    required: true,
    values: [{ label: 'Gap' }],
  },
  {
    id: 'division',
    label: 'Division',
    required: true,
    values: [{ label: 'Denim & Casual' }, { label: 'Outerwear & Cold Weather' }],
  },
  {
    id: 'currency',
    label: 'Currency',
    required: true,
    values: [{ label: 'USD' }],
  },
];

export const METRIC_OPTIONS = [
  { value: 'stPct', label: 'Sell-Through % (Projected)' },
  { value: 'eopUnits', label: 'Inventory (EOP Units)' },
  { value: 'ros', label: 'Rate of Sale (units/wk)' },
  { value: 'wos', label: 'Weeks of Supply' },
  { value: 'ageWeeks', label: 'Age of Inventory (Weeks)' },
];

/** Tick formatters matching HTML METRIC_META.fmt */
export const METRIC_FMT: Record<string, (v: number) => string> = {
  stPct: (v) => `${v.toFixed(1)}%`,
  eopUnits: (v) => Math.round(v).toLocaleString(),
  ros: (v) => v.toFixed(1),
  wos: (v) => v.toFixed(1),
  ageWeeks: (v) => `${v.toFixed(1)}w`,
};

export const TIMELINE_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly (4-wk)' },
  { value: 'quarterly', label: 'Quarterly (13-wk)' },
];

export const RIGHT_AXIS_OPTIONS = [
  { value: 'price', label: 'Price $' },
  { value: 'cost', label: 'Cost $' },
  { value: 'discount', label: 'Discount %' },
];

export const BENCHMARK_OPTIONS = [
  { key: 'basePrice', label: 'Base price (regular ticket)', group: 'price' },
  { key: 'sp', label: 'SP (planned selling price)', group: 'price' },
  { key: 'aur', label: 'AUR (Avg. Unit Retail)', group: 'price' },
  { key: 'aum', label: 'AUM (Avg. Unit Margin)', group: 'price' },
  { key: 'auc', label: 'AUC (Avg. Unit Cost)', group: 'cost' },
  { key: 'costPrice', label: 'Cost price (vendor invoice)', group: 'cost' },
  { key: 'weightedAvg', label: 'Weighted Avg. Discount %', group: 'discount' },
];
