'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  useMemo,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  /** Available options. */
  options: SelectOption[];
  /** Currently selected value. */
  value: string;
  /** Change handler. */
  onChange: (value: string) => void;
  /** Label displayed above the select. */
  label?: string;
  /** Error message displayed below. */
  error?: string;
  /** Placeholder when nothing is selected. */
  placeholder?: string;
  /** Show a search/filter input inside the dropdown. */
  searchable?: boolean;
  /** Disabled state. */
  disabled?: boolean;
  /** Extra wrapper classes. */
  className?: string;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      label,
      error,
      placeholder = 'Seleccionar...',
      searchable = false,
      disabled = false,
      className = '',
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [focusIndex, setFocusIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const selectId = useId();

    const selectedOption = options.find((o) => o.value === value);

    const filteredOptions = useMemo(() => {
      if (!search) return options;
      const lower = search.toLowerCase();
      return options.filter((o) => o.label.toLowerCase().includes(lower));
    }, [options, search]);

    // Close on outside click
    useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
          setSearch('');
        }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
      if (isOpen && searchable) {
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (isOpen) {
        const idx = filteredOptions.findIndex((o) => o.value === value);
        setFocusIndex(idx >= 0 ? idx : 0);
      }
    }, [isOpen, searchable, filteredOptions, value]);

    // Scroll focused option into view
    useEffect(() => {
      if (focusIndex >= 0 && listRef.current) {
        const el = listRef.current.children[focusIndex] as HTMLElement | undefined;
        el?.scrollIntoView({ block: 'nearest' });
      }
    }, [focusIndex]);

    const toggle = useCallback(() => {
      if (disabled) return;
      setIsOpen((prev) => {
        if (prev) setSearch('');
        return !prev;
      });
    }, [disabled]);

    const select = useCallback(
      (opt: SelectOption) => {
        if (opt.disabled) return;
        onChange(opt.value);
        setIsOpen(false);
        setSearch('');
      },
      [onChange],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (disabled) return;

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            if (!isOpen) {
              setIsOpen(true);
            } else {
              setFocusIndex((prev) => {
                let next = prev + 1;
                while (
                  next < filteredOptions.length &&
                  filteredOptions[next].disabled
                ) {
                  next++;
                }
                return next < filteredOptions.length ? next : prev;
              });
            }
            break;
          case 'ArrowUp':
            e.preventDefault();
            setFocusIndex((prev) => {
              let next = prev - 1;
              while (next >= 0 && filteredOptions[next].disabled) {
                next--;
              }
              return next >= 0 ? next : prev;
            });
            break;
          case 'Enter':
          case ' ':
            e.preventDefault();
            if (isOpen && focusIndex >= 0 && filteredOptions[focusIndex]) {
              select(filteredOptions[focusIndex]);
            } else if (!isOpen) {
              setIsOpen(true);
            }
            break;
          case 'Escape':
            e.preventDefault();
            setIsOpen(false);
            setSearch('');
            break;
          case 'Home':
            e.preventDefault();
            setFocusIndex(0);
            break;
          case 'End':
            e.preventDefault();
            setFocusIndex(filteredOptions.length - 1);
            break;
        }
      },
      [disabled, isOpen, focusIndex, filteredOptions, select],
    );

    return (
      <div ref={containerRef} className={['relative w-full', className].join(' ')}>
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-slate-300 mb-1.5"
          >
            {label}
          </label>
        )}

        {/* Trigger */}
        <button
          ref={ref}
          id={selectId}
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={`${selectId}-listbox`}
          disabled={disabled}
          onClick={toggle}
          onKeyDown={handleKeyDown}
          className={[
            'w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer',
            'bg-white/5 backdrop-blur-xl border',
            'focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50',
            error
              ? 'border-rose-500/50'
              : isOpen
                ? 'border-violet-500/50'
                : 'border-white/10',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
          ].join(' ')}
        >
          <span className={selectedOption ? 'text-white' : 'text-slate-500'}>
            {selectedOption?.label ?? placeholder}
          </span>
          <ChevronDown
            size={16}
            className={[
              'text-slate-500 transition-transform duration-200',
              isOpen ? 'rotate-180' : '',
            ].join(' ')}
          />
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute z-50 w-full mt-1.5 rounded-xl bg-navy-950/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40 overflow-hidden"
            >
              {/* Search */}
              {searchable && (
                <div className="p-2 border-b border-white/10">
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                    <input
                      ref={searchRef}
                      type="text"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setFocusIndex(0);
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="Buscar..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                      aria-label="Filtrar opciones"
                    />
                  </div>
                </div>
              )}

              {/* Options */}
              <ul
                ref={listRef}
                id={`${selectId}-listbox`}
                role="listbox"
                aria-labelledby={selectId}
                className="max-h-56 overflow-y-auto py-1"
              >
                {filteredOptions.length === 0 && (
                  <li className="px-4 py-3 text-xs text-slate-500 text-center">
                    Sin resultados
                  </li>
                )}
                {filteredOptions.map((opt, idx) => {
                  const isSelected = opt.value === value;
                  const isFocused = idx === focusIndex;

                  return (
                    <li
                      key={opt.value}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={opt.disabled}
                      onClick={() => select(opt)}
                      onMouseEnter={() => setFocusIndex(idx)}
                      className={[
                        'flex items-center justify-between px-4 py-2 text-sm cursor-pointer transition-colors',
                        isFocused ? 'bg-white/10' : '',
                        isSelected
                          ? 'text-violet-300'
                          : opt.disabled
                            ? 'text-slate-600 cursor-not-allowed'
                            : 'text-slate-300 hover:text-white',
                      ].join(' ')}
                    >
                      <span>{opt.label}</span>
                      {isSelected && (
                        <Check size={14} className="text-violet-400 flex-shrink-0" />
                      )}
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';

export default Select;
