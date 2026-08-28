import { create } from 'zustand';
import type {
  FilterState,
  Perspective,
  TableView,
  TimelineGranularity,
  RightAxisCategory,
  ProductLevel,
  StoreLevel,
  MetricKey,
  BenchmarkLineKey,
} from '../types';

interface ExplainabilityState {
  // Perspective for each chart
  perspective1: Perspective;
  perspective2: Perspective;

  // Hierarchy levels
  productLevel: ProductLevel;
  storeLevel: StoreLevel;
  pendingProductLevel: ProductLevel;
  pendingStoreLevel: StoreLevel;

  // Chart axes
  chart1X: MetricKey;
  chart1Y: MetricKey;
  chart2X: MetricKey;
  chart2Y: MetricKey;

  // Selection state
  selectedIds: Set<string>;
  checkedProgressions: Set<string>;
  /** Full progression universe keys — used by Reset filters to re-check all */
  allProgressionKeys: string[];

  // Sort state
  sortCol: string | null;
  sortDir: 1 | -1;

  // Table view
  tableView: TableView;

  // Historical Performance panel state
  histBenchL4W: boolean;
  histBenchL8W: boolean;
  histRefFin: boolean;
  histRefIA: boolean;
  histShowLy: boolean;
  histRightCategory: RightAxisCategory;
  histRightLines: Record<BenchmarkLineKey, boolean>;
  histTimeline: TimelineGranularity;

  // Filter state
  histFilters: FilterState;
  histFiltersDraft: FilterState | null;

  // UI state
  showFilterPanel: boolean;
  allfTab: 'store' | 'product';
  allfOpenDropdown: string | null;
  benchmarksMenuOpen: boolean;
  histFilterPanelOpen: boolean;
  levelFiltersOpen: boolean;
  showFiltersStrip: boolean;

  // Loading state
  isLoading: boolean;

  // Actions
  setPerspective: (chart: '1' | '2' | 'both', value: Perspective) => void;
  setProductLevel: (level: ProductLevel) => void;
  setStoreLevel: (level: StoreLevel) => void;
  setChartAxis: (chart: '1' | '2', axis: 'x' | 'y', value: MetricKey) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  toggleProgression: (key: string) => void;
  setAllProgressions: (keys: string[], checked: boolean) => void;
  setCheckedProgressions: (keys: string[]) => void;
  setSortCol: (col: string | null) => void;
  toggleSortDir: () => void;
  setTableView: (view: TableView) => void;
  setHistTimeline: (timeline: TimelineGranularity) => void;
  setHistRightCategory: (category: RightAxisCategory) => void;
  toggleHistRightLine: (line: BenchmarkLineKey) => void;
  toggleHistShowLy: () => void;
  toggleHistRefFin: () => void;
  toggleHistRefIA: () => void;
  setHistFilters: (filters: FilterState) => void;
  setHistFiltersDraft: (filters: FilterState | null) => void;
  setShowFilterPanel: (show: boolean) => void;
  setAllfTab: (tab: 'store' | 'product') => void;
  setAllfOpenDropdown: (field: string | null) => void;
  setBenchmarksMenuOpen: (open: boolean) => void;
  setHistFilterPanelOpen: (open: boolean) => void;
  setLevelFiltersOpen: (open: boolean) => void;
  setShowFiltersStrip: (show: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  resetFilters: (progressionKeys?: string[]) => void;
  initializeProgressions: (keys: string[]) => void;
}

const initialFilterState: FilterState = {
  division: [],
  department: [],
  class_: [],
  subclass: [],
  style: [],
  customerChoice: [],
  programRetail: [],
  programOnline: [],
  channel: [],
  storeId: [],
};

const initialHistRightLines: Record<BenchmarkLineKey, boolean> = {
  basePrice: true,
  sp: true,
  aur: true,
  aum: true,
  auc: false,
  costPrice: false,
  weightedAvg: false,
};

export const useExplainabilityStore = create<ExplainabilityState>((set) => ({
  // Initial state
  perspective1: 'finalised',
  perspective2: 'finalised',
  productLevel: 'style',
  storeLevel: 'channel',
  pendingProductLevel: 'style',
  pendingStoreLevel: 'channel',
  chart1X: 'stPct',
  chart1Y: 'eopUnits',
  chart2X: 'wos',
  chart2Y: 'ros',
  selectedIds: new Set(),
  checkedProgressions: new Set(),
  allProgressionKeys: [],
  sortCol: null,
  sortDir: 1,
  tableView: 'hierarchy',
  histBenchL4W: false,
  histBenchL8W: false,
  histRefFin: true,
  histRefIA: true,
  histShowLy: false,
  histRightCategory: 'price',
  histRightLines: initialHistRightLines,
  histTimeline: 'weekly',
  histFilters: initialFilterState,
  histFiltersDraft: null,
  showFilterPanel: false,
  allfTab: 'store',
  allfOpenDropdown: null,
  benchmarksMenuOpen: false,
  histFilterPanelOpen: false,
  levelFiltersOpen: false,
  showFiltersStrip: true,
  isLoading: true,

  // Actions
  setPerspective: (chart, value) =>
    set(() => {
      if (chart === 'both') {
        return { perspective1: value, perspective2: value };
      }
      return chart === '1'
        ? { perspective1: value }
        : { perspective2: value };
    }),

  setProductLevel: (level) =>
    set({ productLevel: level, pendingProductLevel: level }),

  setStoreLevel: (level) =>
    set({ storeLevel: level, pendingStoreLevel: level }),

  setChartAxis: (chart, axis, value) =>
    set(() => {
      const key = `chart${chart}${axis.toUpperCase()}` as keyof Pick<
        ExplainabilityState,
        'chart1X' | 'chart1Y' | 'chart2X' | 'chart2Y'
      >;
      return { [key]: value };
    }),

  toggleSelection: (id) =>
    set((state) => {
      const newSet = new Set(state.selectedIds);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return { selectedIds: newSet };
    }),

  clearSelection: () => set({ selectedIds: new Set() }),

  toggleProgression: (key) =>
    set((state) => {
      const newSet = new Set(state.checkedProgressions);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return { checkedProgressions: newSet };
    }),

  setAllProgressions: (keys, checked) =>
    set((state) => {
      const newSet = new Set(state.checkedProgressions);
      keys.forEach((key) => {
        if (checked) {
          newSet.add(key);
        } else {
          newSet.delete(key);
        }
      });
      return { checkedProgressions: newSet };
    }),

  setCheckedProgressions: (keys) =>
    set({ checkedProgressions: new Set(keys) }),

  setSortCol: (col) => set({ sortCol: col, sortDir: 1 }),

  toggleSortDir: () =>
    set((state) => ({ sortDir: state.sortDir === 1 ? -1 : 1 })),

  setTableView: (view) => set({ tableView: view, sortCol: null }),

  setHistTimeline: (timeline) => set({ histTimeline: timeline }),

  setHistRightCategory: (category) =>
    set(() => {
      const defaultLines =
        category === 'price'
          ? { basePrice: true, sp: true, aur: true, aum: true, auc: false, costPrice: false, weightedAvg: false }
          : category === 'cost'
          ? { basePrice: false, sp: false, aur: false, aum: false, auc: true, costPrice: true, weightedAvg: false }
          : { basePrice: false, sp: false, aur: false, aum: false, auc: false, costPrice: false, weightedAvg: true };
      return { histRightCategory: category, histRightLines: defaultLines };
    }),

  toggleHistRightLine: (line) =>
    set((state) => ({
      histRightLines: {
        ...state.histRightLines,
        [line]: !state.histRightLines[line],
      },
    })),

  toggleHistShowLy: () => set((state) => ({ histShowLy: !state.histShowLy })),

  toggleHistRefFin: () => set((state) => ({ histRefFin: !state.histRefFin })),

  toggleHistRefIA: () => set((state) => ({ histRefIA: !state.histRefIA })),

  setHistFilters: (filters) => set({ histFilters: filters }),

  setHistFiltersDraft: (filters) => set({ histFiltersDraft: filters }),

  setShowFilterPanel: (show) => set({ showFilterPanel: show }),

  setAllfTab: (tab) => set({ allfTab: tab }),

  setAllfOpenDropdown: (field) => set({ allfOpenDropdown: field }),

  setBenchmarksMenuOpen: (open) => set({ benchmarksMenuOpen: open }),

  setHistFilterPanelOpen: (open) => set({ histFilterPanelOpen: open }),

  setLevelFiltersOpen: (open) => set({ levelFiltersOpen: open }),

  setShowFiltersStrip: (show) => set({ showFiltersStrip: show }),

  setIsLoading: (loading) => set({ isLoading: loading }),

  resetFilters: (progressionKeys) =>
    set((state) => {
      const keys =
        progressionKeys && progressionKeys.length > 0
          ? progressionKeys
          : state.allProgressionKeys;
      return {
        // Match HTML resetFiltersBtn: re-check every progression, clear selection + sort
        checkedProgressions: new Set(keys),
        allProgressionKeys: keys.length ? keys : state.allProgressionKeys,
        selectedIds: new Set(),
        sortCol: null,
        sortDir: 1,
      };
    }),

  initializeProgressions: (keys) =>
    set({
      allProgressionKeys: keys,
      checkedProgressions: new Set(keys),
    }),
}));
