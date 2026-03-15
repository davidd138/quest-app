'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Compass,
  Users,
  Layers,
  Swords,
  X,
  Clock,
  Star,
  ChevronDown,
  MapPin,
  Filter,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useDebounce } from '@/hooks/useDebounce';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

type ResultType = 'quest' | 'collection' | 'user' | 'character';
type SortOption = 'relevance' | 'rating' | 'newest' | 'popular';

interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  description: string;
  category?: string;
  difficulty?: string;
  rating?: number;
  location?: string;
  imageUrl?: string;
  matchField?: string;
}

// Demo search results
const ALL_RESULTS: SearchResult[] = [
  { id: 'r1', type: 'quest', title: 'Madrid Mystery Tour', description: 'Explore the hidden secrets of Madrid through an exciting adventure.', category: 'mystery', difficulty: 'medium', rating: 4.8, location: 'Madrid' },
  { id: 'r2', type: 'quest', title: 'Barcelona Gaudi Walk', description: 'Discover the architectural wonders of Gaudi across Barcelona.', category: 'cultural', difficulty: 'easy', rating: 4.5, location: 'Barcelona' },
  { id: 'r3', type: 'quest', title: 'Seville Tapas Trail', description: 'A culinary journey through the best tapas bars of Seville.', category: 'culinary', difficulty: 'easy', rating: 4.9, location: 'Seville' },
  { id: 'r4', type: 'quest', title: 'Granada Night Explorer', description: 'Explore the Alhambra and the streets of Granada by moonlight.', category: 'adventure', difficulty: 'hard', rating: 4.7, location: 'Granada' },
  { id: 'r5', type: 'collection', title: 'Best of Andalusia', description: 'Curated collection of the best quests across Andalusia.', rating: 4.6 },
  { id: 'r6', type: 'collection', title: 'European Capitals', description: 'Must-play quests in major European capital cities.', rating: 4.3 },
  { id: 'r7', type: 'user', title: 'QuestMasterElena', description: 'Level 42 adventurer with 150 quests completed.', rating: 4.9 },
  { id: 'r8', type: 'user', title: 'AdventurerPablo', description: 'Spain top 10 ranked player and quest creator.', rating: 4.7 },
  { id: 'r9', type: 'character', title: 'Don Quixote', description: 'A chivalrous knight guiding you through La Mancha.', category: 'adventure' },
  { id: 'r10', type: 'character', title: 'Isabella the Explorer', description: 'A curious historian who knows every hidden corner of Spain.', category: 'cultural' },
  { id: 'r11', type: 'quest', title: 'Valencia Science Quest', description: 'A futuristic quest through the City of Arts and Sciences.', category: 'educational', difficulty: 'medium', rating: 4.4, location: 'Valencia' },
  { id: 'r12', type: 'quest', title: 'Bilbao Art Discovery', description: 'Find hidden art installations across the Guggenheim district.', category: 'cultural', difficulty: 'hard', rating: 4.6, location: 'Bilbao' },
];

const SUGGESTIONS: Record<string, string> = {
  'madrd': 'madrid',
  'bareclona': 'barcelona',
  'mystry': 'mystery',
  'advnture': 'adventure',
};

const CATEGORIES = ['adventure', 'mystery', 'cultural', 'educational', 'culinary', 'nature', 'urban'];
const DIFFICULTIES = ['easy', 'medium', 'hard', 'legendary'];

const resultTypeConfig: Record<ResultType, { label: string; icon: React.ElementType; color: string }> = {
  quest: { label: 'Quests', icon: Compass, color: 'text-violet-400' },
  collection: { label: 'Collections', icon: Layers, color: 'text-emerald-400' },
  user: { label: 'Users', icon: Users, color: 'text-amber-400' },
  character: { label: 'Characters', icon: Swords, color: 'text-rose-400' },
};

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-violet-500/30 text-violet-200 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function ResultCard({
  result,
  query,
}: {
  result: SearchResult;
  query: string;
}) {
  const config = resultTypeConfig[result.type];
  const Icon = config.icon;

  const diffColors: Record<string, string> = {
    easy: 'bg-emerald-500/15 text-emerald-400',
    medium: 'bg-amber-500/15 text-amber-400',
    hard: 'bg-rose-500/15 text-rose-400',
    legendary: 'bg-violet-500/15 text-violet-400',
  };

  const href =
    result.type === 'quest'
      ? `/quests/${result.id}`
      : result.type === 'collection'
        ? `/collections`
        : result.type === 'user'
          ? `/social`
          : `/quests`;

  return (
    <motion.div variants={itemVariants} layout>
      <Link href={href}>
        <div className="glass rounded-xl p-4 hover:bg-white/[0.03] transition-all duration-200 group cursor-pointer border border-transparent hover:border-violet-500/20" data-testid="search-result">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0`}>
              <Icon size={18} className={config.color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-heading font-semibold text-white group-hover:text-violet-300 transition-colors truncate">
                  {highlightMatch(result.title, query)}
                </h4>
                <span className={`text-xs ${config.color} bg-white/5 px-2 py-0.5 rounded-lg`}>
                  {config.label.slice(0, -1)}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1 line-clamp-1">
                {highlightMatch(result.description, query)}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                {result.rating !== undefined && (
                  <span className="flex items-center gap-1">
                    <Star size={11} className="text-amber-400" />
                    {result.rating.toFixed(1)}
                  </span>
                )}
                {result.difficulty && (
                  <span className={`px-2 py-0.5 rounded-lg text-xs ${diffColors[result.difficulty] || ''}`}>
                    {result.difficulty}
                  </span>
                )}
                {result.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    {result.location}
                  </span>
                )}
                {result.category && (
                  <span className="capitalize">{result.category}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeTypes, setActiveTypes] = useState<Set<ResultType>>(
    new Set(['quest', 'collection', 'user', 'character']),
  );
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>(
    'quest-app-recent-searches',
    [],
  );

  const debouncedQuery = useDebounce(query, 300);

  // Save search to recent
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      setRecentSearches((prev) => {
        const filtered = prev.filter((s) => s !== debouncedQuery.trim());
        return [debouncedQuery.trim(), ...filtered].slice(0, 8);
      });
    }
  }, [debouncedQuery, setRecentSearches]);

  const suggestion = useMemo(() => {
    const lower = debouncedQuery.toLowerCase().trim();
    return SUGGESTIONS[lower] || null;
  }, [debouncedQuery]);

  const filteredResults = useMemo(() => {
    if (!debouncedQuery.trim()) return [];

    const lower = debouncedQuery.toLowerCase();
    const results = ALL_RESULTS.filter((r) => {
      const matchesQuery =
        r.title.toLowerCase().includes(lower) ||
        r.description.toLowerCase().includes(lower) ||
        (r.category && r.category.toLowerCase().includes(lower)) ||
        (r.location && r.location.toLowerCase().includes(lower));

      const matchesType = activeTypes.has(r.type);
      const matchesCategory = !categoryFilter || r.category === categoryFilter;
      const matchesDifficulty = !difficultyFilter || r.difficulty === difficultyFilter;
      const matchesRating = !ratingFilter || (r.rating && r.rating >= ratingFilter);

      return matchesQuery && matchesType && matchesCategory && matchesDifficulty && matchesRating;
    });

    // Sort
    switch (sortBy) {
      case 'rating':
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        results.reverse();
        break;
      case 'popular':
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        // relevance - title matches first
        results.sort((a, b) => {
          const aTitle = a.title.toLowerCase().includes(lower) ? 1 : 0;
          const bTitle = b.title.toLowerCase().includes(lower) ? 1 : 0;
          return bTitle - aTitle;
        });
    }

    return results;
  }, [debouncedQuery, activeTypes, categoryFilter, difficultyFilter, ratingFilter, sortBy]);

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Partial<Record<ResultType, SearchResult[]>> = {};
    for (const result of filteredResults) {
      if (!groups[result.type]) groups[result.type] = [];
      groups[result.type]!.push(result);
    }
    return groups;
  }, [filteredResults]);

  const toggleType = useCallback((type: ResultType) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const clearRecentSearch = useCallback(
    (search: string) => {
      setRecentSearches((prev) => prev.filter((s) => s !== search));
    },
    [setRecentSearches],
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="font-heading text-3xl font-bold text-white">Search</h1>
        <p className="text-slate-400 mt-1">Find quests, collections, users, and characters</p>
      </motion.div>

      {/* Search bar */}
      <motion.div variants={itemVariants}>
        <div className="glass rounded-2xl p-4 border border-white/10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search quests, collections, users..."
              autoFocus
              className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-navy-800/50 border border-slate-700/50 text-base text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/25 transition-all"
              data-testid="search-input"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Type filters */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {(Object.entries(resultTypeConfig) as [ResultType, typeof resultTypeConfig.quest][]).map(
              ([type, config]) => {
                const Icon = config.icon;
                const isActive = activeTypes.has(type);
                return (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    data-testid={`filter-${type}`}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                        : 'bg-white/5 text-slate-500 border border-transparent hover:text-slate-300'
                    }`}
                  >
                    <Icon size={13} />
                    {config.label}
                  </button>
                );
              },
            )}

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ml-auto ${
                showFilters
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                  : 'bg-white/5 text-slate-500 border border-transparent hover:text-slate-300'
              }`}
            >
              <Filter size={13} />
              Filters
            </button>
          </div>

          {/* Expanded filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-white/5">
                  <div className="relative">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-navy-800/50 border border-slate-700/50 text-sm text-slate-300 focus:outline-none focus:border-violet-500/50 cursor-pointer"
                    >
                      <option value="">All Categories</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select
                      value={difficultyFilter}
                      onChange={(e) => setDifficultyFilter(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-navy-800/50 border border-slate-700/50 text-sm text-slate-300 focus:outline-none focus:border-violet-500/50 cursor-pointer"
                    >
                      <option value="">All Difficulties</option>
                      {DIFFICULTIES.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select
                      value={ratingFilter}
                      onChange={(e) => setRatingFilter(Number(e.target.value))}
                      className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-navy-800/50 border border-slate-700/50 text-sm text-slate-300 focus:outline-none focus:border-violet-500/50 cursor-pointer"
                    >
                      <option value="0">Any Rating</option>
                      <option value="4">4+ Stars</option>
                      <option value="4.5">4.5+ Stars</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-navy-800/50 border border-slate-700/50 text-sm text-slate-300 focus:outline-none focus:border-violet-500/50 cursor-pointer"
                    >
                      <option value="relevance">Sort: Relevance</option>
                      <option value="rating">Sort: Rating</option>
                      <option value="newest">Sort: Newest</option>
                      <option value="popular">Sort: Popular</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Did you mean */}
          {suggestion && (
            <motion.div variants={itemVariants} className="glass rounded-xl p-4">
              <p className="text-sm text-slate-400">
                Did you mean{' '}
                <button
                  onClick={() => setQuery(suggestion)}
                  className="text-violet-400 hover:text-violet-300 font-medium underline underline-offset-2"
                  data-testid="suggestion"
                >
                  {suggestion}
                </button>
                ?
              </p>
            </motion.div>
          )}

          {/* Grouped results */}
          {debouncedQuery.trim() ? (
            Object.keys(groupedResults).length > 0 ? (
              (Object.entries(groupedResults) as [ResultType, SearchResult[]][]).map(
                ([type, results]) => {
                  const config = resultTypeConfig[type];
                  const Icon = config.icon;
                  return (
                    <motion.div key={type} variants={itemVariants}>
                      <div className="flex items-center gap-2 mb-3">
                        <Icon size={16} className={config.color} />
                        <h3 className="font-heading text-lg font-semibold text-white">
                          {config.label}
                        </h3>
                        <span className="text-xs text-slate-500 ml-1">
                          ({results.length})
                        </span>
                      </div>
                      <div className="space-y-2" data-testid={`results-${type}`}>
                        {results.map((result) => (
                          <ResultCard key={result.id} result={result} query={debouncedQuery} />
                        ))}
                      </div>
                    </motion.div>
                  );
                },
              )
            ) : (
              <motion.div
                variants={itemVariants}
                className="glass rounded-2xl p-16 text-center"
                data-testid="no-results"
              >
                <Search className="w-14 h-14 text-slate-600 mx-auto mb-4" />
                <h3 className="font-heading text-xl font-semibold text-white mb-2">
                  No results found
                </h3>
                <p className="text-slate-400 max-w-sm mx-auto">
                  No results for &quot;{debouncedQuery}&quot;. Try different keywords or adjust your filters.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <span className="text-xs text-slate-500">Try:</span>
                  {['madrid', 'adventure', 'mystery'].map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="text-xs px-3 py-1 rounded-lg bg-white/5 text-violet-400 hover:bg-violet-500/10 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </motion.div>
            )
          ) : (
            <motion.div variants={itemVariants} className="glass rounded-2xl p-16 text-center">
              <Search className="w-14 h-14 text-slate-600 mx-auto mb-4" />
              <h3 className="font-heading text-xl font-semibold text-white mb-2">
                Start searching
              </h3>
              <p className="text-slate-400">
                Type to search across quests, collections, users, and characters
              </p>
            </motion.div>
          )}
        </div>

        {/* Recent searches sidebar */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h3 className="font-heading text-lg font-semibold text-white">Recent Searches</h3>
          {recentSearches.length > 0 ? (
            <div className="space-y-1" data-testid="recent-searches">
              {recentSearches.map((search) => (
                <div
                  key={search}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <Clock size={14} className="text-slate-500 flex-shrink-0" />
                  <button
                    onClick={() => setQuery(search)}
                    className="flex-1 text-sm text-slate-400 hover:text-white text-left truncate transition-colors"
                  >
                    {search}
                  </button>
                  <button
                    onClick={() => clearRecentSearch(search)}
                    className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                    aria-label={`Remove ${search}`}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No recent searches</p>
          )}

          {/* Quick links */}
          <div className="mt-6">
            <h3 className="font-heading text-lg font-semibold text-white mb-3">Quick Links</h3>
            <div className="space-y-1">
              {[
                { label: 'Trending Quests', href: '/quests/trending', icon: Zap },
                { label: 'All Quests', href: '/quests', icon: Compass },
                { label: 'Discover', href: '/discover', icon: MapPin },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <link.icon size={14} />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
