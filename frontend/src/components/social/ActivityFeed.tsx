'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Trophy,
  TrendingUp,
  UserPlus,
  Shield,
  Compass,
  Flame,
  Heart,
  MessageCircle,
  Zap,
  Star,
  Sparkles,
} from 'lucide-react';

// ---------- Types ----------

type ActivityType =
  | 'quest_completed'
  | 'achievement_earned'
  | 'level_up'
  | 'friend_joined'
  | 'clan_joined'
  | 'quest_created'
  | 'streak_milestone';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  userName: string;
  userAvatar: string | null;
  timestamp: Date;
  content: {
    title: string;
    subtitle?: string;
    points?: number;
    level?: number;
    streak?: number;
    questTitle?: string;
    achievementName?: string;
    clanName?: string;
    rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  };
  likes: number;
  comments: number;
  liked?: boolean;
}

interface ActivityFeedProps {
  initialItems?: ActivityItem[];
  onLoadMore?: () => Promise<ActivityItem[]>;
}

// ---------- Config ----------

const activityConfig: Record<
  ActivityType,
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  quest_completed: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    label: 'completed a quest',
  },
  achievement_earned: {
    icon: Trophy,
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    label: 'earned an achievement',
  },
  level_up: {
    icon: TrendingUp,
    color: 'text-violet-400',
    bg: 'bg-violet-500/15',
    label: 'leveled up',
  },
  friend_joined: {
    icon: UserPlus,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/15',
    label: 'joined QuestMaster',
  },
  clan_joined: {
    icon: Shield,
    color: 'text-rose-400',
    bg: 'bg-rose-500/15',
    label: 'joined a clan',
  },
  quest_created: {
    icon: Compass,
    color: 'text-fuchsia-400',
    bg: 'bg-fuchsia-500/15',
    label: 'created a quest',
  },
  streak_milestone: {
    icon: Flame,
    color: 'text-orange-400',
    bg: 'bg-orange-500/15',
    label: 'hit a streak milestone',
  },
};

const rarityColors: Record<string, { bg: string; border: string; text: string }> = {
  common: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-300' },
  rare: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-300' },
  epic: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-300' },
  legendary: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-300' },
};

// ---------- Helpers ----------

const avatarGradients = [
  'from-violet-500 to-fuchsia-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-cyan-500 to-blue-500',
  'from-indigo-500 to-violet-500',
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getGradient(name: string) {
  return avatarGradients[name.charCodeAt(0) % avatarGradients.length];
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'hace un momento';
  if (diffMin < 60) return `hace ${diffMin} minuto${diffMin !== 1 ? 's' : ''}`;
  if (diffHr < 24) return `hace ${diffHr} hora${diffHr !== 1 ? 's' : ''}`;
  if (diffDay < 7) return `hace ${diffDay} dia${diffDay !== 1 ? 's' : ''}`;
  return date.toLocaleDateString();
}

// ---------- Mock data generator ----------

function generateMockActivities(): ActivityItem[] {
  const now = Date.now();
  return [
    {
      id: '1',
      type: 'quest_completed',
      userName: 'Elena Voss',
      userAvatar: null,
      timestamp: new Date(now - 5 * 60000),
      content: { title: 'The Lost Temple of Madrid', points: 450, questTitle: 'The Lost Temple of Madrid' },
      likes: 12,
      comments: 3,
    },
    {
      id: '2',
      type: 'achievement_earned',
      userName: 'Marcus Chen',
      userAvatar: null,
      timestamp: new Date(now - 15 * 60000),
      content: { title: 'Speed Demon', achievementName: 'Speed Demon', rarity: 'epic', subtitle: 'Complete 10 quests under 30 minutes' },
      likes: 24,
      comments: 7,
    },
    {
      id: '3',
      type: 'level_up',
      userName: 'Sofia Ramirez',
      userAvatar: null,
      timestamp: new Date(now - 45 * 60000),
      content: { title: 'Reached Level 55', level: 55 },
      likes: 31,
      comments: 5,
    },
    {
      id: '4',
      type: 'streak_milestone',
      userName: 'James Wright',
      userAvatar: null,
      timestamp: new Date(now - 2 * 3600000),
      content: { title: '30-Day Streak!', streak: 30 },
      likes: 45,
      comments: 12,
    },
    {
      id: '5',
      type: 'friend_joined',
      userName: 'Aiko Tanaka',
      userAvatar: null,
      timestamp: new Date(now - 4 * 3600000),
      content: { title: 'Joined QuestMaster', subtitle: 'Welcome to the adventure!' },
      likes: 8,
      comments: 2,
    },
    {
      id: '6',
      type: 'clan_joined',
      userName: 'Liam O\'Brien',
      userAvatar: null,
      timestamp: new Date(now - 6 * 3600000),
      content: { title: 'Night Walkers', clanName: 'Night Walkers' },
      likes: 15,
      comments: 4,
    },
    {
      id: '7',
      type: 'quest_created',
      userName: 'Elena Voss',
      userAvatar: null,
      timestamp: new Date(now - 8 * 3600000),
      content: { title: 'Secrets of the Old Town', questTitle: 'Secrets of the Old Town', subtitle: 'A mysterious quest through hidden alleyways' },
      likes: 19,
      comments: 6,
    },
    {
      id: '8',
      type: 'achievement_earned',
      userName: 'Marcus Chen',
      userAvatar: null,
      timestamp: new Date(now - 12 * 3600000),
      content: { title: 'Legendary Explorer', achievementName: 'Legendary Explorer', rarity: 'legendary', subtitle: 'Visit 100 unique locations' },
      likes: 67,
      comments: 18,
    },
  ];
}

// ---------- Sub-components ----------

function ActivityIcon({ type }: { type: ActivityType }) {
  const config = activityConfig[type];
  const Icon = config.icon;

  return (
    <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
      <Icon className={`w-5 h-5 ${config.color}`} />
    </div>
  );
}

function RichContent({ item }: { item: ActivityItem }) {
  const { type, content } = item;

  if (type === 'achievement_earned' && content.rarity) {
    const rarity = rarityColors[content.rarity] || rarityColors.common;
    return (
      <div className={`mt-3 rounded-xl p-3 border ${rarity.border} ${rarity.bg} flex items-center gap-3`}>
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center flex-shrink-0">
          <Trophy className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <p className={`text-sm font-semibold ${rarity.text}`}>{content.achievementName}</p>
          {content.subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{content.subtitle}</p>
          )}
        </div>
        <span className={`ml-auto text-[10px] font-bold uppercase tracking-wider ${rarity.text}`}>
          {content.rarity}
        </span>
      </div>
    );
  }

  if (type === 'quest_completed' && content.questTitle) {
    return (
      <div className="mt-3 rounded-xl p-3 border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center flex-shrink-0">
          <Compass className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-300">{content.questTitle}</p>
          {content.points && (
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-400" />+{content.points} points
            </p>
          )}
        </div>
      </div>
    );
  }

  if (type === 'level_up' && content.level) {
    return (
      <div className="mt-3 rounded-xl p-3 border border-violet-500/20 bg-violet-500/5 flex items-center gap-3">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
          className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 flex items-center justify-center flex-shrink-0"
        >
          <Star className="w-5 h-5 text-violet-400" />
        </motion.div>
        <div>
          <p className="text-sm font-semibold text-violet-300">Level {content.level}</p>
          <p className="text-xs text-slate-500">New abilities unlocked!</p>
        </div>
      </div>
    );
  }

  if (type === 'streak_milestone' && content.streak) {
    return (
      <div className="mt-3 rounded-xl p-3 border border-orange-500/20 bg-orange-500/5 flex items-center gap-3">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/30 to-amber-500/30 flex items-center justify-center flex-shrink-0"
        >
          <Flame className="w-5 h-5 text-orange-400" />
        </motion.div>
        <div>
          <p className="text-sm font-semibold text-orange-300">{content.streak}-Day Streak!</p>
          <p className="text-xs text-slate-500">Incredible dedication</p>
        </div>
        <Sparkles className="w-5 h-5 text-amber-400 ml-auto" />
      </div>
    );
  }

  return null;
}

function ActivityEntry({ item, index }: { item: ActivityItem; index: number }) {
  const [liked, setLiked] = useState(item.liked || false);
  const [likeCount, setLikeCount] = useState(item.likes);
  const config = activityConfig[item.type];

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: 'easeOut' }}
      className="p-5 hover:bg-white/[0.02] transition-colors group"
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className={`w-11 h-11 rounded-full bg-gradient-to-br ${getGradient(
              item.userName
            )} flex items-center justify-center font-bold text-white text-sm shadow-lg`}
          >
            {getInitials(item.userName)}
          </div>
          {/* Activity type mini icon */}
          <div
            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${config.bg} flex items-center justify-center border-2 border-navy-900`}
          >
            {(() => {
              const Icon = config.icon;
              return <Icon className={`w-2.5 h-2.5 ${config.color}`} />;
            })()}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-200">
            <span className="font-semibold text-white">{item.userName}</span>{' '}
            <span className="text-slate-400">{config.label}</span>
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{timeAgo(item.timestamp)}</p>

          {/* Rich content */}
          <RichContent item={item} />

          {/* Actions */}
          <div className="flex items-center gap-5 mt-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                liked ? 'text-rose-400' : 'text-slate-500 hover:text-rose-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-rose-400' : ''}`} />
              <span className="font-medium">{likeCount}</span>
            </motion.button>

            <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-400 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span className="font-medium">{item.comments}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ---------- Main Component ----------

export default function ActivityFeed({ initialItems, onLoadMore }: ActivityFeedProps) {
  const [items, setItems] = useState<ActivityItem[]>(initialItems || generateMockActivities());
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !onLoadMore) return;
    setLoading(true);
    try {
      const newItems = await onLoadMore();
      setItems((prev) => [...prev, ...newItems]);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [loading, onLoadMore]);

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    if (!onLoadMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, onLoadMore]);

  return (
    <div className="glass rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center border border-violet-500/20">
            <Zap className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-white">Activity Feed</h3>
            <p className="text-xs text-slate-500">Latest from your network</p>
          </div>
        </div>
      </div>

      {/* Feed items */}
      <div className="divide-y divide-white/5">
        <AnimatePresence>
          {items.map((item, i) => (
            <ActivityEntry key={item.id} item={item} index={i} />
          ))}
        </AnimatePresence>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="p-6 flex justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-6 h-6 rounded-full border-2 border-violet-500/30 border-t-violet-500"
          />
        </div>
      )}

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}
