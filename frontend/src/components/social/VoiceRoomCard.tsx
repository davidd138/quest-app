'use client';

import { motion } from 'framer-motion';
import { Mic, Lock, Clock, Users } from 'lucide-react';

// ---------- Types ----------

export interface VoiceRoomParticipant {
  id: string;
  name: string;
  isSpeaking: boolean;
}

export interface VoiceRoom {
  id: string;
  name: string;
  topic: string;
  participants: VoiceRoomParticipant[];
  maxParticipants: number;
  isPrivate: boolean;
  activeSince: string; // e.g. "45m", "2h 10m"
  topicColor: string; // tailwind color key
}

interface VoiceRoomCardProps {
  room: VoiceRoom;
  onJoin?: (roomId: string) => void;
}

// ---------- Helpers ----------

const topicColorMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  violet: {
    bg: 'bg-violet-500/15',
    text: 'text-violet-300',
    border: 'border-violet-500/30',
    glow: 'shadow-violet-500/20',
  },
  emerald: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-300',
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/20',
  },
  amber: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
    glow: 'shadow-amber-500/20',
  },
  cyan: {
    bg: 'bg-cyan-500/15',
    text: 'text-cyan-300',
    border: 'border-cyan-500/30',
    glow: 'shadow-cyan-500/20',
  },
  rose: {
    bg: 'bg-rose-500/15',
    text: 'text-rose-300',
    border: 'border-rose-500/30',
    glow: 'shadow-rose-500/20',
  },
};

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

// ---------- Sub-components ----------

function SpeakerWave() {
  return (
    <div className="flex items-center gap-[2px] h-4">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-emerald-400"
          animate={{
            height: ['4px', '14px', '6px', '12px', '4px'],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function ParticipantAvatars({ participants, max = 6 }: { participants: VoiceRoomParticipant[]; max?: number }) {
  const visible = participants.slice(0, max);
  const overflow = participants.length - max;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2.5">
        {visible.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ scale: 0, x: -10 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative"
          >
            <div
              className={`w-9 h-9 rounded-full bg-gradient-to-br ${
                avatarGradients[p.name.charCodeAt(0) % avatarGradients.length]
              } flex items-center justify-center text-[10px] font-bold text-white border-2 border-navy-900`}
            >
              {getInitials(p.name)}
            </div>
            {p.isSpeaking && (
              <motion.div
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-navy-900"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {overflow > 0 && (
        <div className="ml-1.5 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold text-slate-300 border-2 border-navy-900">
          +{overflow}
        </div>
      )}
    </div>
  );
}

// ---------- Main Component ----------

export default function VoiceRoomCard({ room, onJoin }: VoiceRoomCardProps) {
  const colors = topicColorMap[room.topicColor] || topicColorMap.violet;
  const activeSpeakers = room.participants.filter((p) => p.isSpeaking);
  const isFull = room.participants.length >= room.maxParticipants;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`glass rounded-2xl p-5 border ${colors.border} relative overflow-hidden group cursor-pointer`}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-heading font-semibold text-white truncate">{room.name}</h3>
              {room.isPrivate && (
                <Lock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              )}
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${colors.bg} ${colors.text}`}
            >
              {room.topic}
            </span>
          </div>

          {/* Active speaker indicator */}
          {activeSpeakers.length > 0 && (
            <div className="flex items-center gap-2 ml-3">
              <SpeakerWave />
            </div>
          )}
        </div>

        {/* Participants */}
        <div className="mb-4">
          <ParticipantAvatars participants={room.participants} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {room.participants.length}/{room.maxParticipants}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {room.activeSince}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => onJoin?.(room.id)}
            disabled={isFull}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isFull
                ? 'bg-white/5 text-slate-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            {isFull ? 'Full' : 'Join'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
