import { useEffect, useState, useMemo } from 'react';
import { explainabilityService } from '../../../../services/api';
import {
  enrichRows,
  buildProgUniverse,
  buildHierarchyRows,
  buildProgressionRows,
  calculateKPIs,
} from '../../../../services/dataProcessor';
import { useExplainabilityStore } from '../../../../store/useExplainabilityStore';
import type {
  EnrichedRow,
  HierarchyRow,
  ProgressionRow,
  ProgUniverseItem,
  KPIValues,
} from '../../../../types';

interface UseExplainabilityDataReturn {
  enrichedRows: EnrichedRow[];
  hierarchyRows: HierarchyRow[];
  progressionRows: ProgressionRow[];
  progUniverse: ProgUniverseItem[];
  kpiValues: KPIValues;
  strategyInfo: {
    name: string;
    startDate: string;
    endDate: string;
    days: number;
  };
  isLoading: boolean;
  error: string | null;
}

export function useExplainabilityData(): UseExplainabilityDataReturn {
  const [enrichedRows, setEnrichedRows] = useState<EnrichedRow[]>([]);
  const [progUniverse, setProgUniverse] = useState<ProgUniverseItem[]>([]);
  const [strategyInfo, setStrategyInfo] = useState({
    name: '',
    startDate: '',
    endDate: '',
    days: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const {
    productLevel,
    storeLevel,
    histFilters,
    selectedIds,
    checkedProgressions,
    isLoading,
    setIsLoading,
    initializeProgressions,
  } = useExplainabilityStore();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await explainabilityService.getBaseData();

        const enriched = enrichRows(
          data.baseRows,
          data.styleMeta,
          data.brand
        );
        setEnrichedRows(enriched);

        const universe = buildProgUniverse(enriched);
        setProgUniverse(universe);

        // Initialize checked progressions with all keys
        initializeProgressions(universe.map((p) => p.key));

        setStrategyInfo(data.strategyInfo);
        setError(null);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [setIsLoading, initializeProgressions]);

  // Build hierarchy rows
  const hierarchyRows = useMemo(() => {
    if (!enrichedRows.length) return [];
    return buildHierarchyRows(
      enrichedRows,
      productLevel,
      storeLevel,
      histFilters
    );
  }, [enrichedRows, productLevel, storeLevel, histFilters]);

  // Build progression rows
  const progressionRows = useMemo(() => {
    if (!enrichedRows.length) return [];
    return buildProgressionRows(enrichedRows, histFilters);
  }, [enrichedRows, histFilters]);

  // Filter rows based on selection and progression filters
  const filteredHierarchyRows = useMemo(() => {
    return hierarchyRows.filter((r) => {
      // Check progression filter
      const passesProgression =
        r.finMemberProgKeys.concat(r.iaMemberProgKeys).some((k) =>
          checkedProgressions.has(k)
        );
      if (!passesProgression) return false;

      // Check selection filter
      if (selectedIds.size > 0 && !selectedIds.has(r.key)) return false;

      return true;
    });
  }, [hierarchyRows, checkedProgressions, selectedIds]);

  // Calculate KPIs
  const kpiValues = useMemo(() => {
    const rows = filteredHierarchyRows.length
      ? filteredHierarchyRows
      : hierarchyRows;
    return calculateKPIs(rows);
  }, [filteredHierarchyRows, hierarchyRows]);

  return {
    enrichedRows,
    hierarchyRows: filteredHierarchyRows,
    progressionRows,
    progUniverse,
    kpiValues,
    strategyInfo,
    isLoading,
    error,
  };
}
