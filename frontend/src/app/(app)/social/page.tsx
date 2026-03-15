'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Swords,
  Share2,
  Crown,
  MessageCircle,
  Trophy,
  Flame,
  Globe,
  ChevronRight,
  Search,
  Plus,
  Check,
  Sparkles,
  Zap,
  Target,
  Star,
} from 'lucide-react';

// ---------- Mock Data ----------

const mockFriends = [
  { id: '1', name: 'Elena Voss', avatar: null, online: true, level: 42, lastActive: 'now', questsCompleted: 87, points: 14200 },
  { id: '2', name: 'Marcus Chen', avatar: null, online: true, level: 38, lastActive: 'now', questsCompleted: 71, points: 11800 },
  { id: '3', name: 'Sofia Ramirez', avatar: null, online: false, level: 55, lastActive: '2h ago', questsCompleted: 134, points: 22100 },
  { id: '4', name: 'James Wright', avatar: null, online: true, level: 29, lastActive: 'now', questsCompleted: 45, points: 7600 },
  { id: '5', name: 'Aiko Tanaka', avatar: null, online: false, level: 61, lastActive: '5h ago', questsCompleted: 156, points: 25800 },
  { id: '6', name: 'Liam O\'Brien', avatar: null, online: false, level: 33, lastActive: '1d ago', questsCompleted: 52, points: 8900 },
];

const mockActivity = [
  { id: '1', user: 'Elena Voss', action: 'completed', quest: 'The Lost Temple of Madrid', points: 450, time: '5 min ago', type: 'completion' },
  { id: '2', user: 'Marcus Chen', action: 'earned achievement', quest: 'Speed Demon', points: 0, time: '12 min ago', type: 'achievement' },
  { id: '3', user: 'Sofia Ramirez', action: 'started', quest: 'Culinary Secrets of Barcelona', points: 0, time: '1h ago', type: 'start' },
  { id: '4', user: 'James Wright', action: 'scored #1 on', quest: 'Mystery at the Museum', points: 980, time: '2h ago', type: 'leaderboard' },
  { id: '5', user: 'Aiko Tanaka', action: 'completed', quest: 'Urban Explorer: Tokyo Edition', points: 720, time: '3h ago', type: 'completion' },
  { id: '6', user: 'Elena Voss', action: 'joined team', quest: 'Night Walkers', points: 0, time: '5h ago', type: 'team' },
];

const mockTeams = [
  { id: '1', name: 'Night Walkers', members: 4, maxMembers: 5, activeQuest: 'The Midnight Mystery', xp: 12400, rank: 3 },
  { id: '2', name: 'Quest Crushers', members: 5, maxMembers: 5, activeQuest: 'Legendary Treasure Hunt', xp: 18900, rank: 1 },
  { id: '3', name: 'Explorer\'s Guild', members: 3, maxMembers: 6, activeQuest: null, xp: 8200, rank: 7 },
];

// ---------- Animations ----------

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

// ---------- Sub-components ----------

function OnlineIndicator({ online }: { online: boolean }) {
  return (
    <div className="relative">
      <div className={`w-3 h-3 rounded-full ${online ? 'bg-emerald-400' : 'bg-slate-600'}`} />
      {online && (
        <motion.div
          className="absolute inset-0 rounded-full bg-emerald-400"
          animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </div>
  );
}

function AvatarCircle({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const colors = [
    'from-violet-500 to-fuchsia-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
    'from-cyan-500 to-blue-500',
    'from-indigo-500 to-violet-500',
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;
  const sizeClasses = { sm: 'w-8 h-8 text-xs', md: 'w-11 h-11 text-sm', lg: 'w-14 h-14 text-base' };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center font-bold text-white shadow-lg`}>
      {initials}
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const config: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    completion: { icon: Check, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    achievement: { icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/15' },
    start: { icon: Zap, color: 'text-violet-400', bg: 'bg-violet-500/15' },
    leaderboard: { icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/15' },
    team: { icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
  };
  const c = config[type] || config.completion;
  const Icon = c.icon;

  return (
    <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
      <Icon className={`w-4 h-4 ${c.color}`} />
    </div>
  );
}

// ---------- Tabs ----------

type TabId = 'friends' | 'activity' | 'teams' | 'challenges';

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'friends', label: 'Friends', icon: Users },
  { id: 'activity', label: 'Activity', icon: Globe },
  { id: 'teams', label: 'Teams', icon: Swords },
  { id: 'challenges', label: 'Challenges', icon: Target },
];

// ---------- Main Page ----------

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState<TabId>('friends');
  const [friendSearch, setFriendSearch] = useState('');

  const filteredFriends = mockFriends.filter(f =>
    f.name.toLowerCase().includes(friendSearch.toLowerCase()),
  );
  const onlineFriends = mockFriends.filter(f => f.online);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-xl shadow-violet-500/25">
              <Users className="w-6 h-6 text-white" />
            </div>
            Social Hub
          </h1>
          <p className="text-slate-400 mt-2 ml-[60px]">Connect, compete, and conquer together</p>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium flex items-center gap-2 hover:bg-white/10 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Friend
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-medium flex items-center gap-2 shadow-lg shadow-violet-500/25"
          >
            <Swords className="w-4 h-4" />
            Challenge a Friend
          </motion.button>
        </div>
      </motion.div>

      {/* Online friends strip */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm text-slate-400">{onlineFriends.length} friends online</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {onlineFriends.map(friend => (
            <motion.div
              key={friend.id}
              whileHover={{ scale: 1.08, y: -4 }}
              className="flex flex-col items-center gap-1.5 min-w-[72px] cursor-pointer"
            >
              <div className="relative">
                <AvatarCircle name={friend.name} />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-navy-900" />
              </div>
              <span className="text-xs text-slate-400 truncate w-full text-center">{friend.name.split(' ')[0]}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tab Bar */}
      <motion.div variants={itemVariants} className="flex gap-1 p-1 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors duration-200 ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="social-tab-bg"
                  className="absolute inset-0 rounded-xl bg-violet-600 shadow-lg shadow-violet-600/25"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {tab.label}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'friends' && (
          <motion.div
            key="friends"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search friends..."
                value={friendSearch}
                onChange={e => setFriendSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all text-sm"
              />
            </div>

            {/* Friends Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFriends.map((friend, i) => (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.02, borderColor: 'rgba(139,92,246,0.3)' }}
                  className="glass rounded-2xl p-5 border border-white/10 group cursor-pointer relative overflow-hidden"
                >
                  {/* Glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <AvatarCircle name={friend.name} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading font-semibold text-white truncate">{friend.name}</h3>
                          <OnlineIndicator online={friend.online} />
                        </div>
                        <p className="text-xs text-slate-500">Level {friend.level} &middot; {friend.online ? 'Online' : friend.lastActive}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="rounded-xl bg-white/5 px-3 py-2 text-center">
                        <p className="text-lg font-bold text-white">{friend.questsCompleted}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Quests</p>
                      </div>
                      <div className="rounded-xl bg-white/5 px-3 py-2 text-center">
                        <p className="text-lg font-bold text-emerald-400">{(friend.points / 1000).toFixed(1)}k</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Points</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 py-2 rounded-lg bg-violet-600/20 text-violet-300 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-violet-600/30 transition-colors"
                      >
                        <Swords className="w-3 h-3" />
                        Challenge
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 py-2 rounded-lg bg-white/5 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-white/10 transition-colors"
                      >
                        <MessageCircle className="w-3 h-3" />
                        Message
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'activity' && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <div className="glass rounded-2xl border border-white/10 divide-y divide-white/5">
              {mockActivity.map((activity, i) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors group"
                >
                  <ActivityIcon type={activity.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200">
                      <span className="font-semibold text-white">{activity.user}</span>{' '}
                      {activity.action}{' '}
                      <span className="text-violet-400 font-medium">{activity.quest}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{activity.time}</p>
                  </div>
                  {activity.points > 0 && (
                    <span className="text-emerald-400 text-sm font-semibold flex items-center gap-1">
                      <Zap className="w-3 h-3" />+{activity.points}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'teams' && (
          <motion.div
            key="teams"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Create team button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full glass rounded-2xl p-6 border border-dashed border-violet-500/30 flex items-center justify-center gap-3 text-violet-400 hover:text-violet-300 hover:border-violet-500/50 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center group-hover:bg-violet-500/25 transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Create a Team</p>
                <p className="text-xs text-slate-500">Assemble your squad and conquer quests together</p>
              </div>
            </motion.button>

            {/* Teams list */}
            {mockTeams.map((team, i) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.01 }}
                className="glass rounded-2xl p-6 border border-white/10 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center border border-violet-500/20">
                        <Swords className="w-6 h-6 text-violet-400" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-white text-lg flex items-center gap-2">
                          {team.name}
                          {team.rank <= 3 && <Crown className="w-4 h-4 text-amber-400" />}
                        </h3>
                        <p className="text-xs text-slate-500">{team.members}/{team.maxMembers} members &middot; Rank #{team.rank}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-400">{(team.xp / 1000).toFixed(1)}k</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Team XP</p>
                    </div>
                  </div>

                  {team.activeQuest && (
                    <div className="rounded-xl bg-white/5 px-4 py-3 flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-amber-400" />
                        <span className="text-sm text-slate-300">Active: <span className="text-white font-medium">{team.activeQuest}</span></span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {Array.from({ length: team.members }).map((_, j) => (
                        <div key={j} className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 border-2 border-navy-900 flex items-center justify-center text-[10px] font-bold text-slate-300">
                          {String.fromCharCode(65 + j)}
                        </div>
                      ))}
                    </div>
                    {team.members < team.maxMembers && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 rounded-lg bg-violet-600 text-white text-xs font-medium shadow-lg shadow-violet-600/25"
                      >
                        Join Team
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'challenges' && (
          <motion.div
            key="challenges"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="grid md:grid-cols-2 gap-4"
          >
            {[
              { title: 'Speed Run Duel', desc: 'Complete "The Lost Temple" faster than your rival', rival: 'Elena Voss', status: 'active', timeLeft: '2h 15m', yourScore: 820, theirScore: 790 },
              { title: 'Points Marathon', desc: 'Earn more points than your friend this week', rival: 'Marcus Chen', status: 'active', timeLeft: '3d 4h', yourScore: 2100, theirScore: 1890 },
              { title: 'Quest Chain Master', desc: 'Complete 5 quests in a row without failing', rival: 'Sofia Ramirez', status: 'pending', timeLeft: null, yourScore: 0, theirScore: 0 },
              { title: 'Perfect Score', desc: 'Get a perfect score on any legendary quest', rival: 'James Wright', status: 'completed', timeLeft: null, yourScore: 1000, theirScore: 870 },
            ].map((challenge, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.02 }}
                className={`glass rounded-2xl p-6 border relative overflow-hidden ${
                  challenge.status === 'active'
                    ? 'border-violet-500/30'
                    : challenge.status === 'completed'
                    ? 'border-emerald-500/30'
                    : 'border-white/10'
                }`}
              >
                {challenge.status === 'active' && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                )}
                {challenge.status === 'completed' && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                )}

                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-bold text-white">{challenge.title}</h3>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${
                    challenge.status === 'active'
                      ? 'bg-violet-500/20 text-violet-300'
                      : challenge.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {challenge.status}
                  </span>
                </div>

                <p className="text-sm text-slate-400 mb-4">{challenge.desc}</p>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AvatarCircle name="You" size="sm" />
                    <span className="text-sm font-semibold text-white">{challenge.yourScore}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-bold">VS</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{challenge.theirScore}</span>
                    <AvatarCircle name={challenge.rival} size="sm" />
                  </div>
                </div>

                {challenge.status === 'active' && challenge.yourScore > 0 && (
                  <div className="w-full h-2 rounded-full bg-navy-800 overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(challenge.yourScore / (challenge.yourScore + challenge.theirScore)) * 100}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500"
                    />
                  </div>
                )}

                {challenge.timeLeft && (
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" />
                    {challenge.timeLeft} remaining
                  </p>
                )}

                {challenge.status === 'pending' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full mt-3 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-medium shadow-lg shadow-violet-600/25"
                  >
                    Accept Challenge
                  </motion.button>
                )}

                {challenge.status === 'completed' && challenge.yourScore > challenge.theirScore && (
                  <div className="flex items-center gap-2 mt-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-amber-400 font-semibold">Victory!</span>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Progress CTA */}
      <motion.div
        variants={itemVariants}
        className="glass rounded-2xl p-8 border border-white/10 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/5 to-emerald-600/10" />
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-2xl shadow-violet-500/30">
              <Share2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-white">Share Your Quest Progress</h3>
              <p className="text-sm text-slate-400 mt-1">Show off your achievements on social media</p>
            </div>
          </div>
          <div className="flex gap-3">
            {['Twitter', 'Discord', 'Instagram'].map(platform => (
              <motion.button
                key={platform}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors"
              >
                {platform}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
