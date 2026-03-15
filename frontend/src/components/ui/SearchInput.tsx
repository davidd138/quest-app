'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchInputProps {
  /** Current value. */
  value: string;
  /** Callback for value changes. */
  onChange: (value: string) => void;
  /** Placeholder text. */
  placeholder?: string;
  /** Callback when the clear button is clicked. */
  onClear?: () => void;
  /** Debounce delay in ms. When set, onChange fires after the user stops typing. */
  debounceMs?: number;
  /** Show a loading spinner. */
  loading?: boolean;
  /** Show keyboard shortcut hint. */
  showShortcut?: boolean;
  /** Extra wrapper classes. */
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  onClear,
  debounceMs,
  loading = false,
  showShortcut = true,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internal, setInternal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value changes
  useEffect(() => {
    setInternal(value);
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      setInternal(next);

      if (debounceMs && debounceMs > 0) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => onChange(next), debounceMs);
      } else {
        onChange(next);
      }
    },
    [onChange, debounceMs],
  );

  const handleClear = useCallback(() => {
    setInternal('');
    onChange('');
    onClear?.();
    inputRef.current?.focus();
  }, [onChange, onClear]);

  // Global keyboard shortcut (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const hasValue = internal.length > 0;

  return (
    <div className={`relative ${className}`}>
      {/* Search icon */}
      <Search
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
      />

      <input
        ref={inputRef}
        type="text"
        value={internal}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={placeholder}
        className={[
          'w-full pl-10 py-2.5 text-sm text-white placeholder:text-slate-500',
          'rounded-xl bg-white/5 backdrop-blur-xl border border-white/10',
          'focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400/30',
          'transition-all',
          hasValue ? 'pr-20' : 'pr-16',
        ].join(' ')}
      />

      {/* Right side controls */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {/* Loading spinner */}
        {loading && (
          <Loader2 size={14} className="text-violet-400 animate-spin" />
        )}

        {/* Clear button */}
        {hasValue && !loading && (
          <button
            onClick={handleClear}
            aria-label="Clear search"
            className="p-0.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={14} className="text-slate-400" />
          </button>
        )}

        {/* Keyboard shortcut hint */}
        {showShortcut && !hasValue && !loading && (
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/10 border border-white/10 text-[10px] text-slate-500 font-mono">
            {typeof navigator !== 'undefined' &&
            /Mac|iPod|iPhone|iPad/.test(navigator.platform ?? '')
              ? '\u2318'
              : 'Ctrl+'}
            K
          </kbd>
        )}
      </div>
    </div>
  );
};

export default SearchInput;
