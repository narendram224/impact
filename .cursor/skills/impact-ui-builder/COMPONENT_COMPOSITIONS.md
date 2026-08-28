# Impact UI Component Compositions

Guide for combining components to build common UI patterns.

## Table with Actions

Full-featured data table with CRUD operations.

```tsx
import { useState, useCallback, useRef } from 'react';
import { 
  Table, Button, Modal, Input, Select, Prompt, Toast, Badge, Menu 
} from 'impact-ui';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function CrudTable() {
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletePromptOpen, setDeletePromptOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Row actions renderer
  const ActionsRenderer = ({ data: rowData }) => {
    const menuItems = [
      { label: 'Edit', icon: <EditIcon />, onClick: () => handleEdit(rowData) },
      { label: 'Delete', icon: <DeleteIcon />, onClick: () => handleDeleteClick(rowData), type: 'destructive' },
    ];

    return (
      <Menu
        trigger={<Button variant="text" icon={<MoreVertIcon />} />}
        items={menuItems}
      />
    );
  };

  const columnDefs = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'status', headerName: 'Status', cellRenderer: ({ value }) => (
      <Badge label={value} variant={value === 'Active' ? 'success' : 'default'} />
    )},
    { field: 'actions', headerName: '', width: 60, cellRenderer: ActionsRenderer },
  ];

  return (
    <>
      <Table
        tableHeader="Items"
        columnDefs={columnDefs}
        rowData={data}
        topRightOptions={
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            Add New
          </Button>
        }
      />
      
      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedItem(null); }}
        title={selectedItem ? 'Edit Item' : 'Create Item'}
        primaryButtonLabel="Save"
        onPrimaryButtonClick={handleSave}
      >
        {/* Form fields */}
      </Modal>

      {/* Delete Confirmation */}
      <Prompt
        open={deletePromptOpen}
        title="Delete Item"
        message={`Delete "${selectedItem?.name}"?`}
        primaryButtonLabel="Delete"
        primaryButtonProps={{ type: 'destructive' }}
        onPrimaryButtonClick={handleDelete}
        onSecondaryButtonClick={() => setDeletePromptOpen(false)}
      />

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
```

## Filterable List

List with multiple filter types.

```tsx
import { useState, useMemo } from 'react';
import { 
  Card, Input, Select, DateRangePicker, Button, Chips, Tag 
} from 'impact-ui';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

function FilterableList({ items }) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: null,
    category: [],
    dateRange: null,
  });
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status) count++;
    if (filters.category.length) count++;
    if (filters.dateRange) count++;
    return count;
  }, [filters]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      // Status filter
      if (filters.status && item.status !== filters.status.value) {
        return false;
      }
      // Category filter
      if (filters.category.length && !filters.category.some(c => c.value === item.category)) {
        return false;
      }
      // Date range filter
      if (filters.dateRange) {
        const itemDate = new Date(item.createdAt);
        if (itemDate < filters.dateRange.startDate || itemDate > filters.dateRange.endDate) {
          return false;
        }
      }
      return true;
    });
  }, [items, search, filters]);

  const clearFilters = () => {
    setFilters({ status: null, category: [], dateRange: null });
  };

  return (
    <Card>
      {/* Search and filter toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<SearchIcon />}
          style={{ flex: 1 }}
        />
        <Button
          variant="secondary"
          icon={<FilterListIcon />}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          marginBottom: '16px',
          padding: '16px',
          background: '#f9fafb',
          borderRadius: '8px'
        }}>
          <Select
            label="Status"
            placeholder="All statuses"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            value={filters.status}
            onChange={(option) => setFilters({ ...filters, status: option })}
            isClearable
          />
          <Select
            label="Category"
            placeholder="All categories"
            options={categoryOptions}
            value={filters.category}
            onChange={(options) => setFilters({ ...filters, category: options })}
            isMulti
          />
          <DateRangePicker
            label="Date Range"
            startDate={filters.dateRange?.startDate}
            endDate={filters.dateRange?.endDate}
            onChange={(range) => setFilters({ ...filters, dateRange: range })}
          />
          {activeFilterCount > 0 && (
            <Button variant="text" onClick={clearFilters}>
              Clear All
            </Button>
          )}
        </div>
      )}

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {filters.status && (
            <Chips
              label={`Status: ${filters.status.label}`}
              onDelete={() => setFilters({ ...filters, status: null })}
            />
          )}
          {filters.category.map(cat => (
            <Chips
              key={cat.value}
              label={`Category: ${cat.label}`}
              onDelete={() => setFilters({ 
                ...filters, 
                category: filters.category.filter(c => c.value !== cat.value) 
              })}
            />
          ))}
          {filters.dateRange && (
            <Chips
              label={`Date: ${formatDateRange(filters.dateRange)}`}
              onDelete={() => setFilters({ ...filters, dateRange: null })}
            />
          )}
        </div>
      )}

      {/* Results */}
      <div>
        {filteredItems.map(item => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </Card>
  );
}
```

## Multi-Step Form Wizard

Stepped form with validation per step.

```tsx
import { useState } from 'react';
import { 
  Modal, Stepper, Input, Select, Button, Alert 
} from 'impact-ui';

function FormWizard({ open, onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const steps = [
    { label: 'Basic Info', key: 'basic' },
    { label: 'Details', key: 'details' },
    { label: 'Review', key: 'review' },
  ];

  const validateStep = (step) => {
    const newErrors = {};
    switch (step) {
      case 0:
        if (!formData.name?.trim()) newErrors.name = 'Name is required';
        if (!formData.email?.trim()) newErrors.email = 'Email is required';
        break;
      case 1:
        if (!formData.category) newErrors.category = 'Category is required';
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete(formData);
      }
    }
  };

  const handleBack = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Name"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={!!errors.name}
              helperText={errors.name}
            />
            <Input
              label="Email"
              required
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={!!errors.email}
              helperText={errors.email}
            />
          </div>
        );
      case 1:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Select
              label="Category"
              required
              options={categoryOptions}
              value={formData.category}
              onChange={(option) => setFormData({ ...formData, category: option })}
              error={!!errors.category}
              helperText={errors.category}
            />
            <Input
              label="Notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        );
      case 2:
        return (
          <div>
            <Alert type="info" message="Please review your information before submitting." />
            <div style={{ marginTop: '16px' }}>
              <p><strong>Name:</strong> {formData.name}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Category:</strong> {formData.category?.label}</p>
              <p><strong>Notes:</strong> {formData.notes || 'N/A'}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create New Item"
      size="medium"
      primaryButtonLabel={currentStep === steps.length - 1 ? 'Submit' : 'Next'}
      secondaryButtonLabel={currentStep > 0 ? 'Back' : 'Cancel'}
      onPrimaryButtonClick={handleNext}
      onSecondaryButtonClick={currentStep > 0 ? handleBack : onClose}
    >
      <Stepper
        steps={steps}
        activeStep={currentStep}
        style={{ marginBottom: '24px' }}
      />
      {renderStepContent()}
    </Modal>
  );
}
```

## Loading States

Consistent loading patterns across components.

```tsx
import { useState, useEffect } from 'react';
import { Card, Table, Loader, Button, EmptyState } from 'impact-ui';

function DataComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  // Loading state
  if (loading) {
    return (
      <Card>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '200px'
        }}>
          <Loader size="medium" />
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <EmptyState
          heading="Something went wrong"
          description={error.message}
          primaryButtonLabel="Retry"
          onPrimaryButtonClick={() => window.location.reload()}
        />
      </Card>
    );
  }

  // Empty state
  if (!data?.length) {
    return (
      <Card>
        <EmptyState
          heading="No data yet"
          description="Get started by adding your first item."
          primaryButtonLabel="Add Item"
          onPrimaryButtonClick={handleCreate}
        />
      </Card>
    );
  }

  // Data state
  return (
    <Card>
      <Table columnDefs={columns} rowData={data} />
    </Card>
  );
}
```

## Notification System

Toast notifications for user feedback.

```tsx
import { createContext, useContext, useState, useCallback } from 'react';
import { Toast } from 'impact-ui';

// Create context
const ToastContext = createContext(null);

// Provider component
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const success = useCallback((message) => addToast(message, 'success'), [addToast]);
  const error = useCallback((message) => addToast(message, 'error'), [addToast]);
  const warning = useCallback((message) => addToast(message, 'warning'), [addToast]);
  const info = useCallback((message) => addToast(message, 'info'), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
      {children}
      <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 9999 }}>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            style={{ marginBottom: '8px' }}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Hook for using toasts
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Usage in components
function MyComponent() {
  const toast = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      toast.success('Changes saved successfully!');
    } catch (err) {
      toast.error('Failed to save changes. Please try again.');
    }
  };
}
```

## Keyboard Shortcuts

Adding keyboard shortcuts to your app.

```tsx
import { KeyboardShortcuts, useShortcutScope } from 'impact-ui';

function App() {
  const shortcuts = [
    { keys: ['Ctrl', 'K'], description: 'Open search', action: () => setSearchOpen(true) },
    { keys: ['Ctrl', 'N'], description: 'Create new item', action: () => setCreateOpen(true) },
    { keys: ['Esc'], description: 'Close dialog', action: () => setDialogOpen(false) },
    { keys: ['?'], description: 'Show shortcuts', action: () => setShortcutsOpen(true) },
  ];

  // Register shortcuts with scope
  useShortcutScope('global', shortcuts);

  return (
    <>
      {/* Your app content */}
      
      {/* Shortcuts help dialog */}
      <KeyboardShortcuts
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
        shortcuts={shortcuts}
      />
    </>
  );
}
```
