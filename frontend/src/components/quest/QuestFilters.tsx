'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  Clock,
  MapPin,
} from 'lucide-react';
import type { QuestCategory, QuestDifficulty } from '@/types';
import { QUEST_CATEGORIES, QUEST_DIFFICULTIES } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export interface QuestFilterValues {
  categories: QuestCategory[];
  difficulties: QuestDifficulty[];
  durationMin: number;
  durationMax: number;
  radiusKm: number;
  sortBy: SortOption;
}

type SortOption = 'newest' | 'popular' | 'rating' | 'difficulty';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Mas recientes' },
  { value: 'popular', label: 'Mas populares' },
  { value: 'rating', label: 'Mejor valorados' },
  { value: 'difficulty', label: 'Dificultad' },
];

const CATEGORY_LABELS: Record<QuestCategory, string> = {
  adventure: 'Aventura',
  mystery: 'Misterio',
  cultural: 'Cultural',
  educational: 'Educativa',
  culinary: 'Culinaria',
  nature: 'Naturaleza',
  urban: 'Urbana',
  team_building: 'Team building',
};

const DIFFICULTY_LABELS: Record<QuestDifficulty, string> = {
  easy: 'Facil',
  medium: 'Media',
  hard: 'Dificil',
  legendary: 'Legendaria',
};

const DEFAULT_FILTERS: QuestFilterValues = {
  categories: [],
  difficulties: [],
  durationMin: 0,
  durationMax: 300,
  radiusKm: 50,
  sortBy: 'newest',
};

interface QuestFiltersProps {
  /** Current filter values. */
  filters: QuestFilterValues;
  /** Called whenever filters change. */
  onChange: (filters: QuestFilterValues) => void;
  /** Extra wrapper classes. */
  className?: string;
}

const QuestFilters: React.FC<QuestFiltersProps> = ({
  filters,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.difficulties.length > 0) count++;
    if (filters.durationMin > 0 || filters.durationMax < 300) count++;
    if (filters.radiusKm < 50) count++;
    if (filters.sortBy !== 'newest') count++;
    return count;
  }, [filters]);

  const update = useCallback(
    (patch: Partial<QuestFilterValues>) => {
      onChange({ ...filters, ...patch });
    },
    [filters, onChange],
  );

  const toggleCategory = useCallback(
    (cat: QuestCategory) => {
      const next = filters.categories.includes(cat)
        ? filters.categories.filter((c) => c !== cat)
        : [...filters.categories, cat];
      update({ categories: next });
    },
    [filters.categories, update],
  );

  const toggleDifficulty = useCallback(
    (diff: QuestDifficulty) => {
      const next = filters.difficulties.includes(diff)
        ? filters.difficulties.filter((d) => d !== diff)
        : [...filters.difficulties, diff];
      update({ difficulties: next });
    },
    [filters.difficulties, update],
  );

  const clearAll = useCallback(() => {
    onChange({ ...DEFAULT_FILTERS });
  }, [onChange]);

  return (
    <div className={className}>
      {/* Toggle button */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={SlidersHorizontal}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          Filtros
          {activeCount > 0 && (
            <Badge color="violet" size="sm" className="ml-1">
              {activeCount}
            </Badge>
          )}
        </Button>

        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
          >
            <X size={12} />
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Collapsible panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-5">
              {/* Categories */}
              <FilterSection title="Categoria">
                <div className="flex flex-wrap gap-2">
                  {QUEST_CATEGORIES.map((cat) => {
                    const isSelected = filters.categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={[
                          'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border cursor-pointer',
                          isSelected
                            ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20',
                        ].join(' ')}
                      >
                        {CATEGORY_LABELS[cat]}
                      </button>
                    );
                  })}
                </div>
              </FilterSection>

              {/* Difficulty */}
              <FilterSection title="Dificultad">
                <div className="flex flex-wrap gap-2">
                  {QUEST_DIFFICULTIES.map((diff) => {
                    const isSelected = filters.difficulties.includes(diff);
                    return (
                      <button
                        key={diff}
                        onClick={() => toggleDifficulty(diff)}
                        className={[
                          'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border cursor-pointer',
                          isSelected
                            ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20',
                        ].join(' ')}
                      >
                        {DIFFICULTY_LABELS[diff]}
                      </button>
                    );
                  })}
                </div>
              </FilterSection>

              {/* Duration range */}
              <FilterSection title="Duracion (minutos)">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-slate-500" />
                    <input
                      type="number"
                      min={0}
                      max={filters.durationMax}
                      value={filters.durationMin}
                      onChange={(e) =>
                        update({ durationMin: Math.max(0, Number(e.target.value)) })
                      }
                      className="w-20 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                      aria-label="Duracion minima"
                    />
                  </div>
                  <span className="text-slate-600 text-xs">—</span>
                  <input
                    type="number"
                    min={filters.durationMin}
                    max={600}
                    value={filters.durationMax}
                    onChange={(e) =>
                      update({ durationMax: Math.min(600, Number(e.target.value)) })
                    }
                    className="w-20 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                    aria-label="Duracion maxima"
                  />
                </div>
              </FilterSection>

              {/* Location radius */}
              <FilterSection title="Radio de busqueda">
                <div className="flex items-center gap-3">
                  <MapPin size={12} className="text-slate-500 flex-shrink-0" />
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={filters.radiusKm}
                    onChange={(e) => update({ radiusKm: Number(e.target.value) })}
                    className="flex-1 accent-violet-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-500 [&::-webkit-slider-thumb]:shadow-lg"
                    aria-label="Radio en kilometros"
                  />
                  <span className="text-xs text-slate-400 w-14 text-right tabular-nums">
                    {filters.radiusKm} km
                  </span>
                </div>
              </FilterSection>

              {/* Sort */}
              <FilterSection title="Ordenar por">
                <div className="relative">
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      update({ sortBy: e.target.value as SortOption })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                    aria-label="Ordenar resultados por"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option
                        key={opt.value}
                        value={opt.value}
                        className="bg-navy-950 text-white"
                      >
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                  />
                </div>
              </FilterSection>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Internal sub-component ---

const FilterSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <div>
    <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
      {title}
    </h4>
    {children}
  </div>
);

export { DEFAULT_FILTERS };
export default QuestFilters;
