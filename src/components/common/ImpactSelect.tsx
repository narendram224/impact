import { useEffect, useState } from 'react';
import { Select } from 'impact-ui';

export interface ImpactSelectOption {
  label: string;
  value: string;
}

/** Matches Impact UI SelectOption (label + value). */
type UiSelectOption = {
  label: string;
  value: string | number;
};

function toSelectOptions(options: ImpactSelectOption[]): UiSelectOption[] {
  // Always clone — Impact UI requires initialOptions and currentOptions to be
  // two different state values (see Select docs / stories).
  return options.map((o) => ({ label: o.label, value: o.value }));
}

function findOption(
  options: ImpactSelectOption[],
  value: string
): UiSelectOption | null {
  const match = options.find((o) => o.value === value);
  return match ? { label: match.label, value: match.value } : null;
}

interface ImpactSelectProps {
  label?: string;
  options: ImpactSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Fixed control width (also used as minWidth). Prefer a value that fits the longest label. */
  minWidth?: number | string;
  /** Optional override; defaults to minWidth so trigger never overflows its slot. */
  width?: number | string;
  isDisabled?: boolean;
  isWithSearch?: boolean;
  /**
   * Portal to document.body. Prefer false in scrollable chart toolbars —
   * Impact UI portal positioning adds window.scrollY and leaves a large gap.
   * Clicks work without portal as long as menu z-index stays above the blanket
   * (see layout.css). Set true only when a parent clips overflow.
   */
  withPortal?: boolean;
  /** Prefer `top` in chart toolbars so the list stays on-screen above the chart. */
  dropdownPosition?: 'top' | 'bottom';
  'data-testid'?: string;
}

/**
 * Controlled single-select wrapper around Impact UI Select.
 *
 * Follows the official Impact UI pattern from Select.stories + AdvanceSearchModalItem:
 * - isOpen / setIsOpen
 * - initialOptions + currentOptions as *separate* state (do not share one array)
 * - selectedOptions as SelectOption | null, updated via setSelectedOptions
 */
export function ImpactSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select…',
  minWidth = 200,
  width,
  isDisabled = false,
  isWithSearch = false,
  withPortal = false,
  dropdownPosition,
  'data-testid': dataTestId,
}: ImpactSelectProps) {
  const resolvedWidth = width ?? minWidth;

  const [isOpen, setIsOpen] = useState(false);
  const [initialOptions, setInitialOptions] = useState<UiSelectOption[]>(() =>
    toSelectOptions(options)
  );
  const [currentOptions, setCurrentOptions] = useState<UiSelectOption[]>(() =>
    toSelectOptions(options)
  );
  const [selectedOptions, setSelectedOptions] = useState<UiSelectOption | null>(
    () => findOption(options, value)
  );

  // Keep option lists in sync when parent options change (e.g. axis mutual exclusion).
  useEffect(() => {
    const next = toSelectOptions(options);
    setInitialOptions(next);
    setCurrentOptions(next);
  }, [options]);

  // Keep selection in sync with the controlled value.
  useEffect(() => {
    setSelectedOptions(findOption(options, value));
  }, [options, value]);

  return (
    <Select
      label={label}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      initialOptions={initialOptions}
      currentOptions={currentOptions}
      setCurrentOptions={setCurrentOptions}
      selectedOptions={selectedOptions ?? []}
      setSelectedOptions={(option) => {
        // Single-select: Impact UI passes a SelectOption object (see Select.test).
        const next = Array.isArray(option) ? (option[0] ?? null) : option;
        setSelectedOptions(next);
        if (next?.value != null && String(next.value) !== String(value)) {
          onChange(String(next.value));
        }
      }}
      placeholder={placeholder}
      minWidth={resolvedWidth}
      width={resolvedWidth}
      isDisabled={isDisabled}
      isWithSearch={isWithSearch}
      isCloseWhenClickOutside
      withPortal={withPortal}
      dropdownPosition={dropdownPosition}
      data-testid={dataTestId}
    />
  );
}

interface ImpactMultiSelectProps {
  label?: string;
  options: ImpactSelectOption[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  minWidth?: number | string;
  width?: number | string;
  isDisabled?: boolean;
  withPortal?: boolean;
  'data-testid'?: string;
}

/**
 * Controlled multi-select wrapper around Impact UI Select.
 * selectedOptions is always SelectOption[] in multi mode.
 */
export function ImpactMultiSelect({
  label,
  options,
  values,
  onChange,
  placeholder = 'All',
  minWidth = 200,
  width,
  isDisabled = false,
  withPortal = false,
  'data-testid': dataTestId,
}: ImpactMultiSelectProps) {
  const resolvedWidth = width ?? minWidth;

  const [isOpen, setIsOpen] = useState(false);
  const [initialOptions, setInitialOptions] = useState<UiSelectOption[]>(() =>
    toSelectOptions(options)
  );
  const [currentOptions, setCurrentOptions] = useState<UiSelectOption[]>(() =>
    toSelectOptions(options)
  );
  const [selectedOptions, setSelectedOptions] = useState<UiSelectOption[]>(() =>
    toSelectOptions(options.filter((o) => values.includes(o.value)))
  );
  const [isSelectAll, setIsSelectAll] = useState(
    () => options.length > 0 && values.length === options.length
  );

  useEffect(() => {
    const next = toSelectOptions(options);
    setInitialOptions(next);
    setCurrentOptions(next);
  }, [options]);

  useEffect(() => {
    setSelectedOptions(
      toSelectOptions(options.filter((o) => values.includes(o.value)))
    );
    setIsSelectAll(options.length > 0 && values.length === options.length);
  }, [options, values]);

  return (
    <Select
      label={label}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      initialOptions={initialOptions}
      currentOptions={currentOptions}
      setCurrentOptions={setCurrentOptions}
      selectedOptions={selectedOptions}
      setSelectedOptions={(option) => {
        const list = !option ? [] : Array.isArray(option) ? option : [option];
        setSelectedOptions(list);
        onChange(list.map((o) => String(o.value)));
      }}
      isMulti
      isWithSelectAll
      isSelectAll={isSelectAll}
      setIsSelectAll={setIsSelectAll}
      toggleSelectAll
      placeholder={placeholder}
      minWidth={resolvedWidth}
      width={resolvedWidth}
      isDisabled={isDisabled}
      isCloseWhenClickOutside
      withPortal={withPortal}
      data-testid={dataTestId}
    />
  );
}
