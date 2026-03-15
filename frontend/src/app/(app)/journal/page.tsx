'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  Filter,
  Download,
  Star,
  Search,
  ChevronDown,
  Sparkles,
  FileText,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@/hooks/useGraphQL';
import { LIST_CONVERSATIONS, LIST_QUESTS } from '@/lib/graphql/queries';
import JournalEntry from '@/components/quest/JournalEntry';
import type { JournalEntryData, TranscriptHighlight } from '@/components/quest/JournalEntry';
import type { Conversation, Quest, QuestConnection, ConversationConnection } from '@/types';

// ---------- Animation variants ----------

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ---------- Helpers ----------

function extractHighlights(transcript: string, characterName: string): TranscriptHighlight[] {
  if (!transcript) return [];
  const lines = transcript.split('\n').filter((l) => l.trim().length > 0);
  const highlights: TranscriptHighlight[] = [];

  for (const line of lines.slice(0, 6)) {
    const isCharacter = line.toLowerCase().startsWith(characterName.toLowerCase());
    highlights.push({
      text: line.replace(/^[^:]+:\s*/, '').slice(0, 200),
      timestamp: '',
      speaker: isCharacter ? 'character' : 'user',
      emotion: 'neutral',
    });
  }
  return highlights;
}

function conversationToJournalEntry(
  conv: Conversation,
  questsMap: Map<string, Quest>,
): JournalEntryData | null {
  const quest = questsMap.get(conv.questId);
  if (!quest) return null;

  const stage = quest.stages?.find((s) => s.id === conv.stageId);
  if (!stage) return null;

  const score = conv.challengeResult?.score ?? 0;
  const emotion: 'positive' | 'negative' | 'neutral' =
    score >= 70 ? 'positive' : score >= 40 ? 'neutral' : 'negative';

  return {
    id: conv.id,
    date: conv.startedAt,
    questId: conv.questId,
    questTitle: quest.title,
    stageId: conv.stageId,
    stageTitle: stage.title,
    stageOrder: stage.order,
    character: stage.character,
    highlights: extractHighlights(conv.transcript || '', conv.characterName),
    score,
    pointsEarned: stage.points ?? 0,
    duration: conv.duration ?? 0,
    conversationId: conv.id,
    emotion,
    isBestMoment: score >= 90,
  };
}

// ---------- Component ----------

export default function JournalPage() {
  const { user } = useAuth();
  const { data: convsData, execute: fetchConversations } = useQuery<ConversationConnection>(LIST_CONVERSATIONS);
  const { data: questsData, execute: fetchQuests } = useQuery<QuestConnection>(LIST_QUESTS);

  const [selectedQuest, setSelectedQuest] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showBestOnly, setShowBestOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchConversations({ limit: 100 });
    fetchQuests({ limit: 100 });
  }, [fetchConversations, fetchQuests]);

  // Build quests lookup
  const questsMap = useMemo(() => {
    const map = new Map<string, Quest>();
    questsData?.items?.forEach((q) => map.set(q.id, q));
    return map;
  }, [questsData]);

  // Transform conversations to journal entries
  const allEntries = useMemo(() => {
    if (!convsData?.items) return [];
    return convsData.items
      .filter((c) => c.status === 'completed' || c.status === 'analyzed')
      .map((c) => conversationToJournalEntry(c, questsMap))
      .filter((e): e is JournalEntryData => e !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [convsData, questsMap]);

  // Apply filters
  const filteredEntries = useMemo(() => {
    let entries = allEntries;
    if (selectedQuest !== 'all') {
      entries = entries.filter((e) => e.questId === selectedQuest);
    }
    if (dateFrom) {
      const from = new Date(dateFrom);
      entries = entries.filter((e) => new Date(e.date) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59);
      entries = entries.filter((e) => new Date(e.date) <= to);
    }
    if (showBestOnly) {
      entries = entries.filter((e) => e.isBestMoment);
    }
    return entries;
  }, [allEntries, selectedQuest, dateFrom, dateTo, showBestOnly]);

  // Best moments
  const bestMoments = useMemo(
    () => allEntries.filter((e) => e.isBestMoment).slice(0, 5),
    [allEntries],
  );

  // Unique quests for filter
  const uniqueQuests = useMemo(() => {
    const seen = new Set<string>();
    const result: { id: string; title: string }[] = [];
    allEntries.forEach((e) => {
      if (!seen.has(e.questId)) {
        seen.add(e.questId);
        result.push({ id: e.questId, title: e.questTitle });
      }
    });
    return result;
  }, [allEntries]);

  const totalPoints = allEntries.reduce((sum, e) => sum + e.pointsEarned, 0);
  const avgScore = allEntries.length > 0
    ? Math.round(allEntries.reduce((sum, e) => sum + e.score, 0) / allEntries.length)
    : 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-violet-400" />
              Quest Journal
            </h1>
            <p className="text-slate-400 mt-2">
              Your personal diary of adventures and encounters
            </p>
          </div>

          {/* Export button */}
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 transition-all border border-white/10"
          >
            <Download className="w-4 h-4" />
            Export as PDF
          </button>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="glass rounded-xl p-4 border border-violet-500/20">
            <p className="text-xs text-slate-400">Journal Entries</p>
            <p className="text-2xl font-heading font-bold text-white mt-1">{allEntries.length}</p>
          </div>
          <div className="glass rounded-xl p-4 border border-emerald-500/20">
            <p className="text-xs text-slate-400">Total Points</p>
            <p className="text-2xl font-heading font-bold text-white mt-1">{totalPoints.toLocaleString()}</p>
          </div>
          <div className="glass rounded-xl p-4 border border-amber-500/20">
            <p className="text-xs text-slate-400">Avg Score</p>
            <p className="text-2xl font-heading font-bold text-white mt-1">{avgScore}%</p>
          </div>
        </div>
      </motion.div>

      {/* Best Moments */}
      {bestMoments.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="font-heading text-xl font-bold text-white">Best Moments</h2>
            <span className="text-xs text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-lg font-medium">
              90%+ score
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
            {bestMoments.map((entry) => (
              <div
                key={entry.id}
                className="glass rounded-xl p-4 min-w-[240px] max-w-[260px] border border-amber-500/20 flex-shrink-0"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-semibold text-amber-400">{entry.score}%</span>
                </div>
                <h4 className="text-sm font-semibold text-white truncate">{entry.questTitle}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  with {entry.character.name}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  {new Date(entry.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          {(selectedQuest !== 'all' || dateFrom || dateTo || showBestOnly) && (
            <span className="w-2 h-2 rounded-full bg-violet-500" />
          )}
        </button>

        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mt-4 glass rounded-xl p-4 border border-white/10 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Quest filter */}
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

              {/* Date from */}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full bg-navy-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-violet-500/50 focus:outline-none"
                />
              </div>

              {/* Date to */}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full bg-navy-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-violet-500/50 focus:outline-none"
                />
              </div>

              {/* Best moments toggle */}
              <div className="flex items-end">
                <button
                  onClick={() => setShowBestOnly(!showBestOnly)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    showBestOnly
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-white/5 text-slate-400 border border-white/10'
                  }`}
                >
                  <Star className="w-3.5 h-3.5" />
                  Best only
                </button>
              </div>
            </div>

            {/* Clear filters */}
            {(selectedQuest !== 'all' || dateFrom || dateTo || showBestOnly) && (
              <button
                onClick={() => {
                  setSelectedQuest('all');
                  setDateFrom('');
                  setDateTo('');
                  setShowBestOnly(false);
                }}
                className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear all filters
              </button>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Timeline entries */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-violet-400" />
            Timeline
          </h2>
          <span className="text-xs text-slate-500">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {filteredEntries.length > 0 ? (
          <div>
            {filteredEntries.map((entry, i) => (
              <JournalEntry
                key={entry.id}
                entry={entry}
                isLast={i === filteredEntries.length - 1}
              />
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl p-12 text-center border border-white/10">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-heading font-semibold text-slate-400 mb-2">
              No journal entries yet
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Complete quest stages to start building your adventure journal. Each conversation becomes a journal entry.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
