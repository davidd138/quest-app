'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  Monitor,
  Smartphone,
  Sun,
  Moon,
  ExternalLink,
  MapPin,
  Clock,
  Star,
  ChevronRight,
  Trophy,
} from 'lucide-react';
import type {
  QuestCategory,
  QuestDifficulty,
  StageInput,
} from '@/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

// ---------- Types ----------

interface QuestPreviewData {
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  estimatedDuration: number;
  coverImageUrl?: string;
  stages: StageInput[];
  tags?: string[];
  location?: { name?: string };
  isPublished?: boolean;
}

interface QuestPreviewProps {
  data: QuestPreviewData;
  className?: string;
}

type PreviewMode = 'card' | 'detail' | 'stages';

// ---------- Helpers ----------

const difficultyColors: Record<QuestDifficulty, 'emerald' | 'amber' | 'rose' | 'violet'> = {
  easy: 'emerald',
  medium: 'amber',
  hard: 'rose',
  legendary: 'violet',
};

function totalPoints(stages: StageInput[]): number {
  return stages.reduce((sum, s) => sum + (s.points ?? 0), 0);
}

// ---------- Sub-components ----------

function PreviewCard({
  data,
  theme,
}: {
  data: QuestPreviewData;
  theme: 'dark' | 'light';
}) {
  const isDark = theme === 'dark';
  const bg = isDark ? 'bg-navy-900' : 'bg-white';
  const text = isDark ? 'text-white' : 'text-slate-900';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const border = isDark ? 'border-white/10' : 'border-slate-200';

  return (
    <div className={`rounded-2xl overflow-hidden border ${border} ${bg} shadow-lg`}>
      {/* Cover */}
      <div className="h-36 bg-gradient-to-br from-violet-600 to-indigo-700 relative">
        {data.coverImageUrl && (
          <img
            src={data.coverImageUrl}
            alt={data.title || 'Quest cover'}
            className="w-full h-full object-cover absolute inset-0"
          />
        )}
        <div className="absolute top-3 left-3">
          <Badge color={difficultyColors[data.difficulty] ?? 'violet'} size="sm">
            {data.difficulty}
          </Badge>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-2">
        <h3 className={`font-bold text-lg truncate ${text}`}>
          {data.title || 'Untitled Quest'}
        </h3>
        <p className={`text-sm line-clamp-2 ${muted}`}>
          {data.description || 'No description yet...'}
        </p>
        <div className={`flex items-center gap-4 text-xs ${muted}`}>
          <span className="flex items-center gap-1">
            <Clock size={12} /> {data.estimatedDuration}m
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {data.stages.length} stages
          </span>
          <span className="flex items-center gap-1">
            <Trophy size={12} /> {totalPoints(data.stages)} pts
          </span>
        </div>
      </div>
    </div>
  );
}

function PreviewDetail({
  data,
  theme,
}: {
  data: QuestPreviewData;
  theme: 'dark' | 'light';
}) {
  const isDark = theme === 'dark';
  const bg = isDark ? 'bg-navy-900' : 'bg-white';
  const text = isDark ? 'text-white' : 'text-slate-900';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const border = isDark ? 'border-white/10' : 'border-slate-200';
  const cardBg = isDark ? 'bg-white/5' : 'bg-slate-50';

  return (
    <div className={`rounded-2xl overflow-hidden border ${border} ${bg} shadow-lg`}>
      {/* Hero */}
      <div className="h-48 bg-gradient-to-br from-violet-600 to-indigo-700 relative">
        {data.coverImageUrl && (
          <img
            src={data.coverImageUrl}
            alt={data.title || 'Quest cover'}
            className="w-full h-full object-cover absolute inset-0"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <Badge color={difficultyColors[data.difficulty] ?? 'violet'} size="sm">
            {data.difficulty}
          </Badge>
          <h2 className="text-xl font-bold text-white mt-2">
            {data.title || 'Untitled Quest'}
          </h2>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 space-y-4">
        <p className={`text-sm leading-relaxed ${muted}`}>
          {data.description || 'No description yet...'}
        </p>

        {/* Stats row */}
        <div className={`grid grid-cols-3 gap-3`}>
          {[
            { label: 'Duration', value: `${data.estimatedDuration}m`, icon: Clock },
            { label: 'Stages', value: data.stages.length.toString(), icon: MapPin },
            { label: 'Points', value: totalPoints(data.stages).toString(), icon: Trophy },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-xl ${cardBg} p-3 text-center border ${border}`}
            >
              <stat.icon size={16} className={`mx-auto mb-1 ${muted}`} />
              <p className={`text-base font-bold ${text}`}>{stat.value}</p>
              <p className={`text-[10px] uppercase tracking-wider ${muted}`}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tags */}
        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {data.tags.map((tag) => (
              <span
                key={tag}
                className={`text-[10px] px-2 py-0.5 rounded-full border ${border} ${muted}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Location */}
        {data.location?.name && (
          <div className={`flex items-center gap-2 text-xs ${muted}`}>
            <MapPin size={14} />
            <span>{data.location.name}</span>
          </div>
        )}

        {/* CTA */}
        <div className="pt-2">
          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white font-medium text-sm shadow-lg shadow-violet-500/25">
            Start Quest
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewStages({
  data,
  theme,
}: {
  data: QuestPreviewData;
  theme: 'dark' | 'light';
}) {
  const isDark = theme === 'dark';
  const bg = isDark ? 'bg-navy-900' : 'bg-white';
  const text = isDark ? 'text-white' : 'text-slate-900';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const border = isDark ? 'border-white/10' : 'border-slate-200';
  const cardBg = isDark ? 'bg-white/5' : 'bg-slate-50';

  return (
    <div className={`rounded-2xl border ${border} ${bg} shadow-lg p-5 space-y-3`}>
      <h3 className={`font-bold text-sm uppercase tracking-wider ${muted}`}>
        Stage List ({data.stages.length})
      </h3>

      {data.stages.length === 0 && (
        <p className={`text-sm italic ${muted}`}>No stages added yet.</p>
      )}

      {data.stages.map((stage, idx) => (
        <div
          key={stage.id ?? idx}
          className={`flex items-center gap-3 rounded-xl ${cardBg} border ${border} p-3`}
        >
          {/* Order circle */}
          <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-300 flex-shrink-0">
            {idx + 1}
          </div>

          <div className="flex-1 min-w-0">
            <p className={`font-medium text-sm truncate ${text}`}>
              {stage.title || `Stage ${idx + 1}`}
            </p>
            <p className={`text-xs truncate ${muted}`}>
              {stage.description || 'No description'}
            </p>
          </div>

          <div className={`text-xs font-medium ${muted} flex items-center gap-1 flex-shrink-0`}>
            <Star size={10} /> {stage.points ?? 0}
          </div>

          <ChevronRight size={14} className={muted} />
        </div>
      ))}
    </div>
  );
}

// ---------- Main Component ----------

const QuestPreview: React.FC<QuestPreviewProps> = ({ data, className = '' }) => {
  const [mode, setMode] = useState<PreviewMode>('card');
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const handleOpenNewTab = () => {
    const previewData = encodeURIComponent(JSON.stringify(data));
    window.open(`/quests/preview?data=${previewData}`, '_blank');
  };

  const modes: { value: PreviewMode; label: string }[] = [
    { value: 'card', label: 'Card' },
    { value: 'detail', label: 'Detail' },
    { value: 'stages', label: 'Stages' },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye size={16} className="text-violet-400" />
          <span className="text-sm font-semibold text-white">Preview</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode switcher */}
          <div className="flex items-center bg-white/5 rounded-lg border border-white/10 p-0.5">
            {modes.map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  mode === m.value
                    ? 'bg-violet-500/20 text-violet-300 font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Device toggle */}
          <button
            onClick={() => setIsMobile(!isMobile)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isMobile
                ? 'bg-violet-500/20 border-violet-500/30 text-violet-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
            title={isMobile ? 'Switch to desktop' : 'Switch to mobile'}
          >
            {isMobile ? <Smartphone size={14} /> : <Monitor size={14} />}
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} preview`}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* New tab */}
          <button
            onClick={handleOpenNewTab}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors"
            title="Open in new tab"
          >
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {/* Preview container */}
      <motion.div
        layout
        className={`mx-auto transition-all duration-300 ${
          isMobile ? 'max-w-[375px]' : 'w-full'
        }`}
      >
        <div
          className={`rounded-2xl ${
            isMobile
              ? 'border-2 border-white/20 p-2 bg-black/20'
              : ''
          }`}
        >
          {mode === 'card' && <PreviewCard data={data} theme={theme} />}
          {mode === 'detail' && <PreviewDetail data={data} theme={theme} />}
          {mode === 'stages' && <PreviewStages data={data} theme={theme} />}
        </div>

        {/* Mobile frame notch */}
        {isMobile && (
          <div className="flex justify-center mt-2">
            <div className="w-24 h-1 rounded-full bg-white/20" />
          </div>
        )}
      </motion.div>

      {/* Status */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {data.isPublished ? (
            <span className="text-emerald-400">Published</span>
          ) : (
            <span className="text-amber-400">Draft</span>
          )}
        </span>
        <span>
          {data.stages.length} stage{data.stages.length !== 1 ? 's' : ''} &middot;{' '}
          {totalPoints(data.stages)} total points
        </span>
      </div>
    </div>
  );
};

export default QuestPreview;
