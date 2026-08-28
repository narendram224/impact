import { Button } from 'impact-ui';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TuneIcon from '@mui/icons-material/Tune';
import { useExplainabilityStore } from '../../../../store/useExplainabilityStore';

interface FilterGroup {
  label: string;
  required?: boolean;
  values: string[];
  locked?: boolean;
}

interface FiltersAppliedProps {
  onAllFiltersClick: () => void;
}

export function FiltersApplied({ onAllFiltersClick }: FiltersAppliedProps) {
  const { histFilters } = useExplainabilityStore();

  // Build filter groups from state
  const filterGroups: FilterGroup[] = [
    { label: 'Country', required: true, values: ['United States'], locked: true },
    { label: 'Brand', required: true, values: ['Gap'], locked: true },
    {
      label: 'Division',
      required: true,
      values:
        histFilters.division.length > 0
          ? histFilters.division
          : ['Denim & Casual', 'Outerwear & Cold Weather'],
    },
    ...(histFilters.department.length > 0
      ? [{ label: 'Department', values: histFilters.department }]
      : []),
    ...(histFilters.class_.length > 0
      ? [{ label: 'Class', values: histFilters.class_ }]
      : []),
    ...(histFilters.channel.length > 0
      ? [{ label: 'Channel', values: histFilters.channel }]
      : []),
    { label: 'Currency', required: true, values: ['USD'], locked: true },
  ];

  const handleScrollLeft = () => {
    const container = document.getElementById('filterStripScroll');
    if (container) {
      container.scrollBy({
        left: -Math.max(160, container.clientWidth * 0.6),
        behavior: 'smooth',
      });
    }
  };

  const handleScrollRight = () => {
    const container = document.getElementById('filterStripScroll');
    if (container) {
      container.scrollBy({
        left: Math.max(160, container.clientWidth * 0.6),
        behavior: 'smooth',
      });
    }
  };

  const hasActiveFilters = Object.values(histFilters).some(
    (arr) => arr.length > 0
  );

  return (
    <div className="filter-strip">
      <span className="filter-strip-label">Filters Applied</span>

      <Button
        variant="tertiary"
        size="small"
        icon={<ChevronLeftIcon style={{ fontSize: 14 }} />}
        aria-label="Scroll filters left"
        onClick={handleScrollLeft}
        className="fs-arrow-btn"
      />

      <div className="filter-strip-scroll" id="filterStripScroll">
        {filterGroups.map((group) => (
          <div className="fs-group" key={group.label}>
            <span className="fs-group-label">
              {group.label}
              {group.required && <span className="fs-req">*</span>}
            </span>
            {group.values.slice(0, 2).map((val) => (
              <span
                key={val}
                className={`fs-val${group.locked ? ' fs-locked' : ''}`}
              >
                {val}
              </span>
            ))}
            {group.values.length > 2 && (
              <span className="fs-more" title={group.values.slice(2).join(', ')}>
                +{group.values.length - 2}
              </span>
            )}
          </div>
        ))}
      </div>

      <Button
        variant="tertiary"
        size="small"
        icon={<ChevronRightIcon style={{ fontSize: 14 }} />}
        aria-label="Scroll filters right"
        onClick={handleScrollRight}
        className="fs-arrow-btn"
      />

      <Button
        variant="secondary"
        size="small"
        onClick={onAllFiltersClick}
        style={{ position: 'relative', flex: '0 0 auto' }}
      >
        <TuneIcon style={{ fontSize: 14, marginRight: 6 }} />
        All Filters
        {hasActiveFilters && (
          <span
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--c-destructive)',
              border: '1.5px solid #fff',
            }}
          />
        )}
      </Button>
    </div>
  );
}
