import type {
  BaseRow,
  StyleMeta,
  EnrichedRow,
  HierarchyRow,
  ProgressionRow,
  ProgUniverseItem,
  HistoryPoint,
  FilterState,
  ProductLevel,
  StoreLevel,
  Perspective,
  KPIValues,
} from '../types';

// Constants
const PCD_WEEKS = 2;
const HIST_PAST_WEEKS = 10;
const HIST_FWD_WEEKS = 10;
const STRATEGY_WEEKS = PCD_WEEKS * 3;
const KPI_LY_FACTOR = 0.88;

// Simulation functions
export function simulate(
  ros: number,
  bopUnits: number,
  discounts: number[],
  elasticity: number
) {
  let remaining = bopUnits;
  let sold = 0;
  discounts.forEach((d) => {
    const mult = 1 + (d / 100) * elasticity;
    const weeklySold = ros * mult;
    const s = Math.min(remaining, weeklySold * PCD_WEEKS);
    sold += s;
    remaining -= s;
  });
  return {
    eopUnits: Math.max(0, Math.round(remaining)),
    stPct: bopUnits ? (sold / bopUnits) * 100 : 0,
  };
}

// Band calculation functions
export function avgDiscount(discounts: number[]): number {
  return discounts.reduce((a, b) => a + b, 0) / discounts.length;
}

export function band(discounts: number[]): 'low' | 'medium' | 'high' {
  const avg = avgDiscount(discounts);
  if (avg < 20) return 'low';
  if (avg < 50) return 'medium';
  return 'high';
}

export function stStatus(pct: number): 'low' | 'medium' | 'high' {
  if (pct >= 70) return 'high';
  if (pct >= 45) return 'medium';
  return 'low';
}

export function elasticityBand(e: number): 'low' | 'medium' | 'high' {
  if (e >= 1.5) return 'high';
  if (e >= 0.6) return 'medium';
  return 'low';
}

export function confidenceBand(score: number): 'low' | 'medium' | 'high' {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

export function roundTo5(n: number): number {
  return Math.round(n / 5) * 5;
}

// Color generation for scatter plot
export function discColor(avgDiscountPct: number): string {
  const t = Math.max(0, Math.min(100, avgDiscountPct)) / 100;
  const L = 90 - t * 62;
  return `hsl(231, 72%, ${L.toFixed(1)}%)`;
}

// Enrich base rows with simulation data
export function enrichRows(
  baseRows: BaseRow[],
  styleMeta: Record<string, StyleMeta>,
  brand: string
): EnrichedRow[] {
  return baseRows.map((r) => {
    const meta = styleMeta[r.style] || {
      division: '',
      subclass: '',
      programRetail: '',
      programOnline: '',
      ccs: [],
    };

    const out: EnrichedRow = {
      ...r,
      brand,
      division: meta.division,
      subclass: meta.subclass,
      programRetail: meta.programRetail,
      programOnline: meta.programOnline,
      ageWeeks: r.age,
      finData: {} as EnrichedRow['finData'],
      iaData: {} as EnrichedRow['iaData'],
    };

    ['fin', 'ia'].forEach((key) => {
      const discounts = r[key as 'fin' | 'ia'];
      const bopUnits = Math.round(r.ros * r.wos);
      const sim = simulate(r.ros, bopUnits, discounts, r.elasticity);
      const dk = `${key}Data` as 'finData' | 'iaData';

      out[dk] = {
        discounts,
        progression: discounts.join('-'),
        band: band(discounts),
        bopUnits,
        bopValue: Math.round(bopUnits * r.price),
        stPct: sim.stPct,
        stStatus: stStatus(sim.stPct),
        eopUnits: sim.eopUnits,
        eopValue: Math.round(
          sim.eopUnits * r.price * (1 - discounts[2] / 100)
        ),
      };
    });

    return out;
  });
}

// Build progression universe
export function buildProgUniverse(
  enrichedRows: EnrichedRow[]
): ProgUniverseItem[] {
  const map: Record<string, ProgUniverseItem> = {};

  enrichedRows.forEach((row) => {
    (['finData', 'iaData'] as const).forEach((dk) => {
      const pricing = dk === 'finData' ? 'finalised' : 'ia';
      const d = row[dk];
      const key = `${d.progression}|${pricing}`;
      if (!map[key]) {
        map[key] = { key, discounts: d.discounts, pricing, count: 0 };
      }
      map[key].count++;
    });
  });

  return Object.values(map).sort((a, b) => {
    if (a.pricing !== b.pricing) return a.pricing === 'finalised' ? -1 : 1;
    return (
      a.discounts[0] - b.discounts[0] ||
      a.discounts[1] - b.discounts[1] ||
      a.discounts[2] - b.discounts[2]
    );
  });
}

// Apply filters to rows
export function filterRows(
  rows: EnrichedRow[],
  filters: FilterState
): EnrichedRow[] {
  let filtered = rows;

  if (filters.division.length) {
    filtered = filtered.filter((r) => filters.division.includes(r.division));
  }
  if (filters.department.length) {
    filtered = filtered.filter((r) => filters.department.includes(r.dept));
  }
  if (filters.class_.length) {
    filtered = filtered.filter((r) => filters.class_.includes(r.cls));
  }
  if (filters.subclass.length) {
    filtered = filtered.filter((r) => filters.subclass.includes(r.subclass));
  }
  if (filters.style.length) {
    filtered = filtered.filter((r) => filters.style.includes(r.style));
  }
  if (filters.programRetail.length) {
    filtered = filtered.filter((r) =>
      filters.programRetail.includes(r.programRetail)
    );
  }
  if (filters.programOnline.length) {
    filtered = filtered.filter((r) =>
      filters.programOnline.includes(r.programOnline)
    );
  }
  if (filters.channel.length) {
    filtered = filtered.filter((r) => filters.channel.includes(r.channel));
  }

  return filtered.length ? filtered : rows;
}

// Get product field value based on hierarchy level
function getProductField(row: EnrichedRow, level: ProductLevel): string {
  switch (level) {
    case 'brand':
      return row.brand;
    case 'division':
      return row.division;
    case 'department':
      return row.dept;
    case 'class':
      return row.cls;
    case 'subclass':
      return row.subclass;
    case 'style':
      return row.style;
    case 'programRetail':
      return row.programRetail;
    case 'programOnline':
      return row.programOnline;
    case 'customerChoice':
      return row.style;
    default:
      return row.style;
  }
}

function getProductLabel(row: EnrichedRow, level: ProductLevel): string {
  switch (level) {
    case 'brand':
      return row.brand;
    case 'division':
      return row.division;
    case 'department':
      return row.dept;
    case 'class':
      return row.cls;
    case 'subclass':
      return row.subclass;
    case 'style':
      return row.name;
    case 'programRetail':
      return row.programRetail;
    case 'programOnline':
      return row.programOnline;
    case 'customerChoice':
      return row.name;
    default:
      return row.name;
  }
}

function getProductSub(row: EnrichedRow, level: ProductLevel): string {
  switch (level) {
    case 'brand':
      return '';
    case 'division':
      return row.brand;
    case 'department':
      return row.division;
    case 'class':
      return row.dept;
    case 'subclass':
      return row.cls;
    case 'style':
      return row.style;
    case 'programRetail':
      return row.dept;
    case 'programOnline':
      return row.dept;
    case 'customerChoice':
      return row.style;
    default:
      return '';
  }
}

// Build hierarchy rows
export function buildHierarchyRows(
  enrichedRows: EnrichedRow[],
  productLevel: ProductLevel,
  storeLevel: StoreLevel,
  filters: FilterState
): HierarchyRow[] {
  const filteredRows = filterRows(enrichedRows, filters);

  const groups: Record<
    string,
    {
      items: EnrichedRow[];
      productLabel: string;
      productSub: string;
      store: string;
    }
  > = {};

  filteredRows.forEach((row) => {
    const productField = getProductField(row, productLevel);
    const store = storeLevel === 'all' ? 'All Stores' : row.channel;
    const gk = `${productField} | ${store}`;

    if (!groups[gk]) {
      groups[gk] = {
        items: [],
        productLabel: getProductLabel(row, productLevel),
        productSub: getProductSub(row, productLevel),
        store,
      };
    }
    groups[gk].items.push(row);
  });

  return Object.entries(groups).map(([gk, g]) => {
    const n = g.items.length;
    const avg = (f: (r: EnrichedRow) => number) =>
      g.items.reduce((a, r) => a + f(r), 0) / n;
    const sum = (f: (r: EnrichedRow) => number) =>
      g.items.reduce((a, r) => a + f(r), 0);

    const ros = avg((r) => r.ros);
    const wos = avg((r) => r.wos);
    const ageWeeks = avg((r) => r.ageWeeks);
    const bopUnits = sum((r) => r.finData.bopUnits);
    const bopValue = sum((r) => r.finData.bopValue);

    const finEopUnits = sum((r) => r.finData.eopUnits);
    const finEopValue = sum((r) => r.finData.eopValue);
    const iaEopUnits = sum((r) => r.iaData.eopUnits);
    const iaEopValue = sum((r) => r.iaData.eopValue);

    const finStPct = bopUnits ? ((bopUnits - finEopUnits) / bopUnits) * 100 : 0;
    const iaStPct = bopUnits ? ((bopUnits - iaEopUnits) / bopUnits) * 100 : 0;

    const finD1 = roundTo5(avg((r) => r.finData.discounts[0]));
    const finD2 = roundTo5(avg((r) => r.finData.discounts[1]));
    const finD3 = roundTo5(avg((r) => r.finData.discounts[2]));
    const finDiscounts = [finD1, finD2, finD3];

    const iaD1 = roundTo5(avg((r) => r.iaData.discounts[0]));
    const iaD2 = roundTo5(avg((r) => r.iaData.discounts[1]));
    const iaD3 = roundTo5(avg((r) => r.iaData.discounts[2]));
    const iaDiscounts = [iaD1, iaD2, iaD3];

    const elasticityScore = avg((r) => r.elasticity);
    const confidenceScore = avg((r) => r.confidence);

    return {
      key: gk,
      groupKey: gk,
      count: n,
      productLabel: g.productLabel,
      productSub: g.productSub,
      store: g.store,
      items: g.items,
      ros,
      wos,
      ageWeeks,
      bopUnits,
      bopValue,
      elasticityScore,
      elasticityBand: elasticityBand(elasticityScore),
      confidenceScore,
      confidenceBand: confidenceBand(confidenceScore),
      finDiscounts,
      finProgression: finDiscounts.join('-'),
      finBand: band(finDiscounts),
      finStPct,
      finStStatus: stStatus(finStPct),
      finEopUnits,
      finEopValue,
      finMemberProgKeys: g.items.map(
        (r) => `${r.finData.progression}|finalised`
      ),
      iaDiscounts,
      iaProgression: iaDiscounts.join('-'),
      iaBand: band(iaDiscounts),
      iaStPct,
      iaStStatus: stStatus(iaStPct),
      iaEopUnits,
      iaEopValue,
      iaMemberProgKeys: g.items.map((r) => `${r.iaData.progression}|ia`),
    };
  });
}

// Build progression rows
export function buildProgressionRows(
  enrichedRows: EnrichedRow[],
  filters: FilterState
): ProgressionRow[] {
  const filteredRows = filterRows(enrichedRows, filters);

  const groups: Record<
    string,
    {
      items: { raw: EnrichedRow; sim: EnrichedRow['finData'] }[];
      discounts: number[];
      pricing: 'finalised' | 'ia';
    }
  > = {};

  filteredRows.forEach((row) => {
    (['finData', 'iaData'] as const).forEach((dk) => {
      const pricing = dk === 'finData' ? 'finalised' : 'ia';
      const d = row[dk];
      const progKey = `${d.progression}|${pricing}`;

      if (!groups[progKey]) {
        groups[progKey] = { items: [], discounts: d.discounts, pricing };
      }
      groups[progKey].items.push({ raw: row, sim: d });
    });
  });

  return Object.entries(groups).map(([progKey, g]) => {
    const n = g.items.length;
    const sum = (f: (it: { raw: EnrichedRow; sim: EnrichedRow['finData'] }) => number) =>
      g.items.reduce((a, it) => a + f(it), 0);
    const avg = (f: (it: { raw: EnrichedRow; sim: EnrichedRow['finData'] }) => number) =>
      sum(f) / n;

    const bopUnits = sum((it) => it.sim.bopUnits);
    const bopValue = sum((it) => it.sim.bopValue);
    const eopUnits = sum((it) => it.sim.eopUnits);
    const eopValue = sum((it) => it.sim.eopValue);
    const stPct = bopUnits ? ((bopUnits - eopUnits) / bopUnits) * 100 : 0;
    const elasticityScore = avg((it) => it.raw.elasticity);

    return {
      key: `prog::${progKey}`,
      progKey,
      count: n,
      discounts: g.discounts,
      progression: g.discounts.join('-'),
      pricing: g.pricing,
      band: band(g.discounts),
      stStatus: stStatus(stPct),
      ros: avg((it) => it.raw.ros),
      wos: avg((it) => it.raw.wos),
      ageWeeks: avg((it) => it.raw.ageWeeks),
      elasticityScore,
      elasticityBand: elasticityBand(elasticityScore),
      bopUnits,
      bopValue,
      eopUnits,
      eopValue,
      stPct,
    };
  });
}

// Calculate KPI values
export function calculateKPIs(rows: HierarchyRow[]): KPIValues {
  const bopUnits = rows.reduce((a, r) => a + r.bopUnits, 0);
  const bopValue = rows.reduce((a, r) => a + r.bopValue, 0);

  const iaEopUnits = rows.reduce((a, r) => a + r.iaEopUnits, 0);
  const finEopUnits = rows.reduce((a, r) => a + r.finEopUnits, 0);
  const iaEopValue = rows.reduce((a, r) => a + r.iaEopValue, 0);
  const finEopValue = rows.reduce((a, r) => a + r.finEopValue, 0);

  const iaSellThrough = bopUnits
    ? ((bopUnits - iaEopUnits) / bopUnits) * 100
    : 0;
  const finSellThrough = bopUnits
    ? ((bopUnits - finEopUnits) / bopUnits) * 100
    : 0;
  const lySellThrough = finSellThrough * KPI_LY_FACTOR;

  const iaVolume = bopUnits - iaEopUnits;
  const finVolume = bopUnits - finEopUnits;
  const lyVolume = finVolume * KPI_LY_FACTOR;

  const iaMargin = (bopValue - iaEopValue) * 0.35;
  const finMargin = (bopValue - finEopValue) * 0.35;
  const lyMargin = finMargin * KPI_LY_FACTOR;

  return {
    iaSellThrough,
    finSellThrough,
    lySellThrough,
    iaMargin,
    finMargin,
    lyMargin,
    iaVolume,
    finVolume,
    lyVolume,
  };
}

// Get metric value from row based on perspective
export function getMetricValue(
  row: HierarchyRow,
  metricKey: string,
  perspective: Perspective
): number {
  if (metricKey === 'stPct') {
    return perspective === 'finalised' ? row.finStPct : row.iaStPct;
  }
  if (metricKey === 'eopUnits') {
    return perspective === 'finalised' ? row.finEopUnits : row.iaEopUnits;
  }
  return row[metricKey as keyof HierarchyRow] as number;
}

// Seeded random number generator for consistent demo data
function seededRand(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

// Build history series for a single row
export function buildHistorySeries(
  row: EnrichedRow,
  key: 'fin' | 'ia' = 'fin'
): HistoryPoint[] {
  const offsets: number[] = [];
  for (let w = -HIST_PAST_WEEKS; w <= HIST_FWD_WEEKS; w++) offsets.push(w);

  const rnd = seededRand(row.id + row.style);
  const eventCount = row.elasticity >= 1.5 ? 3 : row.elasticity >= 1.0 ? 2 : 1;
  const events: { start: number; end: number; depth: number }[] = [];

  let cursor = -HIST_PAST_WEEKS + 1;
  for (let i = 0; i < eventCount; i++) {
    const gap = 1 + Math.floor(rnd() * 3);
    const startW = cursor + gap;
    const len = 1 + Math.floor(rnd() * 2);
    if (startW + len > -1) break;
    const depth = 10 + Math.round(rnd() * 20);
    events.push({ start: startW, end: startW + len, depth });
    cursor = startW + len;
  }

  const baselineUnits = row.ros;

  return offsets.map((w) => {
    const isForecast = w > 0;
    let discountPct: number;
    let planned: number;

    if (isForecast) {
      const pcdIdx = Math.min(2, Math.floor((w - 1) / PCD_WEEKS));
      planned = row[key][pcdIdx];
      discountPct = planned;
    } else {
      const ev = events.find((e) => w >= e.start && w <= e.end);
      planned = 0;
      discountPct = ev ? ev.depth : 2;
    }

    const liftMult = 1 + (discountPct / 100) * row.elasticity;
    const totalUnits = baselineUnits * liftMult;
    const liftUnits = totalUnits - baselineUnits;
    const msrp = row.price;
    const sp = row.price * (1 - (isForecast ? planned : discountPct) / 100);
    const convergence = isForecast ? Math.max(0, 1 - w / (STRATEGY_WEEKS + 2)) : 0;
    const sellingPrice = sp + (msrp - sp) * convergence * 0.35;

    const t = (w + HIST_PAST_WEEKS) / (HIST_PAST_WEEKS + HIST_FWD_WEEKS);
    const costPrice = row.price * 0.42 * (1 + t * 0.006);
    const auc = costPrice * (1 + t * 0.020);

    const startInv = row.wos * row.ros;
    const drawdown = offsets.filter((x) => x <= w).length / offsets.length;
    const invUnits = Math.max(
      0,
      Math.round(
        startInv * (1 - drawdown * 0.55) -
          (isForecast ? liftUnits * 0.4 * (w / HIST_FWD_WEEKS) : 0)
      )
    );

    return {
      week: w,
      isForecast,
      baselineUnits,
      liftUnits,
      totalUnits,
      invUnits,
      msrp,
      sp,
      sellingPrice,
      auc,
      costPrice,
      discountPct,
      plannedDiscountPct: planned,
    };
  });
}

// Aggregate history across multiple rows
export function aggregateHistory(
  rows: EnrichedRow[],
  key: 'fin' | 'ia' = 'fin'
): HistoryPoint[] {
  const offsets: number[] = [];
  for (let w = -HIST_PAST_WEEKS; w <= HIST_FWD_WEEKS; w++) offsets.push(w);

  const seriesMap: Record<string, HistoryPoint[]> = {};
  rows.forEach((row) => {
    seriesMap[row.id] = buildHistorySeries(row, key);
  });

  return offsets.map((w, i) => {
    let baselineUnits = 0;
    let liftUnits = 0;
    let invUnits = 0;
    let msrpW = 0;
    let spW = 0;
    let sellW = 0;
    let aucW = 0;
    let cpW = 0;
    let discW = 0;
    let planW = 0;
    let weight = 0;
    let stockW = 0;

    rows.forEach((row) => {
      const pt = seriesMap[row.id][i];
      baselineUnits += pt.baselineUnits;
      liftUnits += pt.liftUnits;
      invUnits += pt.invUnits;

      const wt = pt.totalUnits || 1;
      const stk = row.finData.bopUnits || 1;

      spW += pt.sp * wt;
      sellW += pt.sellingPrice * wt;
      discW += pt.discountPct * wt;
      planW += pt.plannedDiscountPct * wt;
      msrpW += pt.msrp * stk;
      aucW += pt.auc * stk;
      cpW += (pt.costPrice || pt.auc) * stk;
      weight += wt;
      stockW += stk;
    });

    const wAvg = (acc: number) => (weight ? acc / weight : 0);
    const sAvg = (acc: number) => (stockW ? acc / stockW : 0);

    return {
      week: w,
      isForecast: w > 0,
      baselineUnits,
      liftUnits,
      totalUnits: baselineUnits + liftUnits,
      invUnits,
      msrp: sAvg(msrpW),
      sp: wAvg(spW),
      sellingPrice: wAvg(sellW),
      auc: sAvg(aucW),
      costPrice: sAvg(cpW),
      discountPct: wAvg(discW),
      plannedDiscountPct: wAvg(planW),
    };
  });
}

// Format helpers
export function formatMoney(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1000000) return '$' + (v / 1000000).toFixed(2) + 'M';
  if (abs >= 1000) return '$' + (v / 1000).toFixed(1) + 'K';
  return '$' + Math.round(v).toLocaleString();
}

export function formatUnits(v: number): string {
  return Math.round(v).toLocaleString();
}

export function formatPercent(v: number): string {
  return v.toFixed(1) + '%';
}
