'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Trophy,
  Star,
  Gift,
  Clock,
  ChevronRight,
  Snowflake,
  Sun,
  Flower2,
  Ghost,
  PartyPopper,
  Crown,
  Medal,
  Target,
  Sparkles,
  Lock,
  Users,
} from 'lucide-react';
import CountdownTimer from '@/components/quest/CountdownTimer';

// ---------- Types ----------

interface SeasonalEventData {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  border: string;
  textColor: string;
  startDate: Date;
  endDate: Date;
  quests: EventQuest[];
  rewards: EventReward[];
  leaderboard: EventLeaderboardEntry[];
  isActive: boolean;
  isPast: boolean;
}

interface EventQuest {
  id: string;
  title: string;
  difficulty: number;
  points: number;
  category: string;
  isExclusive: boolean;
}

interface EventReward {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: string;
}

interface EventLeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  avatarColor: string;
}

// ---------- Mock Data ----------

const now = new Date();
const year = now.getFullYear();

const rarityColors = {
  common: { text: 'text-slate-300', bg: 'bg-slate-500/15', border: 'border-slate-500/20' },
  rare: { text: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/20' },
  epic: { text: 'text-violet-400', bg: 'bg-violet-500/15', border: 'border-violet-500/20' },
  legendary: { text: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/20' },
};

const mockLeaderboard: EventLeaderboardEntry[] = [
  { rank: 1, name: 'Elena R.', points: 4850, avatarColor: 'bg-amber-500' },
  { rank: 2, name: 'Carlos M.', points: 4200, avatarColor: 'bg-violet-500' },
  { rank: 3, name: 'Sofia L.', points: 3900, avatarColor: 'bg-cyan-500' },
  { rank: 4, name: 'Diego P.', points: 3550, avatarColor: 'bg-emerald-500' },
  { rank: 5, name: 'Laura G.', points: 3100, avatarColor: 'bg-rose-500' },
];

const mockRewards: EventReward[] = [
  { id: 'r1', name: 'Spring Explorer Badge', description: 'Complete 3 spring quests', icon: Flower2, rarity: 'common', requirement: '3 quests completed' },
  { id: 'r2', name: 'Season Champion', description: 'Reach top 10 in event leaderboard', icon: Trophy, rarity: 'rare', requirement: 'Top 10 ranking' },
  { id: 'r3', name: 'Flawless Run', description: 'Complete a quest with 100% score', icon: Star, rarity: 'epic', requirement: 'Perfect score' },
  { id: 'r4', name: 'Event Legend', description: 'Complete all event quests', icon: Crown, rarity: 'legendary', requirement: 'All quests done' },
];

const mockQuests: EventQuest[] = [
  { id: 'q1', title: 'The Blooming Garden Mystery', difficulty: 4, points: 500, category: 'mystery', isExclusive: true },
  { id: 'q2', title: 'Spring Harvest Trail', difficulty: 3, points: 350, category: 'nature', isExclusive: true },
  { id: 'q3', title: 'Hidden Courtyard Secrets', difficulty: 6, points: 750, category: 'adventure', isExclusive: false },
  { id: 'q4', title: 'Botanical Explorer', difficulty: 2, points: 250, category: 'educational', isExclusive: true },
  { id: 'q5', title: 'The Perfume Maker Quest', difficulty: 5, points: 600, category: 'cultural', isExclusive: true },
];

const events: SeasonalEventData[] = [
  {
    id: 'spring-bloom-2026',
    name: 'Spring Bloom 2026',
    description: 'Nature quests bloom with new adventures and discoveries! Explore gardens, parks, and hidden green corners of the city.',
    icon: Flower2,
    gradient: 'from-pink-600/30 via-emerald-600/20 to-pink-600/30',
    border: 'border-pink-500/30',
    textColor: 'text-pink-400',
    startDate: new Date(year, 2, 20), // Mar 20
    endDate: new Date(year, 5, 20), // Jun 20
    quests: mockQuests,
    rewards: mockRewards,
    leaderboard: mockLeaderboard,
    isActive: true,
    isPast: false,
  },
  {
    id: 'carnival-2026',
    name: 'Carnival Fiesta 2026',
    description: 'Dance through colorful quests and win festive rewards during the carnival season!',
    icon: PartyPopper,
    gradient: 'from-fuchsia-600/30 via-cyan-600/20 to-yellow-600/30',
    border: 'border-fuchsia-500/30',
    textColor: 'text-fuchsia-400',
    startDate: new Date(year, 1, 10),
    endDate: new Date(year, 2, 5),
    quests: mockQuests.slice(0, 3),
    rewards: mockRewards.slice(0, 2),
    leaderboard: mockLeaderboard,
    isActive: false,
    isPast: true,
  },
  {
    id: 'summer-festival-2026',
    name: 'Summer Festival 2026',
    description: 'Soak up the sun with epic outdoor exploration quests all summer long!',
    icon: Sun,
    gradient: 'from-yellow-600/30 via-orange-600/20 to-yellow-600/30',
    border: 'border-yellow-500/30',
    textColor: 'text-yellow-400',
    startDate: new Date(year, 5, 21),
    endDate: new Date(year, 8, 22),
    quests: [],
    rewards: mockRewards.slice(0, 3),
    leaderboard: [],
    isActive: false,
    isPast: false,
  },
  {
    id: 'halloween-2026',
    name: 'Noche de Terror 2026',
    description: 'Brave spine-chilling mystery quests this Halloween season!',
    icon: Ghost,
    gradient: 'from-orange-600/30 via-purple-600/20 to-orange-600/30',
    border: 'border-orange-500/30',
    textColor: 'text-orange-400',
    startDate: new Date(year, 9, 20),
    endDate: new Date(year, 10, 5),
    quests: [],
    rewards: mockRewards.slice(0, 2),
    leaderboard: [],
    isActive: false,
    isPast: false,
  },
  {
    id: 'christmas-2026',
    name: 'Winter Wonderland 2026',
    description: 'Magical holiday quests with festive surprises and seasonal rewards!',
    icon: Snowflake,
    gradient: 'from-red-600/30 via-emerald-600/20 to-red-600/30',
    border: 'border-red-500/30',
    textColor: 'text-red-400',
    startDate: new Date(year, 11, 15),
    endDate: new Date(year + 1, 0, 6),
    quests: [],
    rewards: mockRewards.slice(0, 3),
    leaderboard: [],
    isActive: false,
    isPast: false,
  },
];

// ---------- Sub-components ----------

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

type Tab = 'quests' | 'leaderboard' | 'rewards';

function EventQuestCard({ quest }: { quest: EventQuest }) {
  const diffColors = quest.difficulty <= 3 ? 'text-emerald-400' : quest.difficulty <= 6 ? 'text-amber-400' : 'text-red-400';
  return (
    <motion.div
      whileHover={{ scale: 1.02, x: 4 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 cursor-pointer transition-colors"
    >
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
        <Target size={18} className="text-violet-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-white truncate">{quest.title}</p>
          {quest.isExclusive && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-bold uppercase">
              Exclusive
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="capitalize">{quest.category}</span>
          <span className={diffColors}>Difficulty {quest.difficulty}/10</span>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-amber-400">{quest.points}</p>
        <p className="text-[10px] text-slate-600">points</p>
      </div>
    </motion.div>
  );
}

function EventLeaderboardRow({ entry }: { entry: EventLeaderboardEntry }) {
  const rankConfig: Record<number, { icon: React.ElementType; color: string }> = {
    1: { icon: Crown, color: 'text-amber-400' },
    2: { icon: Medal, color: 'text-slate-300' },
    3: { icon: Medal, color: 'text-amber-600' },
  };
  const config = rankConfig[entry.rank];

  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors"
    >
      <div className="w-8 text-center">
        {config ? (
          <config.icon size={18} className={config.color} />
        ) : (
          <span className="text-sm font-bold text-slate-500">#{entry.rank}</span>
        )}
      </div>
      <div className={`w-8 h-8 rounded-full ${entry.avatarColor} flex items-center justify-center text-xs font-bold text-white`}>
        {entry.name[0]}
      </div>
      <span className="flex-1 text-sm font-medium text-white">{entry.name}</span>
      <span className="text-sm font-bold text-amber-400">{entry.points.toLocaleString()}</span>
    </motion.div>
  );
}

function EventRewardCard({ reward }: { reward: EventReward }) {
  const rarity = rarityColors[reward.rarity];
  const Icon = reward.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className={`p-4 rounded-xl ${rarity.bg} border ${rarity.border} text-center`}
    >
      <motion.div
        animate={reward.rarity === 'legendary' ? { rotate: [0, -5, 5, 0] } : undefined}
        transition={{ duration: 3, repeat: Infinity }}
        className="mb-2"
      >
        <Icon size={28} className={`mx-auto ${rarity.text}`} />
      </motion.div>
      <p className={`text-sm font-bold ${rarity.text} mb-0.5`}>{reward.name}</p>
      <p className="text-xs text-slate-500 mb-2">{reward.description}</p>
      <span className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">{reward.rarity}</span>
    </motion.div>
  );
}

// ---------- Calendar Timeline ----------

function EventTimeline({ events: evts }: { events: SeasonalEventData[] }) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="glass rounded-2xl border border-white/10 p-6">
      <h3 className="font-heading font-bold text-white mb-4 flex items-center gap-2">
        <Calendar size={18} className="text-violet-400" />
        Event Calendar {year}
      </h3>

      <div className="relative">
        {/* Month labels */}
        <div className="grid grid-cols-12 gap-1 mb-3">
          {months.map((m) => (
            <div key={m} className="text-[10px] text-slate-600 text-center font-medium">{m}</div>
          ))}
        </div>

        {/* Timeline bar */}
        <div className="relative h-2 bg-white/5 rounded-full mb-2">
          {/* Current date indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-0 w-0.5 h-2 bg-white rounded-full z-10"
            style={{ left: `${((now.getMonth() * 30 + now.getDate()) / 365) * 100}%` }}
          />
        </div>

        {/* Event bars */}
        <div className="space-y-2 mt-4">
          {evts.map((evt) => {
            const startFraction = (evt.startDate.getMonth() * 30 + evt.startDate.getDate()) / 365;
            let endFraction = (evt.endDate.getMonth() * 30 + evt.endDate.getDate()) / 365;
            if (endFraction < startFraction) endFraction = 1; // cross-year
            const width = Math.max(endFraction - startFraction, 0.03);
            const Icon = evt.icon;

            return (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative h-7 group"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`absolute h-full rounded-lg bg-gradient-to-r ${evt.gradient} border ${evt.border} flex items-center gap-1.5 px-2 cursor-pointer overflow-hidden`}
                  style={{
                    left: `${startFraction * 100}%`,
                    width: `${width * 100}%`,
                    minWidth: 80,
                  }}
                >
                  <Icon size={12} className={evt.textColor} />
                  <span className="text-[10px] font-semibold text-white truncate">{evt.name.replace(` ${year}`, '')}</span>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------- Main Page ----------

export default function EventsPage() {
  const [selectedTab, setSelectedTab] = useState<Tab>('quests');
  const activeEvent = events.find((e) => e.isActive);
  const pastEvents = events.filter((e) => e.isPast);
  const upcomingEvents = events.filter((e) => !e.isActive && !e.isPast);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'quests', label: 'Quests', icon: Target },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'rewards', label: 'Rewards', icon: Gift },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-5xl mx-auto space-y-8 p-4 md:p-6"
    >
      {/* Page header */}
      <motion.div variants={itemVariants}>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Sparkles className="text-violet-400" />
          Seasonal Events
        </h1>
        <p className="text-slate-400">
          Special limited-time quests and rewards throughout the year.
        </p>
      </motion.div>

      {/* Active Event Banner */}
      {activeEvent && (
        <motion.div variants={itemVariants}>
          <div className={`glass rounded-2xl border ${activeEvent.border} p-6 md:p-8 relative overflow-hidden`}>
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-r ${activeEvent.gradient} opacity-30 pointer-events-none`} />

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      animate={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className={`w-12 h-12 rounded-2xl ${activeEvent.textColor === 'text-pink-400' ? 'bg-pink-500/20' : 'bg-white/10'} flex items-center justify-center`}
                    >
                      <activeEvent.icon size={24} className={activeEvent.textColor} />
                    </motion.div>
                    <div>
                      <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Active Now</span>
                      <h2 className={`font-heading text-2xl font-bold ${activeEvent.textColor}`}>
                        {activeEvent.name}
                      </h2>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mb-4 max-w-lg">
                    {activeEvent.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Target size={12} />
                      {activeEvent.quests.length} quests
                    </span>
                    <span className="flex items-center gap-1">
                      <Gift size={12} />
                      {activeEvent.rewards.length} rewards
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {activeEvent.leaderboard.length} players
                    </span>
                  </div>
                </div>

                {/* Countdown */}
                <div className="flex-shrink-0">
                  <CountdownTimer
                    targetDate={activeEvent.endDate}
                    label="Event ends in..."
                    className="!p-4 !rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      {activeEvent && (
        <motion.div variants={itemVariants}>
          <div className="flex gap-2 mb-6">
            {tabs.map((tab) => {
              const isActive = selectedTab === tab.id;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
                    ${isActive
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                      : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
                    }
                  `}
                >
                  <TabIcon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {selectedTab === 'quests' && (
              <motion.div
                key="quests"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2.5"
              >
                {activeEvent.quests.length > 0 ? (
                  activeEvent.quests.map((q) => <EventQuestCard key={q.id} quest={q} />)
                ) : (
                  <div className="glass rounded-2xl border border-white/10 p-8 text-center">
                    <Lock size={32} className="text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500">Quests will be revealed when the event starts!</p>
                  </div>
                )}
              </motion.div>
            )}

            {selectedTab === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass rounded-2xl border border-white/10 p-4"
              >
                {activeEvent.leaderboard.length > 0 ? (
                  <div className="space-y-1">
                    {activeEvent.leaderboard.map((entry) => (
                      <EventLeaderboardRow key={entry.rank} entry={entry} />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Trophy size={32} className="text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500">Leaderboard will appear once players start competing!</p>
                  </div>
                )}
              </motion.div>
            )}

            {selectedTab === 'rewards' && (
              <motion.div
                key="rewards"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3"
              >
                {activeEvent.rewards.map((r) => (
                  <EventRewardCard key={r.id} reward={r} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Calendar Timeline */}
      <motion.div variants={itemVariants}>
        <EventTimeline events={events} />
      </motion.div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <motion.div variants={itemVariants}>
          <h2 className="font-heading text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock size={18} className="text-violet-400" />
            Upcoming Events
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {upcomingEvents.map((evt) => {
              const Icon = evt.icon;
              return (
                <motion.div
                  key={evt.id}
                  whileHover={{ scale: 1.02 }}
                  className={`glass rounded-2xl border ${evt.border} p-5 relative overflow-hidden cursor-pointer`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${evt.gradient} opacity-20 pointer-events-none`} />
                  <div className="relative z-10 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Icon size={20} className={evt.textColor} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-heading font-bold ${evt.textColor} mb-1`}>{evt.name}</h3>
                      <p className="text-xs text-slate-400 mb-2 line-clamp-2">{evt.description}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-600">
                        <Calendar size={10} />
                        <span>
                          {evt.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {evt.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-600 flex-shrink-0 mt-1" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Past Events Archive */}
      {pastEvents.length > 0 && (
        <motion.div variants={itemVariants}>
          <h2 className="font-heading text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock size={18} className="text-slate-500" />
            Past Events
          </h2>
          <div className="space-y-3">
            {pastEvents.map((evt) => {
              const Icon = evt.icon;
              return (
                <motion.div
                  key={evt.id}
                  whileHover={{ x: 4 }}
                  className="glass rounded-xl border border-white/5 p-4 flex items-center gap-3 opacity-60 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-300">{evt.name}</p>
                    <p className="text-[10px] text-slate-600">
                      {evt.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {evt.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">Ended</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
