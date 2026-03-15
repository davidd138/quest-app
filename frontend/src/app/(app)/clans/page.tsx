'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Users,
  Search,
  Plus,
  Crown,
  Star,
  Trophy,
  MessageCircle,
  Swords,
  Zap,
  ChevronRight,
  ArrowUpDown,
  Flame,
  Target,
} from 'lucide-react';
import ClanCard from '@/components/social/ClanCard';
import ClanBadge from '@/components/social/ClanBadge';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Clan {
  id: string;
  name: string;
  description: string;
  color: string;
  memberCount: number;
  totalPoints: number;
  rank: number;
  isOpen: boolean;
  createdAt: string;
  leader: string;
  recentActivity?: string;
}

export interface ClanMember {
  id: string;
  name: string;
  role: 'leader' | 'officer' | 'member';
  points: number;
  questsCompleted: number;
  joinedAt: string;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MY_CLAN: Clan & { members: ClanMember[]; clanQuestProgress: number } = {
  id: 'c1',
  name: 'Shadow Seekers',
  description: 'Elite explorers uncovering the world\'s hidden secrets. We quest hard, we quest together.',
  color: '#8B5CF6',
  memberCount: 12,
  totalPoints: 156400,
  rank: 2,
  isOpen: false,
  createdAt: '2025-06-15',
  leader: 'Sofia Ramirez',
  recentActivity: 'Completed "The Lost Temple" clan quest',
  clanQuestProgress: 67,
  members: [
    { id: 'm1', name: 'Sofia Ramirez', role: 'leader', points: 25800, questsCompleted: 156, joinedAt: '2025-06-15' },
    { id: 'm2', name: 'Marcus Chen', role: 'officer', points: 18200, questsCompleted: 112, joinedAt: '2025-07-01' },
    { id: 'm3', name: 'Elena Voss', role: 'officer', points: 16400, questsCompleted: 98, joinedAt: '2025-07-10' },
    { id: 'm4', name: 'Current User', role: 'member', points: 12800, questsCompleted: 74, joinedAt: '2025-08-05' },
    { id: 'm5', name: 'James Wright', role: 'member', points: 11200, questsCompleted: 67, joinedAt: '2025-08-12' },
    { id: 'm6', name: 'Aiko Tanaka', role: 'member', points: 10500, questsCompleted: 63, joinedAt: '2025-09-01' },
  ],
};

const FEATURED_CLANS: Clan[] = [
  { id: 'c2', name: 'Quest Crushers', description: 'No quest too hard, no score too high', color: '#EF4444', memberCount: 18, totalPoints: 212600, rank: 1, isOpen: true, createdAt: '2025-04-01', leader: 'Alex Storm', recentActivity: 'Won Season Championship' },
  { id: 'c1', name: 'Shadow Seekers', description: 'Elite explorers uncovering hidden secrets', color: '#8B5CF6', memberCount: 12, totalPoints: 156400, rank: 2, isOpen: false, createdAt: '2025-06-15', leader: 'Sofia Ramirez', recentActivity: 'Completed clan quest' },
  { id: 'c3', name: 'Dawn Walkers', description: 'First to rise, first to quest', color: '#F59E0B', memberCount: 15, totalPoints: 148200, rank: 3, isOpen: true, createdAt: '2025-05-20', leader: 'Liam OBrien', recentActivity: 'Recruited 3 new members' },
];

const ALL_CLANS: Clan[] = [
  ...FEATURED_CLANS,
  { id: 'c4', name: 'Mystic Order', description: 'Seekers of arcane knowledge and hidden riddles', color: '#7C3AED', memberCount: 10, totalPoints: 98600, rank: 4, isOpen: true, createdAt: '2025-07-01', leader: 'Diana Prince', recentActivity: 'Completed 100 quests' },
  { id: 'c5', name: 'Iron Explorers', description: 'Forged in adventure, tempered by challenge', color: '#6B7280', memberCount: 8, totalPoints: 76400, rank: 5, isOpen: true, createdAt: '2025-08-15', leader: 'Kai Nakamura', recentActivity: 'New clan record' },
  { id: 'c6', name: 'Emerald Raiders', description: 'Nature lovers with a competitive edge', color: '#10B981', memberCount: 14, totalPoints: 134200, rank: 6, isOpen: false, createdAt: '2025-05-10', leader: 'Maya Forest' },
  { id: 'c7', name: 'Night Owls', description: 'We quest while the world sleeps', color: '#3B82F6', memberCount: 9, totalPoints: 62800, rank: 7, isOpen: true, createdAt: '2025-09-01', leader: 'Raven Dark' },
  { id: 'c8', name: 'Phoenix Rising', description: 'Always coming back stronger', color: '#FB923C', memberCount: 11, totalPoints: 108400, rank: 8, isOpen: true, createdAt: '2025-06-01', leader: 'Ash Blaze' },
];

const CLAN_CHALLENGES = [
  { id: 'ch1', title: 'Weekly Quest Race', description: 'Complete 50 quests as a clan this week', progress: 34, total: 50, reward: '5000 clan pts', endsIn: '3d 12h' },
  { id: 'ch2', title: 'Perfect Score Rally', description: 'Get 10 perfect scores across any quest', progress: 7, total: 10, reward: '3000 clan pts', endsIn: '5d 8h' },
  { id: 'ch3', title: 'Explorer Challenge', description: 'Visit all quest categories as a clan', progress: 6, total: 8, reward: '2000 clan pts', endsIn: '1d 4h' },
];

// ---------------------------------------------------------------------------
// Animations
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

type SortKey = 'members' | 'points' | 'rank';
type ViewMode = 'browse' | 'my_clan' | 'create';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function RoleBadge({ role }: { role: 'leader' | 'officer' | 'member' }) {
  const config = {
    leader: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: Crown },
    officer: { bg: 'bg-violet-500/20', text: 'text-violet-400', icon: Shield },
    member: { bg: 'bg-white/5', text: 'text-slate-400', icon: Users },
  };
  const c = config[role];
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${c.bg} ${c.text}`}>
      <Icon className="w-3 h-3" />
      {role}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ClansPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('rank');
  const [createForm, setCreateForm] = useState({ name: '', description: '', color: '#8B5CF6' });

  const isMember = true; // Mock: user is in MY_CLAN

  const sortedClans = useMemo(() => {
    const list = ALL_CLANS.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    switch (sortBy) {
      case 'members':
        return [...list].sort((a, b) => b.memberCount - a.memberCount);
      case 'points':
        return [...list].sort((a, b) => b.totalPoints - a.totalPoints);
      case 'rank':
        return [...list].sort((a, b) => a.rank - b.rank);
      default:
        return list;
    }
  }, [searchQuery, sortBy]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-500/25">
              <Shield className="w-6 h-6 text-white" />
            </div>
            Clans
          </h1>
          <p className="text-slate-400 mt-2 ml-[60px]">Join forces, compete together, conquer quests as one</p>
        </div>

        <div className="flex gap-3">
          {isMember && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('my_clan')}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${
                viewMode === 'my_clan'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
                  : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
              }`}
            >
              <Shield className="w-4 h-4" />
              My Clan
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('create')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${
              viewMode === 'create'
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25'
                : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
            }`}
          >
            <Plus className="w-4 h-4" />
            Create Clan
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ============================================================= */}
        {/* BROWSE VIEW                                                     */}
        {/* ============================================================= */}
        {viewMode === 'browse' && (
          <motion.div
            key="browse"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-8"
          >
            {/* Featured Clans */}
            <div>
              <h2 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                Featured Clans
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {FEATURED_CLANS.map((clan, i) => (
                  <ClanCard key={clan.id} clan={clan} featured />
                ))}
              </div>
            </div>

            {/* Search & Sort */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search clans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all text-sm"
                />
              </div>
              <div className="flex gap-2">
                {(['rank', 'points', 'members'] as SortKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSortBy(key)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      sortBy === key
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* All Clans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedClans.map((clan) => (
                <ClanCard key={clan.id} clan={clan} />
              ))}
            </div>

            {sortedClans.length === 0 && (
              <div className="text-center py-16">
                <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-heading font-semibold text-white mb-2">No clans found</h3>
                <p className="text-sm text-slate-400">Try a different search term or create your own clan</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ============================================================= */}
        {/* MY CLAN VIEW                                                    */}
        {/* ============================================================= */}
        {viewMode === 'my_clan' && isMember && (
          <motion.div
            key="my_clan"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            <button onClick={() => setViewMode('browse')} className="text-sm text-slate-400 hover:text-violet-400 transition-colors">
              &larr; Back to Browse
            </button>

            {/* Clan Header */}
            <div className="glass rounded-2xl border border-white/10 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent" />
              <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                <ClanBadge name={MY_CLAN.name} color={MY_CLAN.color} size="lg" glowing={MY_CLAN.rank <= 3} />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="font-heading text-2xl font-bold text-white">{MY_CLAN.name}</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold">
                      Rank #{MY_CLAN.rank}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{MY_CLAN.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {MY_CLAN.memberCount} members
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" /> {MY_CLAN.totalPoints.toLocaleString()} pts
                    </span>
                    <span className="flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Led by {MY_CLAN.leader}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Clan Quest Progress */}
            <div className="glass rounded-2xl border border-white/10 p-6">
              <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-violet-400" />
                Clan Quest Progress
              </h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">The Lost Temple of Madrid</span>
                <span className="text-sm text-violet-400 font-medium">{MY_CLAN.clanQuestProgress}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-navy-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${MY_CLAN.clanQuestProgress}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                />
              </div>
            </div>

            {/* Clan Members */}
            <div className="glass rounded-2xl border border-white/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700/50">
                <h3 className="font-heading font-semibold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-violet-400" />
                  Members ({MY_CLAN.members.length})
                </h3>
              </div>
              {MY_CLAN.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 px-6 py-4 border-b border-slate-700/20 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">
                      {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-slate-200 truncate">{member.name}</span>
                      <RoleBadge role={member.role} />
                    </div>
                    <p className="text-xs text-slate-500">{member.questsCompleted} quests completed</p>
                  </div>
                  <span className="text-sm font-semibold text-white flex items-center gap-1">
                    <Zap className="w-3 h-3 text-violet-400" />
                    {member.points.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Clan Challenges */}
            <div>
              <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                <Swords className="w-5 h-5 text-amber-400" />
                Clan Challenges
              </h3>
              <div className="space-y-3">
                {CLAN_CHALLENGES.map((challenge) => (
                  <div key={challenge.id} className="glass rounded-2xl border border-white/10 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-heading font-semibold text-white text-sm">{challenge.title}</h4>
                      <span className="text-xs text-amber-400 flex items-center gap-1">
                        <Flame className="w-3 h-3" /> {challenge.endsIn}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{challenge.description}</p>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-500">{challenge.progress}/{challenge.total}</span>
                      <span className="text-xs text-emerald-400">{challenge.reward}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-navy-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500 transition-all"
                        style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clan Chat Placeholder */}
            <div className="glass rounded-2xl border border-dashed border-white/10 p-8 text-center">
              <MessageCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="font-heading font-semibold text-slate-400">Clan Chat</h3>
              <p className="text-sm text-slate-500 mt-1">Coming soon! Chat with your clan members in real-time.</p>
            </div>
          </motion.div>
        )}

        {/* ============================================================= */}
        {/* CREATE CLAN VIEW                                                */}
        {/* ============================================================= */}
        {viewMode === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            <button onClick={() => setViewMode('browse')} className="text-sm text-slate-400 hover:text-violet-400 transition-colors">
              &larr; Back to Browse
            </button>

            <div className="glass rounded-2xl border border-white/10 p-8 max-w-xl mx-auto">
              <h2 className="font-heading text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-violet-400" />
                Create a Clan
              </h2>

              <div className="space-y-5">
                {/* Preview */}
                <div className="flex justify-center mb-6">
                  <ClanBadge
                    name={createForm.name || 'Clan'}
                    color={createForm.color}
                    size="lg"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm text-slate-300 font-medium mb-1.5">Clan Name</label>
                  <input
                    type="text"
                    placeholder="Enter clan name..."
                    value={createForm.name}
                    onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all text-sm"
                    maxLength={30}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm text-slate-300 font-medium mb-1.5">Description</label>
                  <textarea
                    placeholder="What is your clan about?"
                    value={createForm.description}
                    onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all text-sm resize-none"
                    maxLength={200}
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm text-slate-300 font-medium mb-1.5">Clan Color</label>
                  <div className="flex gap-3 flex-wrap">
                    {['#8B5CF6', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#6B7280', '#FB923C'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setCreateForm((f) => ({ ...f, color: c }))}
                        className={`w-10 h-10 rounded-xl transition-all ${
                          createForm.color === c ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold shadow-lg shadow-violet-600/25 mt-4"
                >
                  Create Clan
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
