'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Swords,
  Zap,
  Timer,
  Shield,
  Crown,
  Mic,
  Settings2,
  ChevronRight,
  Search,
  Copy,
  Link2,
  Sparkles,
  Play,
} from 'lucide-react';
import PlayerLobby, { type LobbyPlayer } from '@/components/multiplayer/PlayerLobby';
import TeamProgress, { type TeamMember } from '@/components/multiplayer/TeamProgress';

// ---------- Types ----------

interface MultiplayerSession {
  id: string;
  questTitle: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  status: 'waiting' | 'in_progress';
  voiceRequired: boolean;
}

// ---------- Mock Data ----------

const mockSessions: MultiplayerSession[] = [
  { id: '1', questTitle: 'The Lost Temple of Madrid', hostName: 'Elena Voss', playerCount: 2, maxPlayers: 4, difficulty: 'hard', status: 'waiting', voiceRequired: true },
  { id: '2', questTitle: 'Culinary Secrets of Barcelona', hostName: 'Marcus Chen', playerCount: 4, maxPlayers: 4, difficulty: 'medium', status: 'in_progress', voiceRequired: false },
  { id: '3', questTitle: 'Mystery at the Museum', hostName: 'Sofia Ramirez', playerCount: 1, maxPlayers: 3, difficulty: 'easy', status: 'waiting', voiceRequired: false },
  { id: '4', questTitle: 'Urban Explorer: Tokyo Edition', hostName: 'Aiko Tanaka', playerCount: 3, maxPlayers: 4, difficulty: 'legendary', status: 'waiting', voiceRequired: true },
  { id: '5', questTitle: 'Night Walkers: London', hostName: 'James Wright', playerCount: 2, maxPlayers: 4, difficulty: 'hard', status: 'in_progress', voiceRequired: true },
];

const mockLobbyPlayers: LobbyPlayer[] = [
  { id: '1', name: 'Elena Voss', level: 42, avatar: null, isHost: true, isReady: true, isMuted: false },
  { id: '2', name: 'You', level: 35, avatar: null, isHost: false, isReady: false, isMuted: false, isSelf: true },
  { id: '3', name: 'Marcus Chen', level: 38, avatar: null, isHost: false, isReady: true, isMuted: true },
];

const mockTeamMembers: TeamMember[] = [
  { id: '1', name: 'Elena Voss', currentStage: 4, totalStages: 6, points: 820, isAhead: true, isBehind: false, isWaiting: false },
  { id: '2', name: 'You', currentStage: 3, totalStages: 6, points: 640, isAhead: false, isBehind: false, isWaiting: false, isSelf: true },
  { id: '3', name: 'Marcus Chen', currentStage: 2, totalStages: 6, points: 410, isAhead: false, isBehind: true, isWaiting: true },
];

// ---------- Helpers ----------

const difficultyConfig: Record<string, { color: string; bg: string; border: string; label: string }> = {
  easy: { color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', label: 'Easy' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30', label: 'Medium' },
  hard: { color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/30', label: 'Hard' },
  legendary: { color: 'text-rose-400', bg: 'bg-rose-500/15', border: 'border-rose-500/30', label: 'Legendary' },
};

const avatarGradients = [
  'from-violet-500 to-fuchsia-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-cyan-500 to-blue-500',
];

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

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

type ViewMode = 'sessions' | 'lobby' | 'create' | 'in_progress';

function SessionCard({ session, onJoin, index }: { session: MultiplayerSession; onJoin: (id: string) => void; index: number }) {
  const diff = difficultyConfig[session.difficulty];
  const isFull = session.playerCount >= session.maxPlayers;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ scale: 1.01, y: -2 }}
      className="relative rounded-2xl border border-white/10 overflow-hidden group"
    >
      {/* Animated border glow for waiting sessions */}
      {session.status === 'waiting' && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.08), transparent, rgba(236,72,153,0.08))',
          }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      <div className="relative glass p-5">
        {/* Status stripe */}
        <div className={`absolute top-0 left-0 right-0 h-0.5 ${
          session.status === 'waiting'
            ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
            : 'bg-gradient-to-r from-emerald-500 to-teal-500'
        }`} />

        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-semibold text-white truncate mb-1">{session.questTitle}</h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Crown className="w-3 h-3 text-amber-400" />
              <span>{session.hostName}</span>
            </div>
          </div>

          <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider flex-shrink-0 ml-3 ${
            session.status === 'waiting'
              ? 'bg-violet-500/20 text-violet-300'
              : 'bg-emerald-500/20 text-emerald-300'
          }`}>
            {session.status === 'waiting' ? 'Waiting' : 'In Progress'}
          </span>
        </div>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${diff.bg} ${diff.color}`}>
            <Shield className="w-3 h-3" />
            {diff.label}
          </span>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-slate-400">
            <Users className="w-3 h-3" />
            {session.playerCount}/{session.maxPlayers}
          </span>

          {session.voiceRequired && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/15 text-cyan-300">
              <Mic className="w-3 h-3" />
              Voice
            </span>
          )}
        </div>

        {/* Player avatars */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {Array.from({ length: session.playerCount }).map((_, j) => (
              <div
                key={j}
                className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradients[j % avatarGradients.length]} border-2 border-navy-900 flex items-center justify-center text-[10px] font-bold text-white`}
              >
                {String.fromCharCode(65 + j)}
              </div>
            ))}
            {/* Empty slots */}
            {Array.from({ length: session.maxPlayers - session.playerCount }).map((_, j) => (
              <div
                key={`empty-${j}`}
                className="w-8 h-8 rounded-full bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center"
              >
                <Plus className="w-3 h-3 text-slate-600" />
              </div>
            ))}
          </div>

          {session.status === 'waiting' && !isFull && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onJoin(session.id)}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              Join
            </motion.button>
          )}

          {isFull && session.status === 'waiting' && (
            <span className="px-4 py-2 rounded-xl bg-white/5 text-slate-500 text-xs font-semibold">Full</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function CreateRoomPanel({ onBack }: { onBack: () => void }) {
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [difficulty, setDifficulty] = useState('medium');
  const [voiceRequired, setVoiceRequired] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState('');

  const questOptions = [
    'The Lost Temple of Madrid',
    'Culinary Secrets of Barcelona',
    'Mystery at the Museum',
    'Urban Explorer: Tokyo Edition',
    'Night Walkers: London',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 border border-white/10 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-violet-400" />
          Create Room
        </h2>
        <button onClick={onBack} className="text-sm text-slate-400 hover:text-white transition-colors">
          Back to sessions
        </button>
      </div>

      {/* Quest selection */}
      <div>
        <label className="text-sm font-semibold text-slate-400 mb-2 block">Select Quest</label>
        <div className="space-y-2">
          {questOptions.map((quest) => (
            <motion.button
              key={quest}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelectedQuest(quest)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                selectedQuest === quest
                  ? 'bg-violet-500/10 border-violet-500/30 text-white'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                {quest}
                {selectedQuest === quest && <Zap className="w-4 h-4 text-violet-400" />}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Max players */}
      <div>
        <label className="text-sm font-semibold text-slate-400 mb-2 block">Max Players</label>
        <div className="flex gap-2">
          {[2, 3, 4].map((n) => (
            <motion.button
              key={n}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMaxPlayers(n)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                maxPlayers === n
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'
              }`}
            >
              {n} Players
            </motion.button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <label className="text-sm font-semibold text-slate-400 mb-2 block">Difficulty</label>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(difficultyConfig).map(([key, config]) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDifficulty(key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                difficulty === key
                  ? `${config.bg} ${config.color} border ${config.border}`
                  : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              {config.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Voice required */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Voice Required</p>
          <p className="text-xs text-slate-500">Players must have mic enabled</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setVoiceRequired(!voiceRequired)}
          className={`w-12 h-7 rounded-full transition-all duration-300 flex items-center px-0.5 ${
            voiceRequired ? 'bg-violet-600 justify-end' : 'bg-white/10 justify-start'
          }`}
        >
          <motion.div layout className="w-6 h-6 rounded-full bg-white shadow-md" />
        </motion.button>
      </div>

      {/* Invite link preview */}
      <div className="rounded-xl bg-navy-800/50 p-4 border border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <Link2 className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-semibold text-slate-400">Invite Link</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 px-3 py-2 rounded-lg bg-white/5 text-xs font-mono text-slate-500 truncate">
            questmaster.app/join/abc123...
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-2 rounded-lg bg-white/10 text-slate-300 text-xs font-medium hover:bg-white/15 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {/* Create button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow flex items-center justify-center gap-2"
      >
        <Sparkles className="w-5 h-5" />
        Create Room
      </motion.button>
    </motion.div>
  );
}

function LobbyView({ onBack }: { onBack: () => void }) {
  const [selfReady, setSelfReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: '1', user: 'Elena Voss', text: 'Ready when you are!', time: '2:30 PM' },
    { id: '2', user: 'Marcus Chen', text: 'Let me grab my headphones', time: '2:31 PM' },
  ]);

  // Simulated countdown
  useEffect(() => {
    const allReady = mockLobbyPlayers.every((p) => p.isHost || p.isReady) && selfReady;
    if (allReady && countdown === null) {
      setCountdown(5);
    }
  }, [selfReady, countdown]);

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { id: String(prev.length + 1), user: 'You', text: chatMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setChatMessage('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-white">The Lost Temple of Madrid</h2>
          <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            Hosted by Elena Voss
          </p>
        </div>
        <button onClick={onBack} className="text-sm text-slate-400 hover:text-white transition-colors">
          Leave Room
        </button>
      </div>

      {/* Countdown */}
      <AnimatePresence>
        {countdown !== null && countdown > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="glass rounded-2xl p-8 border border-violet-500/30 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-violet-600/10" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="relative"
            >
              <p className="text-sm text-slate-400 mb-2">Quest starts in</p>
              <p className="text-6xl font-heading font-bold text-white">{countdown}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player lobby */}
      <PlayerLobby
        players={mockLobbyPlayers}
        maxPlayers={4}
        isHost={false}
        selfReady={selfReady}
        onToggleReady={() => setSelfReady(!selfReady)}
      />

      {/* Lobby chat */}
      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-sm font-semibold text-white">Lobby Chat</h3>
        </div>
        <div className="p-4 space-y-3 max-h-48 overflow-y-auto">
          {chatMessages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2">
              <span className={`text-xs font-semibold ${msg.user === 'You' ? 'text-violet-400' : 'text-slate-300'}`}>
                {msg.user}:
              </span>
              <span className="text-xs text-slate-400 flex-1">{msg.text}</span>
              <span className="text-[10px] text-slate-600">{msg.time}</span>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-white/5 flex gap-2">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium"
          >
            Send
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ---------- Main Page ----------

export default function MultiplayerPage() {
  const [view, setView] = useState<ViewMode>('sessions');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = mockSessions.filter(
    (s) =>
      s.questTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.hostName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <Swords className="w-6 h-6 text-white" />
            </div>
            Multiplayer
          </h1>
          <p className="text-slate-400 mt-2 ml-[60px]">Team up with friends and conquer quests together</p>
        </div>

        {view === 'sessions' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setView('create')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-medium flex items-center gap-2 shadow-lg shadow-violet-500/25"
          >
            <Plus className="w-4 h-4" />
            Create Room
          </motion.button>
        )}
      </motion.div>

      {/* Content based on view */}
      <AnimatePresence mode="wait">
        {view === 'sessions' && (
          <motion.div
            key="sessions"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            {/* Stats strip */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Active Rooms', value: '12', icon: Users, color: 'text-violet-400' },
                { label: 'Players Online', value: '47', icon: Zap, color: 'text-emerald-400' },
                { label: 'Avg Wait Time', value: '45s', icon: Timer, color: 'text-amber-400' },
                { label: 'Quests Active', value: '8', icon: Swords, color: 'text-cyan-400' },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="glass rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <p className="text-2xl font-heading font-bold text-white">{stat.value}</p>
                  </div>
                );
              })}
            </motion.div>

            {/* Search */}
            <motion.div variants={itemVariants} className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all text-sm"
              />
            </motion.div>

            {/* Sessions list */}
            <div className="grid md:grid-cols-2 gap-4">
              {filteredSessions.map((session, i) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  index={i}
                  onJoin={() => setView('lobby')}
                />
              ))}
            </div>

            {filteredSessions.length === 0 && (
              <div className="text-center py-16">
                <Swords className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No sessions found</p>
                <p className="text-sm text-slate-500 mt-1">Create one and invite friends!</p>
              </div>
            )}
          </motion.div>
        )}

        {view === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <CreateRoomPanel onBack={() => setView('sessions')} />
          </motion.div>
        )}

        {view === 'lobby' && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <LobbyView onBack={() => setView('sessions')} />
          </motion.div>
        )}

        {view === 'in_progress' && (
          <motion.div
            key="in_progress"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <TeamProgress
              members={mockTeamMembers}
              teamPoints={1870}
              questTitle="The Lost Temple of Madrid"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
