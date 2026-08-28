import { useCallback, useMemo } from 'react';
import { Button, ButtonGroup } from 'impact-ui';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { ImpactSelect } from '../../../common/ImpactSelect';
import { useExplainabilityStore } from '../../../../store/useExplainabilityStore';
import { getMetricValue, discColor, avgDiscount } from '../../../../services/dataProcessor';
import { METRIC_OPTIONS, METRIC_FMT } from '../constants';
import type { HierarchyRow, Perspective, MetricKey } from '../../../../types';

interface ScatterAnalysisProps {
  hierarchyRows: HierarchyRow[];
}

interface ChartCellProps {
  chartNum: '1' | '2';
  data: HierarchyRow[];
  onSelectRow: (key: string) => void;
  selectedIds: Set<string>;
}

function ScatterChartCell({
  chartNum,
  data,
  onSelectRow,
  selectedIds,
}: ChartCellProps) {
  const store = useExplainabilityStore();

  const isChart1 = chartNum === '1';
  const currentX = isChart1 ? store.chart1X : store.chart2X;
  const currentY = isChart1 ? store.chart1Y : store.chart2Y;
  const currentPerspective = isChart1 ? store.perspective1 : store.perspective2;

  const xOptions = useMemo(
    () => METRIC_OPTIONS.filter((opt) => opt.value !== currentY),
    [currentY]
  );
  const yOptions = useMemo(
    () => METRIC_OPTIONS.filter((opt) => opt.value !== currentX),
    [currentX]
  );

  const xLabel = METRIC_OPTIONS.find((m) => m.value === currentX)?.label ?? 'X';
  const yLabel = METRIC_OPTIONS.find((m) => m.value === currentY)?.label ?? 'Y';
  const fmtX = METRIC_FMT[currentX] ?? ((v: number) => String(v));
  const fmtY = METRIC_FMT[currentY] ?? ((v: number) => String(v));

  const chartData = useMemo(
    () =>
      data.map((row) => ({
        ...row,
        x: getMetricValue(row, currentX, currentPerspective),
        y: getMetricValue(row, currentY, currentPerspective),
        color: discColor(
          avgDiscount(
            currentPerspective === 'finalised' ? row.finDiscounts : row.iaDiscounts
          )
        ),
      })),
    [data, currentX, currentY, currentPerspective]
  );

  // Domain + midpoint for 4-quadrant labels (matches HTML GRID=2)
  const { xDomain, yDomain, xMid, yMid } = useMemo(() => {
    if (!chartData.length) {
      return {
        xDomain: [0, 1] as [number, number],
        yDomain: [0, 1] as [number, number],
        xMid: 0.5,
        yMid: 0.5,
      };
    }
    const xs = chartData.map((d) => d.x);
    const ys = chartData.map((d) => d.y);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);
    const xPad = (xMax - xMin) * 0.12 || 1;
    const yPad = (yMax - yMin) * 0.12 || 1;
    const x0 = xMin - xPad;
    const x1 = xMax + xPad;
    const y0 = yMin - yPad;
    const y1 = yMax + yPad;
    return {
      xDomain: [x0, x1] as [number, number],
      yDomain: [y0, y1] as [number, number],
      xMid: (x0 + x1) / 2,
      yMid: (y0 + y1) / 2,
    };
  }, [chartData]);

  const handleXChange = useCallback(
    (value: string) => store.setChartAxis(chartNum, 'x', value as MetricKey),
    [chartNum, store]
  );
  const handleYChange = useCallback(
    (value: string) => store.setChartAxis(chartNum, 'y', value as MetricKey),
    [chartNum, store]
  );

  return (
    <div className="scatter-cell" data-testid={`scatter-cell-${chartNum}`}>
      <div className="chart-toolbar">
        <ImpactSelect
          label="X axis"
          options={xOptions}
          value={currentX}
          onChange={handleXChange}
          minWidth={220}
          data-testid={`scatter-${chartNum}-x`}
        />
        <ImpactSelect
          label="Y axis"
          options={yOptions}
          value={currentY}
          onChange={handleYChange}
          minWidth={220}
          data-testid={`scatter-${chartNum}-y`}
        />
        <div className="spacer" />
        <ButtonGroup
          options={[
            { label: 'Finalized', value: 'finalised' },
            { label: 'IA Rec.', value: 'ia' },
          ]}
          selectedOption={currentPerspective}
          onChange={(_e, value) => {
            if (value === 'finalised' || value === 'ia') {
              store.setPerspective(chartNum, value as Perspective);
            }
          }}
        />
      </div>

      <div className="chart-wrap scatter-chart-wrap" style={{ height: 320 }}>
        {/* Axis + quadrant labels as HTML overlays (same as HTML prototype SVG text).
            Recharts 3 often drops <Label> children on XAxis/YAxis, so we render them here.
            Labels update whenever X/Y selects change via xLabel/yLabel. */}
        <div className="scatter-plot-overlay" aria-hidden>
          <span className="q-tl">LOW / HIGH</span>
          <span className="q-tr">HIGH / HIGH</span>
          <span className="q-bl">LOW / LOW</span>
          <span className="q-br">HIGH / LOW</span>
          <span className="axis-label-x">{xLabel}</span>
          <span className="axis-label-y">{yLabel}</span>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 14, right: 16, bottom: 40, left: 56 }}
            key={`${currentX}-${currentY}-${currentPerspective}`}
          >
            <CartesianGrid stroke="#E5E7EB" strokeDasharray="0" horizontal={false} vertical={false} />
            {/* 4-quadrant midlines (HTML GRID=2) */}
            <ReferenceLine x={xMid} stroke="#E5E7EB" strokeWidth={1} />
            <ReferenceLine y={yMid} stroke="#E5E7EB" strokeWidth={1} />
            <XAxis
              dataKey="x"
              type="number"
              name={xLabel}
              domain={xDomain}
              tickCount={3}
              tickFormatter={fmtX}
              tick={{ fontSize: 10, fill: '#758490' }}
              tickLine={false}
              axisLine={{ stroke: '#D9DDE7' }}
              height={36}
            />
            <YAxis
              dataKey="y"
              type="number"
              name={yLabel}
              domain={yDomain}
              tickCount={3}
              tickFormatter={fmtY}
              tick={{ fontSize: 10, fill: '#758490' }}
              tickLine={false}
              axisLine={{ stroke: '#D9DDE7' }}
              width={56}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ payload }) => {
                if (!payload?.length) return null;
                const row = payload[0].payload as HierarchyRow & {
                  x: number;
                  y: number;
                };
                return (
                  <div className="chart-tooltip">
                    <div className="chart-tooltip__title">{row.productLabel}</div>
                    <div className="chart-tooltip__sub">{row.productSub}</div>
                    <div>
                      <strong>{xLabel}:</strong> {fmtX(row.x)}
                    </div>
                    <div>
                      <strong>{yLabel}:</strong> {fmtY(row.y)}
                    </div>
                    <div>
                      <strong>Discount:</strong>{' '}
                      {(currentPerspective === 'finalised'
                        ? row.finDiscounts
                        : row.iaDiscounts
                      ).join(' → ')}
                      %
                    </div>
                  </div>
                );
              }}
            />
            <Scatter name="Products" data={chartData}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.key}
                  fill={entry.color}
                  stroke={selectedIds.has(entry.key) ? '#0D152C' : '#fff'}
                  strokeWidth={selectedIds.has(entry.key) ? 2.5 : 1}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectRow(entry.key)}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ScatterAnalysis({ hierarchyRows }: ScatterAnalysisProps) {
  const { selectedIds, toggleSelection, clearSelection } = useExplainabilityStore();

  return (
    <div className="panel">
      <div className="chart-toolbar">
        <ScatterPlotIcon style={{ color: 'var(--c-primary-500)', fontSize: 18 }} />
        <span
          className="h5"
          style={{ fontWeight: 600, fontSize: 15, color: 'var(--c-ink-800)' }}
        >
          Markdown Scatter Analysis
        </span>
      </div>

      <div className="scatter-grid">
        <ScatterChartCell
          chartNum="1"
          data={hierarchyRows}
          onSelectRow={toggleSelection}
          selectedIds={selectedIds}
        />
        <ScatterChartCell
          chartNum="2"
          data={hierarchyRows}
          onSelectRow={toggleSelection}
          selectedIds={selectedIds}
        />
      </div>

      {selectedIds.size > 0 && (
        <div className="chart-toolbar" style={{ paddingTop: 0 }}>
          <span className="selection-note">
            {selectedIds.size} selected — click a point to toggle, or
          </span>
          <Button variant="text" size="small" onClick={clearSelection}>
            clear all
          </Button>
        </div>
      )}

      <div className="gradient-legend">
        <div className="gradient-bar" />
        <div className="gradient-seg-row">
          <div className="gradient-seg" style={{ width: '33%' }}>
            <span className="lbl">Low</span>
            <span className="rng">&lt; 20%</span>
          </div>
          <div className="gradient-seg" style={{ width: '34%' }}>
            <span className="lbl">Medium</span>
            <span className="rng">20% – 50%</span>
          </div>
          <div className="gradient-seg" style={{ width: '33%' }}>
            <span className="lbl">High</span>
            <span className="rng">50%+</span>
          </div>
        </div>
      </div>
    </div>
  );
}
