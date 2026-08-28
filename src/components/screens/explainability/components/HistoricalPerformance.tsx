import { useCallback, useMemo, useState } from 'react';
import { Button, Badge, Menu } from 'impact-ui';
import type { MenuOption } from 'impact-ui';
import TuneIcon from '@mui/icons-material/Tune';
import VerifiedIcon from '@mui/icons-material/Verified';
import HistoryIcon from '@mui/icons-material/History';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import { ImpactSelect } from '../../../common/ImpactSelect';
import { useExplainabilityStore } from '../../../../store/useExplainabilityStore';
import { aggregateHistory, bucketSeries, formatUnits, STRATEGY_WEEKS, PCD_WEEKS } from '../../../../services/dataProcessor';
import {
  TIMELINE_OPTIONS,
  RIGHT_AXIS_OPTIONS,
  BENCHMARK_OPTIONS,
} from '../constants';
import type { EnrichedRow, BenchmarkLineKey, TimelineGranularity } from '../../../../types';

interface HistoricalPerformanceProps {
  enrichedRows: EnrichedRow[];
  onOpenFilters: () => void;
}

/** HTML prototype RIGHT_BENCHMARK_META colours + dash */
const BENCH_META: Record<
  string,
  { color: string; dash?: string; width: number; fullLabel: string }
> = {
  basePrice: {
    color: '#64748B',
    dash: '5 4',
    width: 1.75,
    fullLabel: 'Base price — regular ticket',
  },
  sp: {
    color: '#E08528',
    dash: '9 4',
    width: 2.25,
    fullLabel: 'SP — planned selling price',
  },
  aur: {
    color: '#4259EE',
    width: 2.75,
    fullLabel: 'AUR — Avg. Unit Retail (realized)',
  },
  aum: {
    color: '#3BB273',
    width: 2.25,
    fullLabel: 'AUM — Avg. Unit Margin (realized)',
  },
  auc: {
    color: '#0E8F8C',
    width: 2.25,
    fullLabel: 'AUC — Avg. Unit Cost (blended)',
  },
  costPrice: {
    color: '#E1BC29',
    dash: '7 4',
    width: 2,
    fullLabel: 'Cost price — vendor invoice cost',
  },
  weightedAvg: {
    color: '#7C4DD1',
    width: 2.25,
    fullLabel: 'Weighted Avg. Discount %',
  },
};

const C = {
  areaBase: '#E4E9F2',
  areaLift: '#D9D2F5',
  inventory: '#8D6E63',
  finPath: '#0F172A',
  iaPath: '#E74C67',
  pcdFill: '#ECEEFD',
  pcdLine: '#8C9AF4',
  pcdLabel: '#3A4CCB',
  grid: '#E5E7EB',
  axis: '#D9DDE7',
  tick: '#758490',
};

function LegendStroke({
  color,
  dash,
  width = 2,
}: {
  color: string;
  dash?: string;
  width?: number;
}) {
  return (
    <svg width="22" height="10" style={{ verticalAlign: 'middle', flex: '0 0 auto' }} aria-hidden>
      <line
        x1="1"
        y1="5"
        x2="21"
        y2="5"
        stroke={color}
        strokeWidth={width}
        strokeDasharray={dash}
        strokeLinecap="round"
      />
    </svg>
  );
}

function LiftHatchDefs() {
  return (
    <defs>
      <pattern
        id="liftHatch"
        width="6"
        height="6"
        patternTransform="rotate(45)"
        patternUnits="userSpaceOnUse"
      >
        <rect width="6" height="6" fill="#D9D2F5" />
        <line x1="0" y1="0" x2="0" y2="6" stroke="#7C4DD1" strokeWidth="1.2" />
      </pattern>
    </defs>
  );
}

function elasticityBand(score: number): 'low' | 'medium' | 'high' {
  if (score >= 1.5) return 'high';
  if (score >= 0.6) return 'medium';
  return 'low';
}

function confidenceBand(score: number): 'low' | 'medium' | 'high' {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function bandBadgeColor(band: 'low' | 'medium' | 'high'): 'error' | 'warning' | 'success' {
  if (band === 'high') return 'success';
  if (band === 'medium') return 'warning';
  return 'error';
}

export function HistoricalPerformance({
  enrichedRows,
  onOpenFilters,
}: HistoricalPerformanceProps) {
  const {
    histTimeline,
    setHistTimeline,
    histRightCategory,
    setHistRightCategory,
    histRightLines,
    toggleHistRightLine,
    histShowLy,
    toggleHistShowLy,
    histRefFin,
    toggleHistRefFin,
    histRefIA,
    toggleHistRefIA,
    selectedIds,
  } = useExplainabilityStore();

  const [benchAnchor, setBenchAnchor] = useState<HTMLElement | null>(null);

  const displayRows = useMemo(() => {
    if (selectedIds.size === 0) return enrichedRows;
    return enrichedRows.filter((r) =>
      Array.from(selectedIds).some(
        (id) => id.includes(r.style) || id.includes(r.name) || id.includes(r.id)
      )
    );
  }, [enrichedRows, selectedIds]);

  const { avgElasticity, eBand, cBand } = useMemo(() => {
    if (!displayRows.length) {
      return {
        avgElasticity: 0,
        eBand: 'medium' as const,
        cBand: 'medium' as const,
      };
    }
    const avgE =
      displayRows.reduce((a, r) => a + r.elasticity, 0) / displayRows.length;
    const avgC =
      displayRows.reduce((a, r) => a + r.confidence, 0) / displayRows.length;
    return {
      avgElasticity: avgE,
      eBand: elasticityBand(avgE),
      cBand: confidenceBand(avgC),
    };
  }, [displayRows]);

  const finHistory = useMemo(() => {
    if (!displayRows.length) return [];
    return aggregateHistory(displayRows, 'fin');
  }, [displayRows]);

  const iaHistory = useMemo(() => {
    if (!displayRows.length) return [];
    return aggregateHistory(displayRows, 'ia');
  }, [displayRows]);

  const finDisplay = useMemo(
    () => bucketSeries(finHistory, histTimeline),
    [finHistory, histTimeline]
  );

  const iaDisplay = useMemo(
    () => bucketSeries(iaHistory, histTimeline),
    [iaHistory, histTimeline]
  );

  const chartData = useMemo(() => {
    if (!finDisplay.length) return [];
    return finDisplay.map((pt, idx) => {
      const ia = iaDisplay[idx];
      return {
        ...pt,
        aum: pt.sellingPrice - pt.auc,
        weekLabel: pt.label ?? `Week ${idx + 1}`,
        // Forecast paths only from strategy start (week >= 0) — matches HTML
        finPath: pt.week >= 0 ? pt.totalUnits : null,
        iaPath: pt.week >= 0 && ia ? ia.totalUnits : null,
        lyBaseline: pt.baselineUnits * 0.88,
        lyLift: pt.liftUnits * 0.88,
        lyTotal: pt.totalUnits * 0.88,
        lyInv: pt.invUnits * 0.92,
        lyMsrp: pt.msrp,
        lyAur: pt.sellingPrice * 0.97,
        lySp: pt.sp * 0.97,
      };
    });
  }, [finDisplay, iaDisplay]);

  const strategyLabels = useMemo(() => {
    const idxOfWeek = (w: number) => chartData.findIndex((d) => d.week >= w);
    const startIdx = idxOfWeek(0);
    const endIdx = idxOfWeek(STRATEGY_WEEKS);
    const start = startIdx >= 0 ? chartData[startIdx]?.weekLabel : undefined;
    const end =
      endIdx >= 0
        ? chartData[endIdx]?.weekLabel
        : chartData[chartData.length - 1]?.weekLabel;
    const pcd = [0, 1, 2].map((k) => {
      const aIdx = idxOfWeek(k * PCD_WEEKS);
      const bIdx = idxOfWeek((k + 1) * PCD_WEEKS);
      return {
        start: aIdx >= 0 ? chartData[aIdx]?.weekLabel : undefined,
        end: bIdx >= 0 ? chartData[bIdx]?.weekLabel : undefined,
        label: `PCD${k + 1}`,
        k,
      };
    });
    return { start, end, pcd };
  }, [chartData]);

  const timelineAxisLabel = useMemo(() => {
    const meta: Record<
      TimelineGranularity,
      { x: string; xLy: string; y: string }
    > = {
      weekly: {
        x: 'Weeks from strategy start (10/02/2026)',
        xLy: 'Last year — same weeks (calendar-aligned)',
        y: 'Units / week',
      },
      monthly: {
        x: 'Months from strategy start (4-wk · 10/02/2026)',
        xLy: 'Last year — same months (calendar-aligned)',
        y: 'Units / week (avg)',
      },
      quarterly: {
        x: 'Quarters from strategy start (13-wk · 10/02/2026)',
        xLy: 'Last year — same quarters (calendar-aligned)',
        y: 'Units / week (avg)',
      },
    };
    return meta[histTimeline];
  }, [histTimeline]);

  const categoryBenchmarks = useMemo(
    () => BENCHMARK_OPTIONS.filter((opt) => opt.group === histRightCategory),
    [histRightCategory]
  );

  const activeBenchmarkLines = useMemo(
    () =>
      categoryBenchmarks.filter(
        (opt) => histRightLines[opt.key as keyof typeof histRightLines]
      ),
    [categoryBenchmarks, histRightLines]
  );

  const handleTimelineChange = useCallback(
    (value: string) =>
      setHistTimeline(value as 'weekly' | 'monthly' | 'quarterly'),
    [setHistTimeline]
  );

  const handleRightAxisChange = useCallback(
    (value: string) =>
      setHistRightCategory(value as 'price' | 'cost' | 'discount'),
    [setHistRightCategory]
  );

  const checkedBenchCount = activeBenchmarkLines.length;
  const benchBtnLabel =
    checkedBenchCount === 0
      ? 'None selected'
      : checkedBenchCount === categoryBenchmarks.length
        ? 'All selected'
        : `${checkedBenchCount} selected`;

  const rightAxisLabel =
    RIGHT_AXIS_OPTIONS.find((o) => o.value === histRightCategory)?.label ??
    'Price $';

  const benchSelectedItems = useMemo(() => {
    const items: string[] = [];
    if (histRefFin) items.push('__fin');
    if (histRefIA) items.push('__ia');
    categoryBenchmarks.forEach((opt) => {
      if (histRightLines[opt.key as BenchmarkLineKey]) items.push(opt.key);
    });
    return items;
  }, [histRefFin, histRefIA, categoryBenchmarks, histRightLines]);

  const benchMenuOptions: MenuOption[] = useMemo(
    () => [
      { label: 'Projection', section: 'Projection' },
      { label: 'Finalized path', value: '__fin' },
      { label: 'IA Recommended path', value: '__ia' },
      { label: rightAxisLabel, section: rightAxisLabel },
      ...categoryBenchmarks.map((opt) => ({
        label: opt.label,
        value: opt.key,
      })),
    ],
    [categoryBenchmarks, rightAxisLabel]
  );

  const handleBenchSelectionChange = useCallback(
    (items: string[]) => {
      const wantFin = items.includes('__fin');
      const wantIA = items.includes('__ia');
      if (wantFin !== histRefFin) toggleHistRefFin();
      if (wantIA !== histRefIA) toggleHistRefIA();
      categoryBenchmarks.forEach((opt) => {
        const key = opt.key as BenchmarkLineKey;
        const want = items.includes(opt.key);
        const have = !!histRightLines[key];
        if (want !== have) toggleHistRightLine(key);
      });
    },
    [
      categoryBenchmarks,
      histRefFin,
      histRefIA,
      histRightLines,
      toggleHistRefFin,
      toggleHistRefIA,
      toggleHistRightLine,
    ]
  );

  const chartTitle =
    histRightCategory === 'price'
      ? 'Historical Performance — Units vs. Price $'
      : histRightCategory === 'cost'
        ? 'Historical Performance — Units vs. Cost $'
        : 'Historical Performance — Units vs. Discount %';

  const rightTickFmt = (v: number) =>
    histRightCategory === 'discount' ? `${v.toFixed(0)}%` : `$${v.toFixed(0)}`;

  const dataKeyForBench = (key: string) => {
    switch (key) {
      case 'basePrice':
        return 'msrp';
      case 'sp':
        return 'sp';
      case 'aur':
        return 'sellingPrice';
      case 'aum':
        return 'aum';
      case 'auc':
        return 'auc';
      case 'costPrice':
        return 'costPrice';
      case 'weightedAvg':
        return 'discountPct';
      default:
        return key;
    }
  };

  const renderMainChart = (isLy: boolean) => {
    const data = isLy
      ? chartData.map((d) => ({
          ...d,
          baselineUnits: d.lyBaseline,
          liftUnits: d.lyLift,
          totalUnits: d.lyTotal,
          invUnits: d.lyInv,
          msrp: d.lyMsrp,
          sellingPrice: d.lyAur,
          sp: d.lySp,
          aum: d.lyAur - d.auc,
        }))
      : chartData;

    return (
      <div
        className="chart-wrap hist-chart-wrap"
        style={{ height: isLy ? 280 : 360 }}
      >
        <div className="hist-plot-overlay" aria-hidden>
          <span className="axis-label-x">
            {isLy ? timelineAxisLabel.xLy : timelineAxisLabel.x}
          </span>
          <span className="axis-label-y axis-label-y--left">
            {isLy ? `LY ${timelineAxisLabel.y}` : timelineAxisLabel.y}
          </span>
          <span className="axis-label-y axis-label-y--right">
            {isLy ? `LY ${rightAxisLabel}` : rightAxisLabel}
          </span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 22, right: 56, bottom: 36, left: 48 }}
          >
            <LiftHatchDefs />
            <CartesianGrid
              stroke={C.grid}
              strokeDasharray="0"
              vertical={false}
            />

            {/* Strategy window + PCD bands (main chart only — HTML skips on LY) */}
            {!isLy && strategyLabels.start && strategyLabels.end && (
              <ReferenceArea
                yAxisId="left"
                x1={strategyLabels.start}
                x2={strategyLabels.end}
                fill={C.pcdFill}
                fillOpacity={0.75}
                strokeOpacity={0}
              />
            )}
            {!isLy &&
              strategyLabels.pcd.map((p) =>
                p.start && p.end ? (
                  <ReferenceLine
                    key={p.label}
                    yAxisId="left"
                    x={p.start}
                    stroke={C.pcdLine}
                    strokeDasharray="3 3"
                    strokeWidth={p.k === 0 ? 0 : 1}
                    label={
                      p.k < 3
                        ? {
                            value: p.label,
                            position: 'insideTop',
                            fill: C.pcdLabel,
                            fontSize: 10,
                            fontWeight: 700,
                          }
                        : undefined
                    }
                  />
                ) : null
              )}

            <XAxis
              dataKey="weekLabel"
              tick={{ fontSize: 10, fill: C.tick }}
              tickLine={false}
              axisLine={{ stroke: C.axis }}
              height={32}
              interval="preserveStartEnd"
              minTickGap={28}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 10, fill: C.tick }}
              tickLine={false}
              axisLine={{ stroke: C.axis }}
              width={48}
              tickFormatter={(v) => Math.round(v).toLocaleString()}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10, fill: C.tick }}
              tickLine={false}
              axisLine={{ stroke: C.axis }}
              width={52}
              tickFormatter={rightTickFmt}
            />

            <Tooltip
              content={({ payload, label }) => {
                if (!payload?.length) return null;
                return (
                  <div className="chart-tooltip">
                    <div className="chart-tooltip__title">{label}</div>
                    {payload[0]?.payload?.offsetLabel ? (
                      <div className="chart-tooltip__sub">
                        {payload[0].payload.offsetLabel}
                      </div>
                    ) : null}
                    {payload
                      .filter(
                        (e) =>
                          e.value != null &&
                          e.dataKey !== 'finPath' &&
                          e.dataKey !== 'iaPath'
                      )
                      .concat(
                        payload.filter(
                          (e) =>
                            (e.dataKey === 'finPath' || e.dataKey === 'iaPath') &&
                            e.value != null
                        )
                      )
                      .map((entry) => (
                        <div
                          key={String(entry.dataKey)}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 12,
                          }}
                        >
                          <span style={{ color: entry.color }}>{entry.name}</span>
                          <span style={{ fontWeight: 600 }}>
                            {typeof entry.value === 'number'
                              ? entry.dataKey === 'discountPct'
                                ? `${entry.value.toFixed(0)}%`
                                : entry.dataKey === 'msrp' ||
                                    entry.dataKey === 'sp' ||
                                    entry.dataKey === 'sellingPrice' ||
                                    entry.dataKey === 'aum' ||
                                    entry.dataKey === 'auc' ||
                                    entry.dataKey === 'costPrice'
                                  ? `$${entry.value.toFixed(0)}`
                                  : formatUnits(entry.value)
                              : String(entry.value ?? '')}
                          </span>
                        </div>
                      ))}
                  </div>
                );
              }}
            />

            {/* Stacked units areas — baseline + markdown lift (HTML style) */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="baselineUnits"
              stackId="units"
              fill={C.areaBase}
              stroke="none"
              fillOpacity={0.95}
              name="Baseline units / week"
              isAnimationActive={false}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="liftUnits"
              stackId="units"
              fill="url(#liftHatch)"
              stroke="none"
              fillOpacity={0.9}
              name="Markdown lift units"
              isAnimationActive={false}
            />

            {/* Inventory — warm brown dotted (never reads as a price line) */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="invUnits"
              stroke={C.inventory}
              strokeWidth={2}
              strokeDasharray="2 5"
              dot={false}
              name="Inventory on hand"
              isAnimationActive={false}
            />

            {/* Finalized / IA forecast paths from week 0 (main chart only) */}
            {!isLy && histRefFin && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="finPath"
                stroke={C.finPath}
                strokeWidth={2.75}
                connectNulls={false}
                dot={{ r: 3, fill: C.finPath, strokeWidth: 0 }}
                name="Finalized — forecast path"
                isAnimationActive={false}
              />
            )}
            {!isLy && histRefIA && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="iaPath"
                stroke={C.iaPath}
                strokeWidth={2.75}
                strokeDasharray="8 4"
                connectNulls={false}
                dot={{ r: 0 }}
                activeDot={{ r: 4 }}
                name="IA Recommended — forecast path"
                isAnimationActive={false}
              />
            )}

            {/* Right-axis benchmarks — distinct hue + dash per series */}
            {activeBenchmarkLines.map((opt) => {
              const meta = BENCH_META[opt.key];
              if (!meta) return null;
              return (
                <Line
                  key={opt.key}
                  yAxisId="right"
                  type="monotone"
                  dataKey={dataKeyForBench(opt.key)}
                  stroke={meta.color}
                  strokeWidth={meta.width}
                  strokeDasharray={meta.dash}
                  dot={{ r: 2.5, fill: meta.color, strokeWidth: 0 }}
                  name={meta.fullLabel}
                  isAnimationActive={false}
                />
              );
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderLegend = (isLy: boolean) => {
    const pre = isLy ? 'LY ' : '';
    return (
      <div className="hist-legend">
        <div className="item">
          <span className="swatch area" style={{ background: C.areaBase }} />
          {pre}baseline units / week
        </div>
        <div className="item">
          <span
            className="swatch area"
            style={{
              background: C.areaLift,
              backgroundImage:
                'repeating-linear-gradient(45deg,#7C4DD1 0 1.2px,transparent 1.2px 6px)',
            }}
          />
          {pre}markdown lift units
        </div>
        <div className="item">
          <LegendStroke color={C.inventory} dash="2 5" width={2} />
          {pre}inventory on hand
        </div>
        {activeBenchmarkLines.map((opt) => {
          const meta = BENCH_META[opt.key];
          if (!meta) return null;
          return (
            <div className="item" key={opt.key}>
              <LegendStroke
                color={meta.color}
                dash={meta.dash}
                width={meta.width}
              />
              {pre}
              {meta.fullLabel}
            </div>
          );
        })}
        {!isLy && histRefFin && (
          <div className="item">
            <LegendStroke color={C.finPath} width={2.75} />
            Finalized — forecast path
          </div>
        )}
        {!isLy && histRefIA && (
          <div className="item">
            <LegendStroke color={C.iaPath} dash="8 4" width={2.75} />
            IA Recommended — forecast path
          </div>
        )}
        {!isLy && (
          <div className="item">
            <LegendStroke color={C.pcdLine} dash="3 3" width={1.25} />
            PCD1 / PCD2 / PCD3 boundaries (shaded band = strategy window)
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="panel" data-testid="historical-performance">
      {/* Row 1 — title alone (HTML twelfth pass) */}
      <div className="chart-toolbar" style={{ paddingRight: 12, paddingBottom: 0 }}>
        <HistoryIcon style={{ color: 'var(--c-primary-500)', fontSize: 18 }} />
        <span
          className="h5"
          style={{ fontWeight: 600, fontSize: 15, color: 'var(--c-ink-800)' }}
        >
          Historical Performance &amp; Model Confidence
        </span>
      </div>

      {/* Row 2 — pills left, LY center, controls right */}
      <div className="hist-pill-row">
        <Badge
          label={`Confidence: ${cap(cBand)}`}
          color={bandBadgeColor(cBand)}
          variant="subtle"
          size="small"
        />
        <Badge
          label={`Elasticity: ${avgElasticity.toFixed(1)}x · ${cap(eBand)}`}
          color={bandBadgeColor(eBand)}
          variant="subtle"
          size="small"
        />

        <div className="spacer" />

        <Button
          variant={histShowLy ? 'primary' : 'secondary'}
          size="large"
          icon={<HistoryIcon style={{ fontSize: 14 }} />}
          aria-pressed={histShowLy}
          onClick={toggleHistShowLy}
          data-testid="ly-toggle-btn"
        >
          LY — Last Year
        </Button>

        <div className="spacer" />

        <div className="control">
          <span className="ia-control-label">Benchmarks</span>
          <Button
            variant="secondary"
            size="large"
            icon={<KeyboardArrowDownIcon style={{ fontSize: 16 }} />}
            iconPlacement="right"
            onClick={(e) =>
              setBenchAnchor(benchAnchor ? null : e.currentTarget)
            }
            data-testid="benchmarks-btn"
            aria-label="Benchmarks"
          >
            {benchBtnLabel}
          </Button>
          <Menu
            open={Boolean(benchAnchor)}
            anchorEl={benchAnchor}
            onClose={() => setBenchAnchor(null)}
            withCheckbox
            options={benchMenuOptions}
            customHeaderProps={{
              selectedItems: benchSelectedItems,
              onSelectionChange: handleBenchSelectionChange,
            }}
            MenuProps={{
              anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
              transformOrigin: { vertical: 'top', horizontal: 'right' },
            }}
          />
        </div>

        <ImpactSelect
          label="Timeline"
          options={TIMELINE_OPTIONS}
          value={histTimeline}
          onChange={handleTimelineChange}
          minWidth={150}
          data-testid="hist-timeline"
        />

        <ImpactSelect
          label="Right axis"
          options={RIGHT_AXIS_OPTIONS}
          value={histRightCategory}
          onChange={handleRightAxisChange}
          minWidth={140}
          data-testid="hist-right-axis"
        />

        <Button
          variant="secondary"
          size="large"
          icon={<TuneIcon style={{ fontSize: 16 }} />}
          aria-label="Filters"
          onClick={onOpenFilters}
          data-testid="hist-filters-btn"
          className={selectedIds.size > 0 ? 'has-filter-dot' : undefined}
        />
      </div>

      <div className="hist-chart-title">
        <span className="ia-label">{chartTitle}</span>
      </div>

      {renderMainChart(false)}
      {renderLegend(false)}

      <div className="validation-note">
        <VerifiedIcon style={{ fontSize: 14 }} />
        <span>
          Most recent promotion history for this scope is consistent with its{' '}
          {eBand} elasticity band ({avgElasticity.toFixed(1)}x). Use this to
          sanity-check the sell-through projection above rather than take the
          model&apos;s word for it.
        </span>
      </div>

      {histShowLy && (
        <>
          <div className="hist-chart-title" style={{ marginTop: 18 }}>
            <span className="ia-label">
              Last year — same weeks, calendar-aligned
            </span>
          </div>
          {renderMainChart(true)}
          {renderLegend(true)}
        </>
      )}
    </div>
  );
}
