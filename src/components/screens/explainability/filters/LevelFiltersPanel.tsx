import { useState, useEffect } from 'react';
import { Panel, RadioButtonGroup } from 'impact-ui';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useExplainabilityStore } from '../../../../store/useExplainabilityStore';
import type { ProductLevel, StoreLevel } from '../../../../types';

interface LevelFiltersPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRODUCT_LEVEL_OPTIONS = [
  { value: 'brand', label: 'Brand' },
  { value: 'division', label: 'Division' },
  { value: 'department', label: 'Department' },
  { value: 'class', label: 'Class' },
  { value: 'subclass', label: 'Sub Class' },
  { value: 'style', label: 'Style' },
  { value: 'programRetail', label: 'Program Retail' },
  { value: 'programOnline', label: 'Program Online' },
  { value: 'customerChoice', label: 'Customer Choice' },
];

const STORE_LEVEL_OPTIONS = [
  { value: 'all', label: 'All Stores' },
  { value: 'channel', label: 'Enterprise Channel' },
  { value: 'store', label: 'Store' },
];

export function LevelFiltersPanel({ isOpen, onClose }: LevelFiltersPanelProps) {
  const {
    productLevel,
    storeLevel,
    setProductLevel,
    setStoreLevel,
    clearSelection,
  } = useExplainabilityStore();

  const [localProductLevel, setLocalProductLevel] = useState<ProductLevel>(productLevel);
  const [localStoreLevel, setLocalStoreLevel] = useState<StoreLevel>(storeLevel);

  useEffect(() => {
    if (isOpen) {
      setLocalProductLevel(productLevel);
      setLocalStoreLevel(storeLevel);
    }
  }, [isOpen, productLevel, storeLevel]);

  const handleApply = () => {
    setProductLevel(localProductLevel);
    setStoreLevel(localStoreLevel);
    clearSelection();
    onClose();
  };

  const handleClear = () => {
    setLocalProductLevel('style');
    setLocalStoreLevel('channel');
  };

  return (
    <Panel
      open={isOpen}
      setIsOpen={(open) => {
        if (!open) onClose();
      }}
      onClose={onClose}
      title="Level Filters"
      width={380}
      size="medium"
      primaryButtonLabel="Apply"
      onPrimaryButtonClick={handleApply}
      secondaryButtonLabel={
        <>
          <RefreshIcon style={{ fontSize: 13, marginRight: 6 }} />
          Clear Filters
        </>
      }
      onSecondaryButtonClick={handleClear}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '4px 0' }}>
        <RadioButtonGroup
          name="product-level"
          label="Product Hierarchy · select one"
          orientation="row"
          options={PRODUCT_LEVEL_OPTIONS}
          value={localProductLevel}
          selectedOption={localProductLevel}
          onChange={(_e, value) => setLocalProductLevel(value as ProductLevel)}
        />
        <RadioButtonGroup
          name="store-level"
          label="Store Hierarchy · select one"
          orientation="row"
          options={STORE_LEVEL_OPTIONS}
          value={localStoreLevel}
          selectedOption={localStoreLevel}
          onChange={(_e, value) => setLocalStoreLevel(value as StoreLevel)}
        />
      </div>
    </Panel>
  );
}
