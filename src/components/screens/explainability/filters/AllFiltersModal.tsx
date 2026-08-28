import { useEffect, useState } from 'react';
import { FilterPanel, Checkbox } from 'impact-ui';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import StoreIcon from '@mui/icons-material/Store';
import { useExplainabilityStore } from '../../../../store/useExplainabilityStore';
import type { EnrichedRow, FilterState } from '../../../../types';

interface AllFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrichedRows: EnrichedRow[];
}

function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort();
}

function MultiCheckField({
  label,
  options,
  values,
  onChange,
}: {
  label: string;
  options: string[];
  values: string[];
  onChange: (next: string[]) => void;
}) {
  const allChecked = options.length > 0 && values.length === options.length;
  const someChecked = values.length > 0 && !allChecked;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--fg-subtle)',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 8,
          maxHeight: 180,
          overflowY: 'auto',
        }}
      >
        <Checkbox
          checked={allChecked}
          indeterminate={someChecked}
          onChange={(e: { target: { checked: boolean } }) =>
            onChange(e.target.checked ? [...options] : [])
          }
          label="Select All"
        />
        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '6px 0' }} />
        {options.map((opt) => (
          <div key={opt} style={{ padding: '2px 0' }}>
            <Checkbox
              checked={values.includes(opt)}
              onChange={() => {
                onChange(
                  values.includes(opt)
                    ? values.filter((v) => v !== opt)
                    : [...values, opt]
                );
              }}
              label={opt}
            />
          </div>
        ))}
        {options.length === 0 && (
          <div style={{ fontSize: 12, color: 'var(--fg-muted)', padding: 4 }}>
            No options
          </div>
        )}
      </div>
    </div>
  );
}

export function AllFiltersModal({
  isOpen,
  onClose,
  enrichedRows,
}: AllFiltersModalProps) {
  const { histFilters, setHistFilters, allfTab, setAllfTab } =
    useExplainabilityStore();
  const [localFilters, setLocalFilters] = useState<FilterState>(histFilters);

  useEffect(() => {
    if (isOpen) setLocalFilters(histFilters);
  }, [isOpen, histFilters]);

  const scopeRows = enrichedRows.filter((r) => r.dept !== 'Dresses');

  const divisionOptions = uniqueSorted(scopeRows.map((r) => r.division));
  const departmentOptions = uniqueSorted(
    scopeRows
      .filter(
        (r) =>
          !localFilters.division.length ||
          localFilters.division.includes(r.division)
      )
      .map((r) => r.dept)
  );
  const classOptions = uniqueSorted(
    scopeRows
      .filter(
        (r) =>
          (!localFilters.division.length ||
            localFilters.division.includes(r.division)) &&
          (!localFilters.department.length ||
            localFilters.department.includes(r.dept))
      )
      .map((r) => r.cls)
  );
  const subclassOptions = uniqueSorted(
    scopeRows
      .filter(
        (r) =>
          (!localFilters.division.length ||
            localFilters.division.includes(r.division)) &&
          (!localFilters.department.length ||
            localFilters.department.includes(r.dept)) &&
          (!localFilters.class_.length || localFilters.class_.includes(r.cls))
      )
      .map((r) => r.subclass)
  );

  const update = (key: keyof FilterState, values: string[]) => {
    setLocalFilters((prev) => ({ ...prev, [key]: values }));
  };

  if (!isOpen) return null;

  return (
    <FilterPanel
      title="All Filters"
      size="large"
      isOpen={isOpen}
      setIsOpen={(open: boolean) => !open && onClose()}
      handleClose={onClose}
      active={allfTab}
      setActive={(tab: string) => setAllfTab(tab as 'store' | 'product')}
      primaryButtonLabel="Apply Filters"
      secondaryButtonLabel="Cancel"
      quaternaryButtonLabel="Clear All"
      onPrimaryButtonClick={() => {
        setHistFilters(localFilters);
        onClose();
      }}
      onSecondaryButtonClick={onClose}
      onQuaternaryButtonClick={() =>
        setLocalFilters({
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
        })
      }
      filters={[
        {
          value: 'product',
          title: 'Product',
          icon: <AccountTreeIcon />,
          required: true,
          numberOfFilter:
            localFilters.division.length +
            localFilters.department.length +
            localFilters.class_.length +
            localFilters.subclass.length,
          children: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '8px 0' }}>
              <MultiCheckField
                label="Division"
                options={divisionOptions}
                values={localFilters.division}
                onChange={(v) => update('division', v)}
              />
              <MultiCheckField
                label="Department"
                options={departmentOptions}
                values={localFilters.department}
                onChange={(v) => update('department', v)}
              />
              <MultiCheckField
                label="Class"
                options={classOptions}
                values={localFilters.class_}
                onChange={(v) => update('class_', v)}
              />
              <MultiCheckField
                label="Sub Class"
                options={subclassOptions}
                values={localFilters.subclass}
                onChange={(v) => update('subclass', v)}
              />
            </div>
          ),
        },
        {
          value: 'store',
          title: 'Store',
          icon: <StoreIcon />,
          numberOfFilter: localFilters.channel.length,
          children: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '8px 0' }}>
              <MultiCheckField
                label="Enterprise Channel"
                options={['Store', 'Ecomm']}
                values={localFilters.channel}
                onChange={(v) => update('channel', v)}
              />
              <p style={{ fontSize: 12, color: 'var(--fg-muted)', margin: 0 }}>
                Note: Country, Brand, and Currency are locked for this strategy.
              </p>
            </div>
          ),
        },
      ]}
    />
  );
}
