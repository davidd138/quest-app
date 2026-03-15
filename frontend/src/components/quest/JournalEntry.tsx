'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  MapPin,
  Star,
  Zap,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Heart,
  Smile,
  Frown,
  Meh,
} from 'lucide-react';
import Link from 'next/link';
import type { Character } from '@/types';

// ---------- Types ----------

export interface TranscriptHighlight {
  text: string;
  timestamp: string;
  speaker: 'user' | 'character';
  emotion?: 'positive' | 'negative' | 'neutral';
}

export interface JournalEntryData {
  id: string;
  date: string;
  questId: string;
  questTitle: string;
  stageId: string;
  stageTitle: string;
  stageOrder: number;
  character: Character;
  highlights: TranscriptHighlight[];
  score: number;
  pointsEarned: number;
  duration: number;
  conversationId: string;
  emotion: 'positive' | 'negative' | 'neutral';
  isBestMoment?: boolean;
}

interface JournalEntryProps {
  entry: JournalEntryData;
  isLast?: boolean;
  className?: string;
}

// ---------- Helpers ----------

const emotionConfig = {
  positive: { icon: Smile, color: 'text-emerald-400', bg: 'bg-emerald-500/15', label: 'Great' },
  negative: { icon: Frown, color: 'text-rose-400', bg: 'bg-rose-500/15', label: 'Tough' },
  neutral: { icon: Meh, color: 'text-slate-400', bg: 'bg-slate-500/15', label: 'Neutral' },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ---------- Component ----------

const JournalEntry: React.FC<JournalEntryProps> = ({
  entry,
  isLast = false,
  className = '',
}) => {
  const [expanded, setExpanded] = useState(false);
  const emotionCfg = emotionConfig[entry.emotion];
  const EmotionIcon = emotionCfg.icon;

  return (
    <div className={`relative flex gap-4 ${className}`}>
      {/* Timeline line */}
      <div className="flex flex-col items-center flex-shrink-0">
        {/* Date dot */}
        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-violet-500 to-emerald-500 ring-4 ring-navy-950 z-10" />
        {/* Connecting line */}
        {!isLast && (
          <div className="w-0.5 flex-1 bg-gradient-to-b from-violet-500/30 to-transparent mt-2" />
        )}
      </div>

      {/* Content card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 pb-8"
      >
        {/* Date header */}
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-500 font-medium">{formatDate(entry.date)}</span>
          <span className="text-xs text-slate-600">{formatTime(entry.date)}</span>
          {entry.isBestMoment && (
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-semibold">
              <Star className="w-3 h-3" /> Best Moment
            </span>
          )}
        </div>

        {/* Parchment-style card */}
        <div className="relative rounded-2xl overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-white/15 transition-all duration-300">
          {/* Subtle parchment texture gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/[0.03] via-transparent to-violet-900/[0.03] pointer-events-none" />

          <div className="relative p-5">
            {/* Quest & Stage header */}
            <div className="flex items-start gap-4 mb-4">
              {/* Character portrait */}
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600/30 to-emerald-600/20 flex items-center justify-center ring-2 ring-violet-500/20">
                  {entry.character.avatarUrl ? (
                    <img
                      src={entry.character.avatarUrl}
                      alt={entry.character.name}
                      className="w-full h-full rounded-xl object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-white/80">
                      {getInitials(entry.character.name)}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 text-center mt-1 truncate max-w-[56px]">
                  {entry.character.name}
                </p>
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <Link href={`/quests/${entry.questId}`}>
                  <h3 className="font-heading font-semibold text-white hover:text-violet-300 transition-colors text-sm">
                    {entry.questTitle}
                  </h3>
                </Link>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  Stage {entry.stageOrder + 1}: {entry.stageTitle}
                </p>

                {/* Meta badges */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg ${emotionCfg.bg} ${emotionCfg.color} font-medium`}>
                    <EmotionIcon className="w-3 h-3" />
                    {emotionCfg.label}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 font-medium">
                    <Zap className="w-3 h-3" />
                    +{entry.pointsEarned} pts
                  </span>
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg bg-violet-500/15 text-violet-400 font-medium">
                    <Star className="w-3 h-3" />
                    {entry.score}%
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {formatDuration(entry.duration)}
                  </span>
                </div>
              </div>
            </div>

            {/* Highlights preview (always show first 2) */}
            <div className="space-y-2 mb-3">
              {entry.highlights.slice(0, 2).map((hl, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2 ${
                    hl.speaker === 'character'
                      ? 'bg-violet-500/8 border-l-2 border-violet-500/40'
                      : 'bg-emerald-500/8 border-l-2 border-emerald-500/40'
                  }`}
                >
                  <span className={`font-semibold flex-shrink-0 ${
                    hl.speaker === 'character' ? 'text-violet-400' : 'text-emerald-400'
                  }`}>
                    {hl.speaker === 'character' ? entry.character.name : 'You'}:
                  </span>
                  <span className="text-slate-300 leading-relaxed">&ldquo;{hl.text}&rdquo;</span>
                </div>
              ))}
            </div>

            {/* Expandable additional highlights */}
            {entry.highlights.length > 2 && (
              <>
                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2 mb-3 overflow-hidden"
                    >
                      {entry.highlights.slice(2).map((hl, i) => (
                        <div
                          key={i + 2}
                          className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2 ${
                            hl.speaker === 'character'
                              ? 'bg-violet-500/8 border-l-2 border-violet-500/40'
                              : 'bg-emerald-500/8 border-l-2 border-emerald-500/40'
                          }`}
                        >
                          <span className={`font-semibold flex-shrink-0 ${
                            hl.speaker === 'character' ? 'text-violet-400' : 'text-emerald-400'
                          }`}>
                            {hl.speaker === 'character' ? entry.character.name : 'You'}:
                          </span>
                          <span className="text-slate-300 leading-relaxed">&ldquo;{hl.text}&rdquo;</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300 transition-colors font-medium"
                >
                  {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {expanded ? 'Show less' : `${entry.highlights.length - 2} more highlights`}
                </button>
              </>
            )}

            {/* Footer actions */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
              <Link
                href={`/quest-play/${entry.questId}/chat/${entry.stageId}`}
                className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-violet-400 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Read full transcript
              </Link>
              <button className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-rose-400 transition-colors">
                <Heart className="w-3.5 h-3.5" />
                Favorite
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default JournalEntry;
