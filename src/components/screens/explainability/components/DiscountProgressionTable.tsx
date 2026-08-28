import { useMemo, useState, useCallback, type ComponentType } from 'react';
import {
  TableV36 as Table,
  Button,
  ButtonGroup,
  Badge,
  Menu,
  MenuHeaderInfo,
  Tooltip,
} from 'impact-ui';
import type { MenuOption } from 'impact-ui';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import LayersIcon from '@mui/icons-material/Layers';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useExplainabilityStore } from '../../../../store/useExplainabilityStore';
import { formatUnits, formatMoney } from '../../../../services/dataProcessor';
import type {
  HierarchyRow,
  ProgressionRow,
  ProgUniverseItem,
} from '../../../../types';

interface DiscountProgressionTableProps {
  hierarchyRows: HierarchyRow[];
  progressionRows: ProgressionRow[];
  progUniverse: ProgUniverseItem[];
  onOpenLevelFilters: () => void;
}

type Band = 'low' | 'medium' | 'high';
type BadgeColor = 'info' | 'error' | 'warning' | 'success';

/** Impact UI TableV36 types are incomplete in the package; cast to accept documented props. */
type ImpactTableProps = {
  tableHeader?: string;
  gridId?: string;
  rowHeight?: 'comfort' | 'compact' | number;
  height?: string | number;
  columnDefs?: unknown[];
  rowData?: unknown[];
  topLeftOptions?: React.ReactNode;
  topRightOptions?: React.ReactNode;
  hideTableSetting?: boolean;
  hidePaginationPageSizeSelector?: boolean;
  emptyStateText?: string;
  getRowId?: (params: { data: { key: string } }) => string;
  onRowClicked?: (event: { data?: HierarchyRow | ProgressionRow }) => void;
  getRowClass?: (params: { data?: { key: string; progKey?: string } }) => string;
  defaultColDef?: Record<string, unknown>;
  suppressPaginationPanel?: boolean;
  onSortChanged?: (event: unknown) => void;
  cardContainer?: boolean;
};

const ImpactTable = Table as ComponentType<ImpactTableProps>;

const PRODUCT_LEVEL_LABELS: Record<string, string> = {
  brand: 'Brand',
  division: 'Division',
  department: 'Department',
  class: 'Class',
  subclass: 'Sub Class',
  style: 'Style',
  programRetail: 'Program Retail',
  programOnline: 'Program Online',
  customerChoice: 'Customer Choice',
};

const STORE_LEVEL_LABELS: Record<string, string> = {
  all: 'All Stores',
  channel: 'Enterprise Channel',
  store: 'Store',
};

const BAND_META: Record<Band, { label: string; range: string }> = {
  low: { label: 'Low discount', range: '< 20%' },
  medium: { label: 'Medium discount', range: '20% – 50%' },
  high: { label: 'High discount', range: '50%+' },
};

const ELASTICITY_META: Record<Band, { label: string; range: string }> = {
  low: { label: 'Low elasticity', range: '< 0.6x' },
  medium: { label: 'Medium elasticity', range: '0.6x – 1.5x' },
  high: { label: 'High elasticity', range: '≥ 1.5x' },
};

function bandColor(band: Band): BadgeColor {
  if (band === 'high') return 'success';
  if (band === 'medium') return 'warning';
  return 'error';
}

function getRowField(row: HierarchyRow | ProgressionRow, col: string): unknown {
  return (row as unknown as Record<string, unknown>)[col];
}

function BandBadge({
  band,
  kind,
}: {
  band: Band;
  kind: 'status' | 'disc' | 'elas';
}) {
  const meta =
    kind === 'elas'
      ? ELASTICITY_META[band]
      : kind === 'disc'
        ? BAND_META[band]
        : null;
  const label = band.charAt(0).toUpperCase() + band.slice(1);
  const title = meta ? `${meta.label} (${meta.range})` : label;
  return (
    <Tooltip title={title} orientation="top">
      <span>
        <Badge
          label={label}
          color={bandColor(band)}
          variant="subtle"
          size="small"
        />
      </span>
    </Tooltip>
  );
}

function PricingBadge({ pricing }: { pricing: 'finalised' | 'ia' }) {
  return (
    <Badge
      label={pricing === 'finalised' ? 'Finalised' : 'IA Recommended'}
      color={pricing === 'ia' ? 'info' : 'success'}
      variant="subtle"
      size="small"
    />
  );
}

function ProductCell(params: {
  data?: Partial<HierarchyRow> | null;
  value?: string;
}) {
  const data = params?.data;
  const label = data?.productLabel ?? params?.value;
  if (!label) return null;
  return (
    <div className="prod-cell">
      <div className="name">{label}</div>
      <div className="sub">
        {data?.productSub ? `${data.productSub} · ` : ''}
        {data?.store ?? ''}
      </div>
    </div>
  );
}

function ElasCell(params: {
  data?: { elasticityScore?: number; elasticityBand?: Band } | null;
}) {
  const data = params?.data;
  if (!data?.elasticityBand || data.elasticityScore == null) return null;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        whiteSpace: 'nowrap',
      }}
    >
      <b>{Number(data.elasticityScore).toFixed(1)}x</b>
      <BandBadge band={data.elasticityBand} kind="elas" />
    </span>
  );
}

export function DiscountProgressionTable({
  hierarchyRows,
  progressionRows,
  progUniverse,
  onOpenLevelFilters,
}: DiscountProgressionTableProps) {
  const {
    tableView,
    setTableView,
    sortCol,
    sortDir,
    setSortCol,
    toggleSortDir,
    selectedIds,
    toggleSelection,
    checkedProgressions,
    setCheckedProgressions,
    productLevel,
    storeLevel,
    resetFilters,
  } = useExplainabilityStore();

  const [progAnchor, setProgAnchor] = useState<HTMLElement | null>(null);

  const isHierarchy = tableView === 'hierarchy';
  const currentViewLabel = `${PRODUCT_LEVEL_LABELS[productLevel] || productLevel} × ${STORE_LEVEL_LABELS[storeLevel] || storeLevel}`;

  const handleSortChanged = useCallback(
    (event: unknown) => {
      const e = event as {
        columns?: Array<{
          getColId: () => string;
          getSort: () => string | null;
        }>;
      };
      const sorted = e.columns?.find((c) => c.getSort());
      if (!sorted) {
        setSortCol(null);
        return;
      }
      const colId = sorted.getColId();
      const dir = sorted.getSort() === 'desc' ? -1 : 1;
      if (sortCol === colId && sortDir === dir) return;
      if (sortCol === colId) toggleSortDir();
      else setSortCol(colId);
    },
    [setSortCol, sortCol, sortDir, toggleSortDir]
  );

  const sortedData = useMemo(() => {
    const data = isHierarchy ? hierarchyRows : progressionRows;
    if (!sortCol) return data;
    return [...data].sort((a, b) => {
      const rawA = getRowField(a, sortCol);
      const rawB = getRowField(b, sortCol);
      if (typeof rawA === 'string' && typeof rawB === 'string') {
        return sortDir * rawA.localeCompare(rawB);
      }
      return sortDir * ((Number(rawA) || 0) - (Number(rawB) || 0));
    });
  }, [isHierarchy, hierarchyRows, progressionRows, sortCol, sortDir]);

  const rowData = useMemo(() => {
    if (isHierarchy) {
      return (sortedData as HierarchyRow[]).map((r) => ({
        ...r,
        iaProgressionText: `${r.iaDiscounts.join('% – ')}%`,
        finProgressionText: `${r.finDiscounts.join('% – ')}%`,
      }));
    }
    return (sortedData as ProgressionRow[]).map((r) => ({
      ...r,
      progressionText: `${r.discounts.join('% – ')}%`,
    }));
  }, [isHierarchy, sortedData]);

  const columnDefs = useMemo(() => {
    if (isHierarchy) {
      return [
        {
          headerName: 'Identity',
          marryChildren: true,
          children: [
            {
              field: 'productLabel',
              headerName: 'Product / Store',
              pinned: 'left' as const,
              lockPinned: true,
              width: 220,
              sortable: false,
              cellRenderer: ProductCell,
            },
            {
              field: 'count',
              headerName: '# SKU×Store',
              pinned: 'left' as const,
              lockPinned: true,
              width: 110,
              type: 'rightAligned',
            },
          ],
        },
        {
          headerName: 'Discount Progression',
          marryChildren: true,
          children: [
            {
              field: 'iaProgressionText',
              headerName: 'IA Discount Progression',
              width: 160,
              sortable: false,
            },
            {
              field: 'iaBand',
              headerName: 'IA Discount Band',
              width: 140,
              sortable: false,
              cellRenderer: ({ value }: { value: Band }) => (
                <BandBadge band={value} kind="disc" />
              ),
            },
            {
              field: 'finProgressionText',
              headerName: 'Finalized Discount Progression',
              width: 170,
              sortable: false,
            },
            {
              field: 'finBand',
              headerName: 'Finalized Discount Band',
              width: 150,
              sortable: false,
              cellRenderer: ({ value }: { value: Band }) => (
                <BandBadge band={value} kind="disc" />
              ),
            },
          ],
        },
        {
          headerName: 'Elasticity',
          marryChildren: true,
          children: [
            {
              field: 'elasticityBand',
              headerName: 'Elasticity Band',
              width: 180,
              sortable: false,
              cellRenderer: ElasCell,
            },
          ],
        },
        {
          headerName: 'Before MD',
          marryChildren: true,
          children: [
            {
              field: 'wos',
              headerName: 'Initial WOS',
              width: 100,
              type: 'rightAligned',
              valueFormatter: (p: { value: number }) => p.value?.toFixed(1),
            },
            {
              field: 'ros',
              headerName: 'Initial ROS',
              width: 100,
              type: 'rightAligned',
              valueFormatter: (p: { value: number }) => p.value?.toFixed(1),
            },
            {
              field: 'bopUnits',
              headerName: 'BOP Units',
              width: 110,
              type: 'rightAligned',
              valueFormatter: (p: { value: number }) => formatUnits(p.value),
            },
            {
              field: 'bopValue',
              headerName: 'BOP Value ($)',
              width: 120,
              type: 'rightAligned',
              valueFormatter: (p: { value: number }) => formatMoney(p.value),
            },
          ],
        },
        {
          headerName: 'Projected Sell Through',
          marryChildren: true,
          children: [
            {
              field: 'iaStPct',
              headerName: 'IA Sell Through',
              width: 130,
              type: 'rightAligned',
              valueFormatter: (p: { value: number }) =>
                `${p.value?.toFixed(1)}%`,
            },
            {
              field: 'iaStStatus',
              headerName: 'IA Status',
              width: 110,
              sortable: false,
              cellRenderer: ({ value }: { value: Band }) => (
                <BandBadge band={value} kind="status" />
              ),
            },
            {
              field: 'finStPct',
              headerName: 'Finalized Sell Through',
              width: 150,
              type: 'rightAligned',
              valueFormatter: (p: { value: number }) =>
                `${p.value?.toFixed(1)}%`,
            },
            {
              field: 'finStStatus',
              headerName: 'Finalized Status',
              width: 130,
              sortable: false,
              cellRenderer: ({ value }: { value: Band }) => (
                <BandBadge band={value} kind="status" />
              ),
            },
          ],
        },
        {
          headerName: 'Projected EoP Units',
          marryChildren: true,
          children: [
            {
              field: 'iaEopUnits',
              headerName: 'IA EoP Units',
              width: 120,
              type: 'rightAligned',
              valueFormatter: (p: { value: number }) => formatUnits(p.value),
            },
            {
              field: 'finEopUnits',
              headerName: 'Finalized EoP Units',
              width: 140,
              type: 'rightAligned',
              valueFormatter: (p: { value: number }) => formatUnits(p.value),
            },
          ],
        },
        {
          headerName: 'Projected EoP $ (Value)',
          marryChildren: true,
          children: [
            {
              field: 'iaEopValue',
              headerName: 'IA EoP $ (Value)',
              width: 140,
              type: 'rightAligned',
              valueFormatter: (p: { value: number }) => formatMoney(p.value),
            },
            {
              field: 'finEopValue',
              headerName: 'Finalized EoP $ (Value)',
              width: 160,
              type: 'rightAligned',
              valueFormatter: (p: { value: number }) => formatMoney(p.value),
            },
          ],
        },
      ];
    }

    return [
      {
        headerName: 'Identity',
        marryChildren: true,
        children: [
          {
            field: 'progressionText',
            headerName: 'Discount Progression',
            pinned: 'left' as const,
            lockPinned: true,
            width: 190,
            sortable: false,
          },
          {
            field: 'pricing',
            headerName: 'Pricing',
            pinned: 'left' as const,
            lockPinned: true,
            width: 140,
            sortable: false,
            cellRenderer: ({ value }: { value: 'finalised' | 'ia' }) => (
              <PricingBadge pricing={value} />
            ),
          },
          {
            field: 'count',
            headerName: '# SKU×Store',
            pinned: 'left' as const,
            lockPinned: true,
            width: 110,
            type: 'rightAligned',
          },
        ],
      },
      {
        headerName: 'Discount Profile',
        marryChildren: true,
        children: [
          {
            field: 'band',
            headerName: 'Discount Band',
            width: 130,
            sortable: false,
            cellRenderer: ({ value }: { value: Band }) => (
              <BandBadge band={value} kind="disc" />
            ),
          },
          {
            field: 'elasticityBand',
            headerName: 'Elasticity Band',
            width: 180,
            sortable: false,
            cellRenderer: ElasCell,
          },
        ],
      },
      {
        headerName: 'Before MD',
        marryChildren: true,
        children: [
          {
            field: 'wos',
            headerName: 'Initial WOS',
            width: 100,
            type: 'rightAligned',
            valueFormatter: (p: { value: number }) => p.value?.toFixed(1),
          },
          {
            field: 'ros',
            headerName: 'Initial ROS',
            width: 100,
            type: 'rightAligned',
            valueFormatter: (p: { value: number }) => p.value?.toFixed(1),
          },
          {
            field: 'bopUnits',
            headerName: 'BOP Units',
            width: 110,
            type: 'rightAligned',
            valueFormatter: (p: { value: number }) => formatUnits(p.value),
          },
          {
            field: 'bopValue',
            headerName: 'BOP Value ($)',
            width: 120,
            type: 'rightAligned',
            valueFormatter: (p: { value: number }) => formatMoney(p.value),
          },
        ],
      },
      {
        headerName: 'Projected MD',
        marryChildren: true,
        children: [
          {
            field: 'stPct',
            headerName: 'Projected ST%',
            width: 120,
            type: 'rightAligned',
            valueFormatter: (p: { value: number }) =>
              `${p.value?.toFixed(1)}%`,
          },
          {
            field: 'stStatus',
            headerName: 'Sell-Through Status',
            width: 150,
            sortable: false,
            cellRenderer: ({ value }: { value: Band }) => (
              <BandBadge band={value} kind="status" />
            ),
          },
          {
            field: 'eopUnits',
            headerName: 'EOP Units',
            width: 110,
            type: 'rightAligned',
            valueFormatter: (p: { value: number }) => formatUnits(p.value),
          },
          {
            field: 'eopValue',
            headerName: 'EOP Value ($)',
            width: 120,
            type: 'rightAligned',
            valueFormatter: (p: { value: number }) => formatMoney(p.value),
          },
        ],
      },
    ];
  }, [isHierarchy]);

  const progOptions: MenuOption[] = useMemo(
    () =>
      progUniverse.map((p) => ({
        label: `${p.discounts.join('% – ')}% (${p.pricing === 'finalised' ? 'Fin' : 'IA'})`,
        value: p.key,
      })),
    [progUniverse]
  );

  const selectedProgItems = useMemo(
    () => Array.from(checkedProgressions),
    [checkedProgressions]
  );

  const checkedCount = progUniverse.filter((p) =>
    checkedProgressions.has(p.key)
  ).length;
  const progButtonLabel =
    checkedCount === progUniverse.length
      ? 'All progressions'
      : `${checkedCount} of ${progUniverse.length} selected`;

  const handleProgSelectionChange = useCallback(
    (items: string[]) => {
      setCheckedProgressions(items);
    },
    [setCheckedProgressions]
  );

  const topLeftOptions = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <ButtonGroup
        options={[
          {
            label: 'By Hierarchy',
            value: 'hierarchy',
            icon: <ViewListIcon style={{ fontSize: 16 }} />,
          },
          {
            label: 'By Discount Progression',
            value: 'progression',
            icon: <GridViewIcon style={{ fontSize: 16 }} />,
          },
        ]}
        selectedOption={tableView}
        onChange={(_e, value) => {
          if (value === 'hierarchy' || value === 'progression') {
            setTableView(value);
          }
        }}
      />
      <span style={{ fontSize: 12, color: 'var(--c-ink-500)' }}>
        Viewing: {currentViewLabel} · {rowData.length} rows
      </span>
    </div>
  );

  const topRightOptions = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
      }}
    >
      <Button
        variant="secondary"
        size="small"
        icon={<KeyboardArrowDownIcon style={{ fontSize: 16 }} />}
        iconPlacement="right"
        onClick={(e) =>
          setProgAnchor(progAnchor ? null : e.currentTarget)
        }
        aria-label="Discount progression filter"
      >
        {progButtonLabel}
      </Button>
      <Menu
        open={Boolean(progAnchor)}
        anchorEl={progAnchor}
        onClose={() => setProgAnchor(null)}
        withCheckbox
        options={progOptions}
        onSelectAll={(values) => setCheckedProgressions(values)}
        onClearSelection={() => setCheckedProgressions([])}
        customHeaderProps={{
          selectedItems: selectedProgItems,
          onSelectionChange: handleProgSelectionChange,
          selectAllLabel: 'Select All',
        }}
        renderCustomHeader={(props) => (
          <MenuHeaderInfo
            {...props}
            isSelectAllAllowed
            isSearchable={false}
            options={progOptions}
            selectedItems={selectedProgItems}
            onSelectAll={(values) => setCheckedProgressions(values)}
            onClearSelection={() => setCheckedProgressions([])}
            customHeaderProps={{ selectAllLabel: 'Select All' }}
          />
        )}
        MenuProps={{
          anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
          transformOrigin: { vertical: 'top', horizontal: 'right' },
        }}
      />

      <Button
        variant="secondary"
        size="small"
        icon={<RefreshIcon style={{ fontSize: 14 }} />}
        onClick={() => resetFilters(progUniverse.map((p) => p.key))}
        data-testid="reset-filters-btn"
      >
        Reset filters
      </Button>

      <Tooltip title="Product / Store level filters" orientation="top">
        <span>
          <Button
            variant="secondary"
            size="small"
            icon={<LayersIcon style={{ fontSize: 18 }} />}
            aria-label="Product / Store level filters"
            onClick={onOpenLevelFilters}
          />
        </span>
      </Tooltip>
    </div>
  );

  return (
    <div data-testid="discount-progression-table">
      <ImpactTable
        tableHeader="Discount Progression Table"
        gridId="discount-progression-grid"
        rowHeight="comfort"
        height={520}
        columnDefs={columnDefs}
        rowData={rowData}
        topLeftOptions={topLeftOptions}
        topRightOptions={topRightOptions}
        hideTableSetting
        hidePaginationPageSizeSelector
        emptyStateText='No rows match the current progression / selection filters. Try "Reset filters".'
        getRowId={(params) => params.data.key}
        onRowClicked={(event) => {
          if (!isHierarchy || !event.data) return;
          toggleSelection(event.data.key);
        }}
        getRowClass={(params) => {
          if (!params.data) return '';
          if (isHierarchy && selectedIds.has(params.data.key)) {
            return 'ia-row-selected';
          }
          if (
            !isHierarchy &&
            params.data.progKey &&
            checkedProgressions.has(params.data.progKey)
          ) {
            return 'ia-row-selected';
          }
          return '';
        }}
        defaultColDef={{
          resizable: true,
          sortable: true,
          suppressMenu: true,
        }}
        suppressPaginationPanel
        onSortChanged={handleSortChanged}
      />
    </div>
  );
}
