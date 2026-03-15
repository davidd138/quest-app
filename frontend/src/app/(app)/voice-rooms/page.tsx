'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Plus,
  Search,
  Volume2,
  Users,
  MessageCircle,
  Compass,
  BookOpen,
  Coffee,
  Globe,
  Shield,
  Settings2,
  Lock,
} from 'lucide-react';
import VoiceRoomCard, { type VoiceRoom } from '@/components/social/VoiceRoomCard';

// ---------- Mock Data ----------

const mockRooms: VoiceRoom[] = [
  {
    id: '1',
    name: 'Quest Strategy Hub',
    topic: 'Strategy',
    participants: [
      { id: '1', name: 'Elena Voss', isSpeaking: true },
      { id: '2', name: 'Marcus Chen', isSpeaking: false },
      { id: '3', name: 'Sofia Ramirez', isSpeaking: true },
      { id: '4', name: 'James Wright', isSpeaking: false },
    ],
    maxParticipants: 8,
    isPrivate: false,
    activeSince: '45m',
    topicColor: 'violet',
  },
  {
    id: '2',
    name: 'Beginner Tips & Tricks',
    topic: 'Quest Tips',
    participants: [
      { id: '5', name: 'Aiko Tanaka', isSpeaking: true },
      { id: '6', name: 'Liam O\'Brien', isSpeaking: false },
    ],
    maxParticipants: 6,
    isPrivate: false,
    activeSince: '1h 20m',
    topicColor: 'emerald',
  },
  {
    id: '3',
    name: 'Night Walkers Lounge',
    topic: 'Social',
    participants: [
      { id: '7', name: 'Carlos Diaz', isSpeaking: false },
      { id: '8', name: 'Yuki Yamamoto', isSpeaking: true },
      { id: '9', name: 'Sarah Miller', isSpeaking: false },
      { id: '10', name: 'David Kim', isSpeaking: false },
      { id: '11', name: 'Anna Petrov', isSpeaking: true },
      { id: '12', name: 'Tom Harris', isSpeaking: false },
      { id: '13', name: 'Lisa Wang', isSpeaking: false },
    ],
    maxParticipants: 10,
    isPrivate: false,
    activeSince: '2h 10m',
    topicColor: 'cyan',
  },
  {
    id: '4',
    name: 'Language Practice (ES/EN)',
    topic: 'Language',
    participants: [
      { id: '14', name: 'Pablo Garcia', isSpeaking: true },
      { id: '15', name: 'Emma Thompson', isSpeaking: false },
      { id: '16', name: 'Roberto Alvarez', isSpeaking: false },
    ],
    maxParticipants: 6,
    isPrivate: false,
    activeSince: '30m',
    topicColor: 'amber',
  },
  {
    id: '5',
    name: 'Elite Players Only',
    topic: 'Strategy',
    participants: [
      { id: '17', name: 'Zero Cool', isSpeaking: false },
      { id: '18', name: 'Phantom', isSpeaking: true },
    ],
    maxParticipants: 4,
    isPrivate: true,
    activeSince: '15m',
    topicColor: 'rose',
  },
  {
    id: '6',
    name: 'Chill & Chat',
    topic: 'Social',
    participants: [
      { id: '19', name: 'Mike Johnson', isSpeaking: false },
      { id: '20', name: 'Rachel Green', isSpeaking: false },
      { id: '21', name: 'Ross Geller', isSpeaking: true },
      { id: '22', name: 'Monica Bing', isSpeaking: false },
      { id: '23', name: 'Joey T', isSpeaking: false },
    ],
    maxParticipants: 8,
    isPrivate: false,
    activeSince: '55m',
    topicColor: 'cyan',
  },
];

// ---------- Helpers ----------

type TopicFilter = 'all' | 'strategy' | 'tips' | 'social' | 'language';

const topicFilters: { id: TopicFilter; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All Rooms', icon: Volume2 },
  { id: 'strategy', label: 'Strategy', icon: Compass },
  { id: 'tips', label: 'Quest Tips', icon: BookOpen },
  { id: 'social', label: 'Social', icon: Coffee },
  { id: 'language', label: 'Language', icon: Globe },
];

function filterRooms(rooms: VoiceRoom[], filter: TopicFilter, search: string): VoiceRoom[] {
  let filtered = rooms;
  if (filter !== 'all') {
    const topicMap: Record<TopicFilter, string> = {
      all: '',
      strategy: 'Strategy',
      tips: 'Quest Tips',
      social: 'Social',
      language: 'Language',
    };
    filtered = rooms.filter((r) => r.topic === topicMap[filter]);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.topic.toLowerCase().includes(q)
    );
  }
  return filtered;
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

// ---------- Create Room Modal ----------

function CreateRoomPanel({ onClose }: { onClose: () => void }) {
  const [roomName, setRoomName] = useState('');
  const [topic, setTopic] = useState('Social');
  const [maxParticipants, setMaxParticipants] = useState(8);
  const [isPrivate, setIsPrivate] = useState(false);

  const topics = ['Strategy', 'Quest Tips', 'Social', 'Language'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass rounded-2xl p-6 border border-white/10 space-y-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-violet-400" />
          Create Voice Room
        </h2>
        <button onClick={onClose} className="text-sm text-slate-400 hover:text-white transition-colors">
          Cancel
        </button>
      </div>

      {/* Room name */}
      <div>
        <label className="text-sm font-semibold text-slate-400 mb-2 block">Room Name</label>
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Give your room a name..."
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all text-sm"
        />
      </div>

      {/* Topic */}
      <div>
        <label className="text-sm font-semibold text-slate-400 mb-2 block">Topic</label>
        <div className="flex flex-wrap gap-2">
          {topics.map((t) => (
            <motion.button
              key={t}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTopic(t)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                topic === t
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-white/5 text-slate-400 border border-white/10'
              }`}
            >
              {t}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Max participants */}
      <div>
        <label className="text-sm font-semibold text-slate-400 mb-2 block">Max Participants</label>
        <div className="flex gap-2">
          {[4, 6, 8, 10].map((n) => (
            <motion.button
              key={n}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMaxParticipants(n)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                maxParticipants === n
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-white/5 text-slate-400 border border-white/10'
              }`}
            >
              {n}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Private toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-400" />
          <div>
            <p className="text-sm font-semibold text-white">Private Room</p>
            <p className="text-xs text-slate-500">Only invited users can join</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsPrivate(!isPrivate)}
          className={`w-12 h-7 rounded-full transition-all duration-300 flex items-center px-0.5 ${
            isPrivate ? 'bg-violet-600 justify-end' : 'bg-white/10 justify-start'
          }`}
        >
          <motion.div layout className="w-6 h-6 rounded-full bg-white shadow-md" />
        </motion.button>
      </div>

      {/* Create button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow flex items-center justify-center gap-2"
      >
        <Mic className="w-5 h-5" />
        Create Room
      </motion.button>
    </motion.div>
  );
}

// ---------- Main Page ----------

export default function VoiceRoomsPage() {
  const [activeFilter, setActiveFilter] = useState<TopicFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const filteredRooms = filterRooms(mockRooms, activeFilter, searchQuery);
  const totalParticipants = mockRooms.reduce((sum, r) => sum + r.participants.length, 0);
  const activeSpeakers = mockRooms.reduce(
    (sum, r) => sum + r.participants.filter((p) => p.isSpeaking).length,
    0
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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-xl shadow-cyan-500/25">
              <Volume2 className="w-6 h-6 text-white" />
            </div>
            Voice Rooms
          </h1>
          <p className="text-slate-400 mt-2 ml-[60px]">Drop in for casual voice chat with fellow adventurers</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreate(!showCreate)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-medium flex items-center gap-2 shadow-lg shadow-cyan-500/25"
        >
          <Plus className="w-4 h-4" />
          Create Room
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Rooms', value: String(mockRooms.length), icon: Volume2, color: 'text-cyan-400' },
          { label: 'People Chatting', value: String(totalParticipants), icon: Users, color: 'text-violet-400' },
          { label: 'Speaking Now', value: String(activeSpeakers), icon: Mic, color: 'text-emerald-400' },
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

      {/* Create room panel */}
      <AnimatePresence>
        {showCreate && (
          <CreateRoomPanel onClose={() => setShowCreate(false)} />
        )}
      </AnimatePresence>

      {/* Filter tabs */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
        {topicFilters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;
          return (
            <motion.button
              key={filter.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/25'
                  : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {filter.label}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search voice rooms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm"
        />
      </motion.div>

      {/* Voice rooms grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map((room, i) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <VoiceRoomCard room={room} />
          </motion.div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-16">
          <Volume2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No voice rooms found</p>
          <p className="text-sm text-slate-500 mt-1">Create one and start chatting!</p>
        </div>
      )}
    </motion.div>
  );
}
