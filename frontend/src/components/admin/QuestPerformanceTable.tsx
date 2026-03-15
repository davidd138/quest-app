'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  TrendingUp,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';

interface QuestPerformanceRow {
  questId: string;
  questTitle: string;
  category: string;
  completions: number;
  averageScore: number;
  averageTime: number;
  rating: number;
  trend: number[]; // Last 7 days of completions
  isPublished: boolean;
}

interface QuestPerformanceTableProps {
  data: QuestPerformanceRow[];
  className?: string;
}

type SortField = 'questTitle' | 'category' | 'completions' | 'averageScore' | 'averageTime' | 'rating';
type SortDirection = 'asc' | 'desc';

const PAGE_SIZE = 10;

const categoryColors: Record<string, 'violet' | 'emerald' | 'amber' | 'rose' | 'slate'> = {
  adventure: 'violet',
  mystery: 'slate',
  cultural: 'amber',
  culinary: 'rose',
  nature: 'emerald',
  educational: 'violet',
  urban: 'slate',
  team_building: 'rose',
};

function MiniBarChart({ data }: { data: number[] }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);

  return (
    <div className="flex items-end gap-[2px] h-5">
      {data.map((v, i) => (
        <div
          key={i}
          className="w-[4px] rounded-t-sm bg-violet-500/60 transition-all duration-300"
          style={{ height: `${(v / max) * 100}%`, minHeight: v > 0 ? '2px' : '0px' }}
        />
      ))}
    </div>
  );
}

function SortHeader({
  label,
  field,
  currentSort,
  currentDirection,
  onSort,
  className = '',
}: {
  label: string;
  field: SortField;
  currentSort: SortField;
  currentDirection: SortDirection;
  onSort: (field: SortField) => void;
  className?: string;
}) {
  const isActive = currentSort === field;
  return (
    <th
      className={`text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3 cursor-pointer select-none hover:text-slate-200 transition-colors ${className}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1.5">
        <span>{label}</span>
        {isActive ? (
          currentDirection === 'asc' ? (
            <ArrowUp size={12} className="text-violet-400" />
          ) : (
            <ArrowDown size={12} className="text-violet-400" />
          )
        ) : (
          <ArrowUpDown size={12} className="text-slate-600" />
        )}
      </div>
    </th>
  );
}

export function QuestPerformanceTable({ data, className = '' }: QuestPerformanceTableProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('completions');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(0);

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDirection('desc');
      }
      setPage(0);
    },
    [sortField]
  );

  const filteredAndSorted = useMemo(() => {
    let result = [...data];

    // Filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.questTitle.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal: string | number = a[sortField] as string | number;
      let bVal: string | number = b[sortField] as string | number;

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [data, search, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSorted.length / PAGE_SIZE);
  const paginatedData = filteredAndSorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const exportToCsv = useCallback(() => {
    const headers = ['Quest', 'Category', 'Completions', 'Avg Score', 'Avg Time (min)', 'Rating'];
    const rows = filteredAndSorted.map((r) => [
      `"${r.questTitle}"`,
      r.category,
      r.completions,
      r.averageScore.toFixed(1),
      Math.round(r.averageTime / 60),
      r.rating.toFixed(1),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quest-performance.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredAndSorted]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <Card variant="elevated" padding="none">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="font-heading font-semibold text-white flex items-center gap-2">
            <TrendingUp size={16} className="text-violet-400" />
            Quest Performance
          </h3>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                placeholder="Search quests..."
                className="w-full sm:w-52 pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
              />
            </div>
            {/* Export */}
            <button
              onClick={exportToCsv}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <Download size={13} />
              CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-white/5">
                <SortHeader label="Quest" field="questTitle" currentSort={sortField} currentDirection={sortDirection} onSort={handleSort} className="text-left" />
                <SortHeader label="Category" field="category" currentSort={sortField} currentDirection={sortDirection} onSort={handleSort} className="text-left" />
                <SortHeader label="Completions" field="completions" currentSort={sortField} currentDirection={sortDirection} onSort={handleSort} className="text-center" />
                <SortHeader label="Avg Score" field="averageScore" currentSort={sortField} currentDirection={sortDirection} onSort={handleSort} className="text-center" />
                <SortHeader label="Avg Time" field="averageTime" currentSort={sortField} currentDirection={sortDirection} onSort={handleSort} className="text-center" />
                <SortHeader label="Rating" field="rating" currentSort={sortField} currentDirection={sortDirection} onSort={handleSort} className="text-center" />
                <th className="text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3 text-center">
                  Trend (7d)
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row) => (
                <tr
                  key={row.questId}
                  className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white font-medium line-clamp-1">
                        {row.questTitle}
                      </span>
                      {!row.isPublished && (
                        <Badge color="slate" size="sm">Draft</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      color={categoryColors[row.category] || 'slate'}
                      size="sm"
                    >
                      {row.category.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-slate-300 font-medium">
                      {row.completions}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-sm font-medium ${
                        row.averageScore >= 80
                          ? 'text-emerald-400'
                          : row.averageScore >= 50
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {row.averageScore.toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-slate-300 flex items-center justify-center gap-1">
                      <Clock size={12} className="text-slate-500" />
                      {Math.round(row.averageTime / 60)}m
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-amber-400 flex items-center justify-center gap-1">
                      <Star size={12} className="fill-amber-400" />
                      {row.rating.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <MiniBarChart data={row.trend} />
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500 text-sm">
                    {search ? 'No quests match your search' : 'No quest data available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, filteredAndSorted.length)} of{' '}
              {filteredAndSorted.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                    i === page
                      ? 'bg-violet-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
