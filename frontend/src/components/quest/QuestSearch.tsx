'use client';

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, ArrowRight, Command } from 'lucide-react';
import type { Quest } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import Badge from '@/components/ui/Badge';
import DifficultyBadge from '@/components/quest/DifficultyBadge';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QuestSearchProps {
  /** All available quests to search through. */
  quests: Quest[];
  /** Called when a quest is selected from the results. */
  onSelect: (quest: Quest) => void;
  /** Placeholder text. @default 'Search quests...' */
  placeholder?: string;
  /** Maximum number of results to show. @default 8 */
  maxResults?: number;
  /** Additional class names. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Fuzzy matching
// ---------------------------------------------------------------------------

/**
 * Simple fuzzy match: checks whether all characters in `query` appear in
 * `target` in order, case-insensitive. Returns a relevance score (higher is
 * better) or -1 if no match.
 */
function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  // Exact substring match scores highest
  const substringIdx = t.indexOf(q);
  if (substringIdx !== -1) {
    // Bonus for matching at start
    return 1000 - substringIdx;
  }

  // Character-by-character fuzzy match
  let qi = 0;
  let score = 0;
  let lastMatch = -1;

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      // Consecutive matches score higher
      score += lastMatch === ti - 1 ? 10 : 1;
      lastMatch = ti;
      qi++;
    }
  }

  return qi === q.length ? score : -1;
}

/**
 * Search a quest against a query. Returns the best score across all
 * searchable fields, or -1 if no match.
 */
function scoreQuest(quest: Quest, query: string): number {
  if (!query.trim()) return -1;

  const fields = [
    { text: quest.title, weight: 3 },
    { text: quest.description, weight: 1 },
    { text: quest.tags.join(' '), weight: 2 },
    { text: quest.stages.map((s) => s.character.name).join(' '), weight: 1.5 },
    { text: quest.category, weight: 1 },
  ];

  let best = -1;
  for (const { text, weight } of fields) {
    const score = fuzzyScore(query, text);
    if (score > 0) {
      best = Math.max(best, score * weight);
    }
  }

  return best;
}

// ---------------------------------------------------------------------------
// Highlight helper
// ---------------------------------------------------------------------------

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;

  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-violet-500/30 text-violet-200 rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const MAX_HISTORY = 5;

const QuestSearch: React.FC<QuestSearchProps> = ({
  quests,
  onSelect,
  placeholder = 'Search quests...',
  maxResults = 8,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);
  const [history, setHistory] = useLocalStorage<string[]>('quest-search-history', []);

  // ---- Search results ----
  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];

    const scored = quests
      .map((quest) => ({ quest, score: scoreQuest(quest, debouncedQuery) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);

    return scored.map(({ quest }) => quest);
  }, [quests, debouncedQuery, maxResults]);

  // ---- Suggestions (history when no query) ----
  const showHistory = focused && !query.trim() && history.length > 0;
  const showResults = focused && debouncedQuery.trim().length > 0;
  const showDropdown = showHistory || showResults;

  // ---- Ctrl+K shortcut ----
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // ---- Keyboard navigation ----
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const itemCount = showResults ? results.length : showHistory ? history.length : 0;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, itemCount - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (showResults && selectedIndex >= 0 && selectedIndex < results.length) {
            handleSelectQuest(results[selectedIndex]);
          } else if (showHistory && selectedIndex >= 0 && selectedIndex < history.length) {
            setQuery(history[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          inputRef.current?.blur();
          setFocused(false);
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showResults, showHistory, results, history, selectedIndex],
  );

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [debouncedQuery]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-search-item]');
    items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // ---- Handlers ----
  const handleSelectQuest = useCallback(
    (quest: Quest) => {
      // Save to history
      setHistory((prev) => {
        const deduped = prev.filter((h) => h !== query.trim());
        return [query.trim(), ...deduped].slice(0, MAX_HISTORY);
      });

      setQuery('');
      setFocused(false);
      onSelect(quest);
    },
    [query, onSelect, setHistory],
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  const handleClear = useCallback(() => {
    setQuery('');
    inputRef.current?.focus();
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Search input */}
      <div
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl
          bg-white/5 backdrop-blur-xl border transition-all
          ${focused ? 'border-violet-500/50 shadow-lg shadow-violet-500/10' : 'border-white/10'}
        `}
      >
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            // Delay so click on result fires before blur hides dropdown
            setTimeout(() => setFocused(false), 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500
            outline-none"
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-label="Search quests"
        />

        {/* Clear / shortcut hint */}
        {query ? (
          <button
            onClick={handleClear}
            className="p-0.5 rounded text-slate-400 hover:text-white transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <kbd
            className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5
              rounded bg-white/5 border border-white/10 text-[10px] text-slate-500"
          >
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={listRef}
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 mt-2 max-h-[400px] overflow-y-auto
              rounded-2xl bg-black/70 backdrop-blur-2xl border border-white/10
              shadow-2xl z-50"
            role="listbox"
          >
            {/* History */}
            {showHistory && (
              <div className="p-2">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    Recent
                  </span>
                  <button
                    onClick={clearHistory}
                    className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Clear
                  </button>
                </div>
                {history.map((term, idx) => (
                  <button
                    key={term}
                    data-search-item
                    onClick={() => setQuery(term)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                      transition-colors text-left
                      ${idx === selectedIndex ? 'bg-violet-500/15 text-white' : 'text-slate-300 hover:bg-white/5'}`}
                    role="option"
                    aria-selected={idx === selectedIndex}
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {term}
                  </button>
                ))}
              </div>
            )}

            {/* Results */}
            {showResults && (
              <div className="p-2">
                {results.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-slate-500">
                    No quests found for &ldquo;{debouncedQuery}&rdquo;
                  </div>
                ) : (
                  <>
                    <div className="px-2 py-1">
                      <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                        {results.length} result{results.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {results.map((quest, idx) => (
                      <button
                        key={quest.id}
                        data-search-item
                        onClick={() => handleSelectQuest(quest)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                          transition-colors text-left group
                          ${idx === selectedIndex ? 'bg-violet-500/15' : 'hover:bg-white/5'}`}
                        role="option"
                        aria-selected={idx === selectedIndex}
                      >
                        {/* Quest thumbnail / category color */}
                        <div
                          className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600/40 to-indigo-600/40
                            flex items-center justify-center shrink-0"
                        >
                          <span className="text-lg">
                            {quest.category === 'adventure' && '🗺️'}
                            {quest.category === 'mystery' && '🔍'}
                            {quest.category === 'cultural' && '🏛️'}
                            {quest.category === 'educational' && '🎓'}
                            {quest.category === 'culinary' && '🍳'}
                            {quest.category === 'nature' && '🌿'}
                            {quest.category === 'urban' && '🏙️'}
                            {quest.category === 'team_building' && '👥'}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">
                            {highlightMatch(quest.title, debouncedQuery)}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <DifficultyBadge difficulty={quest.difficulty} />
                            {quest.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} size="sm" color="slate">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Arrow indicator */}
                        <ArrowRight
                          className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100
                            transition-opacity shrink-0"
                        />
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Keyboard hint */}
            <div className="flex items-center gap-3 px-4 py-2 border-t border-white/5 text-[11px] text-slate-600">
              <span>
                <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10">↑↓</kbd> navigate
              </span>
              <span>
                <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10">↵</kbd> select
              </span>
              <span>
                <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10">esc</kbd> close
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuestSearch;
