'use client';

import React, { useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface PaginationProps {
  /** Currently active page (1-based). */
  currentPage: number;
  /** Total number of pages. */
  totalPages: number;
  /** Callback when the page changes. */
  onPageChange: (page: number) => void;
  /** Compact mode hides first/last and shows fewer numbers. */
  compact?: boolean;
  /** Extra wrapper classes. */
  className?: string;
}

/** Build the list of page numbers/ellipsis tokens to display. */
function buildPageNumbers(
  current: number,
  total: number,
  compact: boolean,
): (number | 'ellipsis-start' | 'ellipsis-end')[] {
  if (total <= (compact ? 5 : 7)) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];
  const siblings = compact ? 1 : 1;

  // Always include first page
  pages.push(1);

  const rangeStart = Math.max(2, current - siblings);
  const rangeEnd = Math.min(total - 1, current + siblings);

  if (rangeStart > 2) pages.push('ellipsis-start');

  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  if (rangeEnd < total - 1) pages.push('ellipsis-end');

  // Always include last page
  pages.push(total);

  return pages;
}

const buttonBase =
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40';

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  compact = false,
  className = '',
}) => {
  const pages = useMemo(
    () => buildPageNumbers(currentPage, totalPages, compact),
    [currentPage, totalPages, compact],
  );

  if (totalPages <= 1) return null;

  const size = compact ? 'w-8 h-8' : 'w-9 h-9';

  return (
    <nav aria-label="Pagination" className={`flex items-center gap-1 ${className}`}>
      {/* First page */}
      {!compact && (
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="First page"
          className={`${buttonBase} ${size} bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white`}
        >
          <ChevronsLeft size={16} />
        </button>
      )}

      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className={`${buttonBase} ${size} bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white`}
      >
        <ChevronLeft size={16} />
      </button>

      {/* Page numbers */}
      {pages.map((page, i) => {
        if (typeof page === 'string') {
          return (
            <span
              key={page + i}
              className={`${size} inline-flex items-center justify-center text-xs text-slate-600 select-none`}
              aria-hidden
            >
              ...
            </span>
          );
        }

        const isActive = page === currentPage;
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-current={isActive ? 'page' : undefined}
            aria-label={`Page ${page}`}
            className={[
              buttonBase,
              size,
              isActive
                ? 'bg-violet-500/30 text-violet-300 border border-violet-400/30 shadow-sm shadow-violet-500/10'
                : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white',
            ].join(' ')}
          >
            {page}
          </button>
        );
      })}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className={`${buttonBase} ${size} bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white`}
      >
        <ChevronRight size={16} />
      </button>

      {/* Last page */}
      {!compact && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Last page"
          className={`${buttonBase} ${size} bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white`}
        >
          <ChevronsRight size={16} />
        </button>
      )}
    </nav>
  );
};

export default Pagination;
