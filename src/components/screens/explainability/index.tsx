import { useEffect } from 'react';
import { Breadcrumbs, Button, Loader } from 'impact-ui';
import { useExplainabilityStore } from '../../../store/useExplainabilityStore';
import { useExplainabilityData } from './hooks/useExplainabilityData';
import { PageHeader } from './components/PageHeader';
import { FiltersApplied } from './components/FiltersApplied';
import { KPICards } from './components/KPICards';
import { ScatterAnalysis } from './components/ScatterAnalysis';
import { DiscountProgressionTable } from './components/DiscountProgressionTable';
import { HistoricalPerformance } from './components/HistoricalPerformance';
import { LevelFiltersPanel } from './filters/LevelFiltersPanel';
import { AllFiltersModal } from './filters/AllFiltersModal';
import { breadcrumbConfig } from '../../../constants/routes';

export default function ExplainabilityScreen() {
  const {
    showFilterPanel,
    setShowFilterPanel,
    levelFiltersOpen,
    setLevelFiltersOpen,
    showFiltersStrip,
    setShowFiltersStrip,
  } = useExplainabilityStore();

  const {
    enrichedRows,
    hierarchyRows,
    progressionRows,
    progUniverse,
    kpiValues,
    strategyInfo,
    isLoading,
    error,
  } = useExplainabilityData();

  // Close benchmarks menu when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-benchmarks-menu]')) {
        useExplainabilityStore.getState().setBenchmarksMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60vh',
        }}
      >
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60vh',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <p style={{ color: 'var(--c-destructive)', fontSize: 14 }}>{error}</p>
        <Button
          variant="primary"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  const appliedFilterCount = Object.values(
    useExplainabilityStore.getState().histFilters
  ).reduce((acc, arr) => acc + arr.length, 0);

  return (
    <>
      {/* Topbar */}
      <div className="app-shell__topbar">
        <Breadcrumbs
          list={
            breadcrumbConfig['/markdown-workbench/strategy-detail'] || [
              { label: 'Markdown Workbench', to: '/markdown-workbench' },
              { label: 'Create MD Strategy', to: '/markdown-workbench/create-strategy' },
              { label: 'MD Strategy Detail' },
            ]
          }
        />
        <Button
          variant="secondary"
          size="large"
          onClick={() => setShowFiltersStrip(!showFiltersStrip)}
        >
          {showFiltersStrip
            ? `Hide Filter (${appliedFilterCount || 4})`
            : `Show Filter (${appliedFilterCount || 4})`}
        </Button>
      </div>

      {/* Filters Strip */}
      {showFiltersStrip && (
        <div className="app-shell__filters-strip">
          <FiltersApplied onAllFiltersClick={() => setShowFilterPanel(true)} />
        </div>
      )}

      {/* Content */}
      <div className="app-shell__content">
        <PageHeader strategyInfo={strategyInfo} />

        <KPICards kpiValues={kpiValues} />

        <ScatterAnalysis hierarchyRows={hierarchyRows} />

        <DiscountProgressionTable
          hierarchyRows={hierarchyRows}
          progressionRows={progressionRows}
          progUniverse={progUniverse}
          onOpenLevelFilters={() => setLevelFiltersOpen(true)}
        />

        <HistoricalPerformance
          enrichedRows={enrichedRows}
          onOpenFilters={() => setShowFilterPanel(true)}
        />
      </div>

      {/* Panels */}
      <LevelFiltersPanel
        isOpen={levelFiltersOpen}
        onClose={() => setLevelFiltersOpen(false)}
      />

      <AllFiltersModal
        isOpen={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        enrichedRows={enrichedRows}
      />
    </>
  );
}
