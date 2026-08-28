import { useEffect, useMemo, useState } from 'react';
import { Select } from 'impact-ui';

export interface ImpactSelectOption {
  label: string;
  value: string;
}

/** Matches Impact UI SelectOption (value may be string | number). */
type UiSelectOption = {
  label: string;
  value: string | number;
};

function toUiOptions(options: ImpactSelectOption[]): UiSelectOption[] {
  return options.map((o) => ({ label: o.label, value: o.value }));
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
   * Portal the menu to document.body. Off by default — portal + absolute
   * positioning scrolls the page when opening inside long scrollable layouts.
   */
  withPortal?: boolean;
  'data-testid'?: string;
}

/**
 * Controlled single-select wrapper around Impact UI Select.
 * Impact Select requires isOpen/setIsOpen, dual option lists, and selectedOptions state.
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
  'data-testid': dataTestId,
}: ImpactSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<UiSelectOption[]>(() =>
    toUiOptions(options)
  );

  // Impact Select applies `width: minWidth` on the outer container but uses the
  // `width` prop on the trigger. Passing width="auto" lets the trigger grow past
  // the container and overlap siblings — keep them equal.
  const resolvedWidth = width ?? minWidth;

  const selected = useMemo(() => {
    return options.find((o) => o.value === value) ?? options[0] ?? null;
  }, [options, value]);

  // Keep option lists in sync when parent options change (e.g. mutual-exclusion on axes)
  useEffect(() => {
    setCurrentOptions(toUiOptions(options));
  }, [options]);

  return (
    <Select
      label={label}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      initialOptions={toUiOptions(options)}
      currentOptions={currentOptions}
      setCurrentOptions={(opts) => setCurrentOptions(opts as UiSelectOption[])}
      selectedOptions={selected}
      setSelectedOptions={(opts) => {
        if (!opts) return;
        const next = Array.isArray(opts) ? opts[0] : opts;
        if (next?.value != null) onChange(String(next.value));
      }}
      handleChange={(opts) => {
        if (!opts) return;
        const next = Array.isArray(opts) ? opts[0] : opts;
        if (next?.value != null) {
          onChange(String(next.value));
          setIsOpen(false);
        }
      }}
      placeholder={placeholder}
      minWidth={resolvedWidth}
      width={resolvedWidth}
      isDisabled={isDisabled}
      isWithSearch={isWithSearch}
      isCloseWhenClickOutside
      withPortal={withPortal}
      dropdownPosition="bottom"
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
  const [isOpen, setIsOpen] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<UiSelectOption[]>(() =>
    toUiOptions(options)
  );
  const [isSelectAll, setIsSelectAll] = useState(false);
  const resolvedWidth = width ?? minWidth;

  const selected = useMemo(
    () => options.filter((o) => values.includes(o.value)),
    [options, values]
  );

  useEffect(() => {
    setCurrentOptions(toUiOptions(options));
  }, [options]);

  useEffect(() => {
    setIsSelectAll(options.length > 0 && values.length === options.length);
  }, [options, values]);

  return (
    <Select
      label={label}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      initialOptions={toUiOptions(options)}
      currentOptions={currentOptions}
      setCurrentOptions={(opts) => setCurrentOptions(opts as UiSelectOption[])}
      selectedOptions={selected}
      setSelectedOptions={(opts) => {
        const list = !opts ? [] : Array.isArray(opts) ? opts : [opts];
        onChange(list.map((o) => String(o.value)));
      }}
      handleChange={(opts) => {
        const list = !opts ? [] : Array.isArray(opts) ? opts : [opts];
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
      dropdownPosition="bottom"
      data-testid={dataTestId}
    />
  );
}
