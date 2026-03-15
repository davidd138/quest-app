'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  ChevronDown,
  Grid3X3,
  Star,
  X,
  Volume2,
  MessageCircle,
  Swords,
  BookOpen,
  ArrowUpDown,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@/hooks/useGraphQL';
import { LIST_QUESTS, LIST_CONVERSATIONS } from '@/lib/graphql/queries';
import CharacterCollectionCard from '@/components/quest/CharacterCollection';
import type { CollectedCharacter } from '@/components/quest/CharacterCollection';
import type { Quest, Conversation, QuestConnection, ConversationConnection, Character } from '@/types';

// ---------- Animation variants ----------

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const gridItemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

// ---------- Helpers ----------

const accentColors = ['violet', 'emerald', 'amber', 'rose', 'blue', 'fuchsia'];

function getAccentColor(index: number): string {
  return accentColors[index % accentColors.length];
}

type SortMode = 'recent' | 'alpha' | 'quest' | 'rating';

// ---------- Character Detail Modal ----------

function CharacterDetailModal({
  collected,
  onClose,
}: {
  collected: CollectedCharacter;
  onClose: () => void;
}) {
  const { character, met } = collected;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-navy-900/95 backdrop-blur-xl border border-white/10 overflow-hidden"
      >
        {/* Header gradient */}
        <div className="h-32 bg-gradient-to-br from-violet-600/30 via-emerald-600/20 to-transparent relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/30 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Avatar overlay */}
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600/40 to-emerald-600/30 flex items-center justify-center ring-4 ring-navy-900">
              {character.avatarUrl ? (
                <img
                  src={character.avatarUrl}
                  alt={character.name}
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white/80">
                  {character.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-14 px-6 pb-6">
          <h2 className="font-heading text-xl font-bold text-white">{character.name}</h2>
          <p className="text-sm text-slate-400 mt-0.5">{character.role}</p>

          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-400 font-medium">
              {collected.questTitle}
            </span>
            {met && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Volume2 className="w-3 h-3" />
                {character.voiceStyle}
              </span>
            )}
          </div>

          {/* Performance */}
          {met && collected.performanceRating > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-slate-400">Your performance:</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < Math.round(collected.performanceRating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-600'
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Personality */}
          <div className="mt-5 space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Personality
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {character.personality}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Backstory
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {character.backstory}
              </p>
            </div>

            {/* Greeting */}
            <div>
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Greeting
              </h3>
              <p className="text-sm text-violet-300/80 italic">
                &ldquo;{character.greetingMessage}&rdquo;
              </p>
            </div>

            {/* Memorable quotes */}
            {collected.memorableQuotes.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Memorable Quotes
                </h3>
                <div className="space-y-2">
                  {collected.memorableQuotes.map((quote, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-sm text-slate-400 bg-white/[0.03] rounded-lg px-3 py-2"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-violet-400 mt-0.5 flex-shrink-0" />
                      <span className="italic">&ldquo;{quote}&rdquo;</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            {met && (
              <Link
                href={`/quest-play/${collected.questId}/stage/${collected.stageId}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-all"
              >
                <Swords className="w-4 h-4" />
                Challenge again
              </Link>
            )}
            <Link
              href={`/quests/${collected.questId}`}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-slate-300 transition-all border border-white/10"
            >
              <BookOpen className="w-4 h-4" />
              View quest
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---------- Page ----------

export default function CharactersPage() {
  const { user } = useAuth();
  const { data: questsData, execute: fetchQuests } = useQuery<QuestConnection>(LIST_QUESTS);
  const { data: convsData, execute: fetchConversations } = useQuery<ConversationConnection>(LIST_CONVERSATIONS);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuest, setSelectedQuest] = useState<string>('all');
  const [selectedVoice, setSelectedVoice] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<CollectedCharacter | null>(null);

  useEffect(() => {
    fetchQuests({ limit: 100 });
    fetchConversations({ limit: 200 });
  }, [fetchQuests, fetchConversations]);

  // Build met character IDs from conversations
  const metCharacterIds = useMemo(() => {
    const set = new Set<string>();
    convsData?.items?.forEach((conv) => {
      if (conv.status === 'completed' || conv.status === 'analyzed') {
        set.add(`${conv.questId}:${conv.stageId}`);
      }
    });
    return set;
  }, [convsData]);

  // Build performance map from conversations
  const performanceMap = useMemo(() => {
    const map = new Map<string, { score: number; metAt: string; quotes: string[] }>();
    convsData?.items?.forEach((conv) => {
      if (conv.status !== 'completed' && conv.status !== 'analyzed') return;
      const key = `${conv.questId}:${conv.stageId}`;
      const score = conv.challengeResult?.score ?? 0;
      const existing = map.get(key);
      if (!existing || score > existing.score) {
        // Extract a quote from transcript
        const quotes: string[] = [];
        if (conv.transcript) {
          const lines = conv.transcript.split('\n').filter((l) => l.trim());
          const charLines = lines.filter((l) =>
            l.toLowerCase().startsWith(conv.characterName.toLowerCase()),
          );
          charLines.slice(0, 2).forEach((l) => {
            const text = l.replace(/^[^:]+:\s*/, '').trim();
            if (text.length > 10 && text.length < 200) quotes.push(text);
          });
        }
        map.set(key, { score, metAt: conv.startedAt, quotes });
      }
    });
    return map;
  }, [convsData]);

  // Build character collection from all quests
  const allCharacters = useMemo(() => {
    if (!questsData?.items) return [];
    const chars: CollectedCharacter[] = [];
    let colorIdx = 0;

    questsData.items.forEach((quest) => {
      quest.stages?.forEach((stage) => {
        if (!stage.character) return;
        const key = `${quest.id}:${stage.id}`;
        const met = metCharacterIds.has(key);
        const perf = performanceMap.get(key);

        chars.push({
          id: key,
          character: stage.character,
          questId: quest.id,
          questTitle: quest.title,
          stageId: stage.id,
          met,
          metAt: perf?.metAt,
          performanceRating: perf ? Math.round((perf.score / 100) * 5) : 0,
          memorableQuotes: perf?.quotes ?? [],
          accentColor: getAccentColor(colorIdx),
        });
        colorIdx++;
      });
    });

    return chars;
  }, [questsData, metCharacterIds, performanceMap]);

  // Unique values for filters
  const voiceStyles = useMemo(() => {
    const set = new Set<string>();
    allCharacters.forEach((c) => {
      if (c.character.voiceStyle) set.add(c.character.voiceStyle);
    });
    return Array.from(set).sort();
  }, [allCharacters]);

  const roleTypes = useMemo(() => {
    const set = new Set<string>();
    allCharacters.forEach((c) => {
      if (c.character.role) set.add(c.character.role);
    });
    return Array.from(set).sort();
  }, [allCharacters]);

  const uniqueQuests = useMemo(() => {
    const seen = new Set<string>();
    const result: { id: string; title: string }[] = [];
    allCharacters.forEach((c) => {
      if (!seen.has(c.questId)) {
        seen.add(c.questId);
        result.push({ id: c.questId, title: c.questTitle });
      }
    });
    return result;
  }, [allCharacters]);

  // Apply filters and search
  const filteredCharacters = useMemo(() => {
    let chars = allCharacters;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      chars = chars.filter(
        (c) =>
          c.character.name.toLowerCase().includes(q) ||
          c.character.role.toLowerCase().includes(q) ||
          c.questTitle.toLowerCase().includes(q),
      );
    }

    // Quest filter
    if (selectedQuest !== 'all') {
      chars = chars.filter((c) => c.questId === selectedQuest);
    }

    // Voice filter
    if (selectedVoice !== 'all') {
      chars = chars.filter((c) => c.character.voiceStyle === selectedVoice);
    }

    // Role filter
    if (selectedRole !== 'all') {
      chars = chars.filter((c) => c.character.role === selectedRole);
    }

    // Sort
    switch (sortMode) {
      case 'recent':
        chars = [...chars].sort((a, b) => {
          if (a.met && !b.met) return -1;
          if (!a.met && b.met) return 1;
          if (a.metAt && b.metAt) return new Date(b.metAt).getTime() - new Date(a.metAt).getTime();
          return 0;
        });
        break;
      case 'alpha':
        chars = [...chars].sort((a, b) => a.character.name.localeCompare(b.character.name));
        break;
      case 'quest':
        chars = [...chars].sort((a, b) => a.questTitle.localeCompare(b.questTitle));
        break;
      case 'rating':
        chars = [...chars].sort((a, b) => b.performanceRating - a.performanceRating);
        break;
    }

    return chars;
  }, [allCharacters, searchQuery, selectedQuest, selectedVoice, selectedRole, sortMode]);

  const metCount = allCharacters.filter((c) => c.met).length;
  const totalCount = allCharacters.length;
  const progressPercent = totalCount > 0 ? Math.round((metCount / totalCount) * 100) : 0;

  const handleCharacterClick = useCallback((collected: CollectedCharacter) => {
    if (collected.met) {
      setSelectedCharacter(collected);
    }
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-violet-400" />
          Character Collection
        </h1>
        <p className="text-slate-400 mt-2">
          Meet characters across your quests and build your collection
        </p>
      </motion.div>

      {/* Collection progress */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-6 border border-violet-500/20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-heading text-lg font-bold text-white">Collection Progress</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {metCount} of {totalCount} characters met
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-heading font-bold bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
              {progressPercent}%
            </p>
          </div>
        </div>
        <div className="w-full h-3 rounded-full bg-navy-800 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500"
          />
        </div>
      </motion.div>

      {/* Search and filters */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-navy-900 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:border-violet-500/50 focus:outline-none"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-500" />
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="bg-navy-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none"
            >
              <option value="recent">Recently met</option>
              <option value="alpha">Alphabetical</option>
              <option value="quest">By quest</option>
              <option value="rating">By rating</option>
            </select>
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
              showFilters
                ? 'bg-violet-500/15 text-violet-400 border-violet-500/30'
                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {(selectedQuest !== 'all' || selectedVoice !== 'all' || selectedRole !== 'all') && (
              <span className="w-2 h-2 rounded-full bg-violet-500" />
            )}
          </button>
        </div>

        {/* Expanded filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="glass rounded-xl p-4 border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Quest */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Quest</label>
                  <select
                    value={selectedQuest}
                    onChange={(e) => setSelectedQuest(e.target.value)}
                    className="w-full bg-navy-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-violet-500/50 focus:outline-none"
                  >
                    <option value="all">All Quests</option>
                    {uniqueQuests.map((q) => (
                      <option key={q.id} value={q.id}>{q.title}</option>
                    ))}
                  </select>
                </div>

                {/* Voice style */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Voice Style</label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full bg-navy-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-violet-500/50 focus:outline-none"
                  >
                    <option value="all">All Voices</option>
                    {voiceStyles.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                {/* Role type */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full bg-navy-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-violet-500/50 focus:outline-none"
                  >
                    <option value="all">All Roles</option>
                    {roleTypes.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear */}
              {(selectedQuest !== 'all' || selectedVoice !== 'all' || selectedRole !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedQuest('all');
                    setSelectedVoice('all');
                    setSelectedRole('all');
                  }}
                  className="mt-2 flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear all filters
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Results count */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          Showing {filteredCharacters.length} character{filteredCharacters.length !== 1 ? 's' : ''}
          {filteredCharacters.filter((c) => !c.met).length > 0 && (
            <span className="text-slate-500 ml-1">
              ({filteredCharacters.filter((c) => !c.met).length} unmet)
            </span>
          )}
        </p>
      </motion.div>

      {/* Character grid */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
      >
        {filteredCharacters.map((collected) => (
          <motion.div key={collected.id} variants={gridItemVariants}>
            <CharacterCollectionCard
              collected={collected}
              onClick={handleCharacterClick}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Empty state */}
      {filteredCharacters.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center border border-white/10">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-heading font-semibold text-slate-400 mb-2">
            {searchQuery ? 'No characters found' : 'No characters available'}
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? 'Try a different search term or adjust your filters.'
              : 'Start quests to discover characters and build your collection.'}
          </p>
        </div>
      )}

      {/* Character detail modal */}
      <AnimatePresence>
        {selectedCharacter && (
          <CharacterDetailModal
            collected={selectedCharacter}
            onClose={() => setSelectedCharacter(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
