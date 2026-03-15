'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Compass,
  Trophy,
  BarChart3,
  Play,
  Star,
  Zap,
  Shield,
  MapPin,
  Clock,
  Users,
  ArrowRight,
  Sparkles,
  Crown,
  Flame,
  Target,
} from 'lucide-react';
import InviteLink from '@/components/social/InviteLink';

// ---------- Types ----------

type ShareType = 'quest' | 'achievement' | 'stats' | 'replay';

// ---------- Mock Data ----------

const mockQuest = {
  title: 'The Lost Temple of Madrid',
  description: 'Embark on an epic journey through the ancient streets of Madrid. Discover hidden temples, solve cryptic puzzles, and unravel mysteries that have been buried for centuries.',
  rating: 4.8,
  ratingCount: 234,
  difficulty: 'Hard',
  duration: '2-3 hours',
  stages: 6,
  players: 1247,
  location: 'Madrid, Spain',
  tags: ['Mystery', 'History', 'Exploration'],
  creator: 'QuestMaster Team',
};

const mockAchievement = {
  name: 'Legendary Explorer',
  description: 'Visit 100 unique locations across 10 different quests',
  rarity: 'legendary' as const,
  earnedBy: '2.3%',
  earnedDate: 'March 14, 2026',
  category: 'Exploration',
  points: 500,
};

const mockStats = {
  playerName: 'Elena Voss',
  level: 42,
  totalPoints: 14200,
  questsCompleted: 87,
  achievements: 34,
  streak: 15,
  rank: 3,
  avgScore: 92,
  hoursPlayed: 156,
  favoriteCategory: 'Mystery',
};

const mockReplay = {
  questTitle: 'Mystery at the Museum',
  playerName: 'Marcus Chen',
  score: 980,
  maxScore: 1000,
  duration: '47m',
  stagesCompleted: '6/6',
  highlights: ['Perfect negotiation', 'Found secret passage', 'Speed bonus'],
};

// ---------- Helpers ----------

const rarityConfig: Record<string, { gradient: string; border: string; glow: string; text: string }> = {
  common: { gradient: 'from-slate-400 to-slate-500', border: 'border-slate-400/40', glow: 'shadow-slate-400/20', text: 'text-slate-300' },
  rare: { gradient: 'from-blue-400 to-blue-500', border: 'border-blue-400/40', glow: 'shadow-blue-400/20', text: 'text-blue-300' },
  epic: { gradient: 'from-violet-400 to-fuchsia-500', border: 'border-violet-400/40', glow: 'shadow-violet-400/20', text: 'text-violet-300' },
  legendary: { gradient: 'from-amber-400 to-orange-500', border: 'border-amber-400/40', glow: 'shadow-amber-400/30', text: 'text-amber-300' },
};

// ---------- Share Views ----------

function QuestShare() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Quest Card */}
      <div className="glass rounded-3xl border border-white/10 overflow-hidden">
        {/* Map preview placeholder */}
        <div className="h-48 bg-gradient-to-br from-violet-900/40 via-navy-900 to-fuchsia-900/40 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-24 h-24 rounded-full bg-violet-500/20 flex items-center justify-center"
            >
              <MapPin className="w-10 h-10 text-violet-400" />
            </motion.div>
          </div>
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div className="flex gap-2">
              {mockQuest.tags.map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-white">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <h2 className="font-heading text-2xl font-bold text-white mb-2">{mockQuest.title}</h2>
            <p className="text-slate-400 text-sm leading-relaxed">{mockQuest.description}</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: Star, label: 'Rating', value: String(mockQuest.rating), color: 'text-amber-400' },
              { icon: Shield, label: 'Difficulty', value: mockQuest.difficulty, color: 'text-orange-400' },
              { icon: Clock, label: 'Duration', value: mockQuest.duration, color: 'text-cyan-400' },
              { icon: Users, label: 'Players', value: mockQuest.players.toLocaleString(), color: 'text-violet-400' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center p-3 rounded-xl bg-white/5">
                  <Icon className={`w-5 h-5 ${stat.color} mx-auto mb-1.5`} />
                  <p className="text-sm font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Rating stars */}
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i <= Math.round(mockQuest.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-500">({mockQuest.ratingCount} reviews)</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Compass className="w-3.5 h-3.5" />
            <span>{mockQuest.stages} stages</span>
            <span className="text-slate-700">|</span>
            <MapPin className="w-3.5 h-3.5" />
            <span>{mockQuest.location}</span>
          </div>
        </div>
      </div>

      <InviteLink inviteUrl={`https://questmaster.app/quest/${mockQuest.title.toLowerCase().replace(/\s+/g, '-')}`} />
    </motion.div>
  );
}

function AchievementShare() {
  const rarity = rarityConfig[mockAchievement.rarity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div className={`glass rounded-3xl border ${rarity.border} overflow-hidden relative`}>
        {/* Animated glow background */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${rarity.gradient} opacity-5`}
          animate={{ opacity: [0.03, 0.08, 0.03] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        <div className="relative p-8 text-center">
          {/* Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="relative inline-block mb-6"
          >
            <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${rarity.gradient} flex items-center justify-center shadow-2xl ${rarity.glow}`}>
              <Trophy className="w-14 h-14 text-white" />
            </div>
            {/* Sparkle effects */}
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  top: `${20 + Math.sin(i * 1.5) * 30}%`,
                  left: `${20 + Math.cos(i * 1.5) * 30}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
              </motion.div>
            ))}
          </motion.div>

          <h2 className={`font-heading text-2xl font-bold ${rarity.text} mb-2`}>
            {mockAchievement.name}
          </h2>
          <p className="text-slate-400 text-sm mb-4">{mockAchievement.description}</p>

          <div className="flex items-center justify-center gap-4 mb-6">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r ${rarity.gradient} text-white`}>
              {mockAchievement.rarity}
            </span>
            <span className="text-xs text-slate-500">
              Earned by {mockAchievement.earnedBy} of players
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-white/5">
              <Zap className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{mockAchievement.points}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Points</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5">
              <Target className="w-5 h-5 text-violet-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-white">{mockAchievement.category}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Category</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5">
              <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-white">{mockAchievement.earnedDate}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Earned</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatsShare() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="glass rounded-3xl border border-white/10 overflow-hidden">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-violet-600/30 via-fuchsia-600/20 to-emerald-600/30 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-40" />
        </div>

        <div className="px-6 pb-6 -mt-10 relative">
          {/* Avatar & Name */}
          <div className="flex items-end gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center font-bold text-white text-2xl shadow-xl border-4 border-navy-900">
              EV
            </div>
            <div className="pb-1">
              <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
                {mockStats.playerName}
                {mockStats.rank <= 3 && <Crown className="w-5 h-5 text-amber-400" />}
              </h2>
              <p className="text-sm text-slate-400">Level {mockStats.level} &middot; Rank #{mockStats.rank}</p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Points', value: mockStats.totalPoints.toLocaleString(), icon: Zap, color: 'text-emerald-400' },
              { label: 'Quests', value: String(mockStats.questsCompleted), icon: Compass, color: 'text-violet-400' },
              { label: 'Badges', value: String(mockStats.achievements), icon: Trophy, color: 'text-amber-400' },
              { label: 'Streak', value: `${mockStats.streak}d`, icon: Flame, color: 'text-orange-400' },
              { label: 'Avg Score', value: `${mockStats.avgScore}%`, icon: Target, color: 'text-cyan-400' },
              { label: 'Hours', value: String(mockStats.hoursPlayed), icon: Clock, color: 'text-rose-400' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center p-3 rounded-xl bg-white/5 border border-white/5"
                >
                  <Icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span>Favorite category: <span className="text-white font-medium">{mockStats.favoriteCategory}</span></span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ReplayShare() {
  const scorePercent = (mockReplay.score / mockReplay.maxScore) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="glass rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/20">
              <Play className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-white">{mockReplay.questTitle}</h2>
              <p className="text-xs text-slate-500">by {mockReplay.playerName}</p>
            </div>
          </div>

          {/* Score circle */}
          <div className="flex justify-center py-4">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <motion.circle
                  cx="60" cy="60" r="52" fill="none" stroke="url(#scoreGradient)" strokeWidth="8" strokeLinecap="round"
                  initial={{ strokeDasharray: '0 327' }}
                  animate={{ strokeDasharray: `${(scorePercent / 100) * 327} 327` }}
                  transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-heading font-bold text-white">{mockReplay.score}</span>
                <span className="text-xs text-slate-500">/{mockReplay.maxScore}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white/5 text-center">
              <Clock className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-white">{mockReplay.duration}</p>
              <p className="text-[10px] text-slate-500">Duration</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 text-center">
              <Target className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-white">{mockReplay.stagesCompleted}</p>
              <p className="text-[10px] text-slate-500">Stages</p>
            </div>
          </div>

          {/* Highlights */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Highlights</p>
            <div className="space-y-2">
              {mockReplay.highlights.map((h, i) => (
                <motion.div
                  key={h}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-sm text-emerald-300">{h}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ---------- Main Page ----------

export default function SharePageClient() {
  const params = useParams();
  const type = (params?.type as ShareType) || 'quest';

  const renderShareContent = () => {
    switch (type) {
      case 'quest':
        return <QuestShare />;
      case 'achievement':
        return <AchievementShare />;
      case 'stats':
        return <StatsShare />;
      case 'replay':
        return <ReplayShare />;
      default:
        return <QuestShare />;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Share content */}
        {renderShareContent()}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass rounded-2xl p-8 border border-white/10 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/5 to-emerald-600/10" />
          <div className="relative">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-violet-500/30"
            >
              <Compass className="w-8 h-8 text-white" />
            </motion.div>
            <h3 className="font-heading text-xl font-bold text-white mb-2">Join QuestMaster</h3>
            <p className="text-sm text-slate-400 mb-6">Start your own adventure and explore amazing quests</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow flex items-center gap-2 mx-auto"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
