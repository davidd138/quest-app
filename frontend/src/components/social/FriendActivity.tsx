'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  PartyPopper,
  Trophy,
  Compass,
  TrendingUp,
  Flame,
  UserPlus,
  Shield,
  Star,
  MapPin,
} from 'lucide-react';

// ---------- Types ----------

type FriendActivityType =
  | 'quest_completed'
  | 'achievement_earned'
  | 'level_up'
  | 'streak_milestone'
  | 'new_friend'
  | 'clan_joined'
  | 'quest_started'
  | 'location_visited';

export interface FriendActivityData {
  id: string;
  friendId: string;
  friendName: string;
  friendAvatar: string | null;
  type: FriendActivityType;
  description: string;
  quest?: {
    id: string;
    title: string;
    difficulty: string;
    thumbnail?: string;
  };
  timestamp: Date;
  likes: number;
  liked?: boolean;
  congratulated?: boolean;
}

interface FriendActivityProps {
  activity: FriendActivityData;
  onLike?: (activityId: string) => void;
  onCongratulate?: (activityId: string) => void;
  index?: number;
  className?: string;
}

// ---------- Config ----------

const activityIcons: Record<FriendActivityType, { icon: React.ElementType; color: string; bg: string }> = {
  quest_completed: { icon: Trophy, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  achievement_earned: { icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/15' },
  level_up: { icon: TrendingUp, color: 'text-violet-400', bg: 'bg-violet-500/15' },
  streak_milestone: { icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/15' },
  new_friend: { icon: UserPlus, color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
  clan_joined: { icon: Shield, color: 'text-rose-400', bg: 'bg-rose-500/15' },
  quest_started: { icon: Compass, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/15' },
  location_visited: { icon: MapPin, color: 'text-teal-400', bg: 'bg-teal-500/15' },
};

const avatarGradients = [
  'from-violet-500 to-fuchsia-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-cyan-500 to-blue-500',
];

// ---------- Helpers ----------

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getGradient(name: string): string {
  return avatarGradients[name.charCodeAt(0) % avatarGradients.length];
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

const difficultyColors: Record<string, string> = {
  easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  hard: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  legendary: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
};

// ---------- Sub-components ----------

function QuestMiniCard({ quest }: { quest: NonNullable<FriendActivityData['quest']> }) {
  const diffColor = difficultyColors[quest.difficulty] || difficultyColors.easy;

  return (
    <div className="mt-3 rounded-xl p-3 bg-white/[0.03] border border-white/5 flex items-center gap-3">
      {/* Thumbnail placeholder */}
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center flex-shrink-0 border border-white/5">
        <Compass className="w-5 h-5 text-violet-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">{quest.title}</p>
        <span className={`inline-block mt-1 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${diffColor}`}>
          {quest.difficulty}
        </span>
      </div>
    </div>
  );
}

// ---------- Main Component ----------

const FriendActivity: React.FC<FriendActivityProps> = ({
  activity,
  onLike,
  onCongratulate,
  index = 0,
  className = '',
}) => {
  const [liked, setLiked] = useState(activity.liked || false);
  const [likeCount, setLikeCount] = useState(activity.likes);
  const [congratulated, setCongratulated] = useState(activity.congratulated || false);

  const config = activityIcons[activity.type];
  const Icon = config.icon;

  const handleLike = () => {
    const next = !liked;
    setLiked(next);
    setLikeCount((prev) => (next ? prev + 1 : prev - 1));
    onLike?.(activity.id);
  };

  const handleCongratulate = () => {
    if (congratulated) return;
    setCongratulated(true);
    onCongratulate?.(activity.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: 'easeOut' }}
      className={`rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-4 hover:bg-white/[0.04] transition-colors ${className}`}
    >
      <div className="flex gap-3.5">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {activity.friendAvatar ? (
            <img
              src={activity.friendAvatar}
              alt={activity.friendName}
              className="w-10 h-10 rounded-full object-cover border border-white/10"
            />
          ) : (
            <div
              className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGradient(
                activity.friendName
              )} flex items-center justify-center font-bold text-white text-xs shadow-lg`}
            >
              {getInitials(activity.friendName)}
            </div>
          )}
          {/* Activity type icon overlay */}
          <div
            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${config.bg} flex items-center justify-center border-2 border-slate-900`}
          >
            <Icon className={`w-2.5 h-2.5 ${config.color}`} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm text-slate-200">
                <span className="font-semibold text-white">{activity.friendName}</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{activity.description}</p>
            </div>
            <span className="text-[10px] text-slate-600 whitespace-nowrap flex-shrink-0">
              {timeAgo(activity.timestamp)}
            </span>
          </div>

          {/* Quest mini card if relevant */}
          {activity.quest && <QuestMiniCard quest={activity.quest} />}

          {/* Action buttons */}
          <div className="flex items-center gap-4 mt-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                liked ? 'text-rose-400' : 'text-slate-500 hover:text-rose-400'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-400' : ''}`} />
              <span className="font-medium">{likeCount}</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleCongratulate}
              disabled={congratulated}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                congratulated
                  ? 'text-amber-400'
                  : 'text-slate-500 hover:text-amber-400'
              }`}
            >
              <PartyPopper className={`w-3.5 h-3.5 ${congratulated ? 'fill-amber-400/20' : ''}`} />
              <span className="font-medium">
                {congratulated ? 'Congratulated!' : 'Congratulate'}
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FriendActivity;
