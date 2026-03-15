'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2,
  Link2,
  Check,
  Star,
  Clock,
  Trophy,
  ChevronDown,
} from 'lucide-react';
import type { Quest, Progress, QuestCategory } from '@/types';
import { useToast } from '@/components/ui/Toast';

// ---------- Types ----------

interface ShareCardProps {
  quest: Quest;
  progress: Progress;
  userName: string;
  userAvatar?: string;
  score?: number;
  className?: string;
}

// ---------- Config ----------

const categoryGradients: Record<QuestCategory, string> = {
  adventure: 'from-violet-600 to-indigo-700',
  mystery: 'from-slate-700 to-zinc-800',
  cultural: 'from-amber-600 to-orange-700',
  culinary: 'from-rose-600 to-pink-700',
  nature: 'from-emerald-600 to-teal-700',
  educational: 'from-blue-600 to-cyan-700',
  urban: 'from-gray-600 to-neutral-700',
  team_building: 'from-fuchsia-600 to-purple-700',
};

// ---------- Helpers ----------

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

function getStarCount(points: number, total: number): number {
  const pct = total > 0 ? (points / total) * 100 : 0;
  if (pct >= 90) return 5;
  if (pct >= 75) return 4;
  if (pct >= 60) return 3;
  if (pct >= 40) return 2;
  return 1;
}

function getShareText(quest: Quest, progress: Progress, userName: string): string {
  const stars = getStarCount(progress.totalPoints, quest.totalPoints);
  return `I just completed "${quest.title}" on QuestMaster with ${progress.totalPoints} points and ${'*'.repeat(stars)} stars! Can you beat my score?`;
}

// ---------- Visual Card ----------

function VisualCard({
  quest,
  progress,
  userName,
  userAvatar,
}: Omit<ShareCardProps, 'className' | 'score'>) {
  const gradient = categoryGradients[quest.category];
  const stars = getStarCount(progress.totalPoints, quest.totalPoints);

  return (
    <div
      className={`relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden bg-gradient-to-br ${gradient} p-6 shadow-2xl`}
    >
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)',
          }}
        />
      </div>

      <div className="relative">
        {/* QuestMaster branding */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Trophy size={16} className="text-white" />
            </div>
            <span className="text-white/80 text-xs font-bold tracking-wider uppercase">
              QuestMaster
            </span>
          </div>
          <span className="text-white/50 text-[10px]">Quest Complete</span>
        </div>

        {/* Quest title */}
        <h3 className="text-xl font-bold text-white mb-1 leading-tight">
          {quest.title}
        </h3>
        <p className="text-white/60 text-xs mb-6 capitalize">
          {quest.category.replace('_', ' ')} &middot; {quest.difficulty}
        </p>

        {/* Score and stars */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">
              Score
            </p>
            <p className="text-4xl font-bold text-white">
              {progress.totalPoints}
              <span className="text-lg text-white/40">/{quest.totalPoints}</span>
            </p>
          </div>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={20}
                className={s <= stars ? 'text-amber-300' : 'text-white/20'}
                fill={s <= stars ? 'currentColor' : 'none'}
              />
            ))}
          </div>
        </div>

        {/* Time and stats */}
        <div className="flex items-center gap-4 mb-6 text-xs text-white/60">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatDuration(progress.totalDuration)}
          </span>
          <span>
            {progress.completedStages.length}/{quest.stages.length} stages
          </span>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 pt-4 border-t border-white/10">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white overflow-hidden">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-full h-full object-cover"
              />
            ) : (
              userName
                .split(' ')
                .map((w) => w[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{userName}</p>
            <p className="text-[10px] text-white/40">Player</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Share Dropdown ----------

function ShareDropdown({
  visible,
  shareText,
  shareUrl,
  onCopy,
}: {
  visible: boolean;
  shareText: string;
  shareUrl: string;
  onCopy: () => void;
}) {
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);

  const channels = [
    {
      name: 'Copy Link',
      icon: Link2,
      action: onCopy,
      color: 'text-slate-300',
    },
    {
      name: 'Twitter / X',
      icon: Share2,
      action: () =>
        window.open(
          `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
          '_blank',
        ),
      color: 'text-sky-400',
    },
    {
      name: 'WhatsApp',
      icon: Share2,
      action: () =>
        window.open(
          `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
          '_blank',
        ),
      color: 'text-emerald-400',
    },
    {
      name: 'Telegram',
      icon: Share2,
      action: () =>
        window.open(
          `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
          '_blank',
        ),
      color: 'text-blue-400',
    },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full mt-2 right-0 z-20 w-48 py-1.5 rounded-xl bg-navy-950/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40"
        >
          {channels.map((ch) => (
            <button
              key={ch.name}
              onClick={ch.action}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-colors"
            >
              <ch.icon size={14} className={ch.color} />
              {ch.name}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------- Main Component ----------

const ShareCard: React.FC<ShareCardProps> = ({
  quest,
  progress,
  userName,
  userAvatar,
  className = '',
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/quests/${quest.id}`
      : '';
  const shareText = getShareText(quest, progress, userName);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      toast('success', 'Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('error', 'Failed to copy link');
    }
    setDropdownOpen(false);
  }, [shareText, shareUrl, toast]);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [dropdownOpen]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-4 ${className}`}
    >
      {/* Visual card preview */}
      <VisualCard
        quest={quest}
        progress={progress}
        userName={userName}
        userAvatar={userAvatar}
      />

      {/* Share button */}
      <div className="flex justify-center" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-300 text-sm font-medium hover:bg-violet-500/25 transition-colors"
          >
            {copied ? (
              <Check size={16} className="text-emerald-400" />
            ) : (
              <Share2 size={16} />
            )}
            {copied ? 'Copied!' : 'Share'}
            <ChevronDown
              size={14}
              className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          <ShareDropdown
            visible={dropdownOpen}
            shareText={shareText}
            shareUrl={shareUrl}
            onCopy={handleCopy}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ShareCard;
