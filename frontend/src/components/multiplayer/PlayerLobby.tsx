'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown,
  Mic,
  MicOff,
  UserX,
  Check,
  X,
  Sparkles,
  Shield,
} from 'lucide-react';

// ---------- Types ----------

export interface LobbyPlayer {
  id: string;
  name: string;
  level: number;
  avatar: string | null;
  isHost: boolean;
  isReady: boolean;
  isMuted: boolean;
  isSelf?: boolean;
}

interface PlayerLobbyProps {
  players: LobbyPlayer[];
  maxPlayers?: number;
  isHost?: boolean;
  onToggleReady?: () => void;
  onKickPlayer?: (playerId: string) => void;
  selfReady?: boolean;
}

// ---------- Helpers ----------

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const avatarGradients = [
  'from-violet-500 to-fuchsia-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-cyan-500 to-blue-500',
  'from-indigo-500 to-violet-500',
];

function getGradient(name: string) {
  return avatarGradients[name.charCodeAt(0) % avatarGradients.length];
}

// ---------- Sub-components ----------

function PlayerCard({
  player,
  isHost,
  onKick,
}: {
  player: LobbyPlayer;
  isHost: boolean;
  onKick?: (id: string) => void;
}) {
  const [showKick, setShowKick] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.6, y: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={{ scale: 1.03 }}
      onHoverStart={() => setShowKick(true)}
      onHoverEnd={() => setShowKick(false)}
      className={`relative rounded-2xl p-5 border transition-all duration-300 ${
        player.isReady
          ? 'bg-emerald-500/5 border-emerald-500/30 shadow-lg shadow-emerald-500/10'
          : 'bg-white/5 border-white/10'
      } ${player.isSelf ? 'ring-2 ring-violet-500/50' : ''}`}
    >
      {/* Animated border glow for ready players */}
      {player.isReady && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            background:
              'linear-gradient(135deg, rgba(16,185,129,0.1), transparent, rgba(16,185,129,0.05))',
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div className="relative">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getGradient(
                player.name
              )} flex items-center justify-center font-bold text-white text-lg shadow-lg`}
            >
              {getInitials(player.name)}
            </div>

            {/* Host crown */}
            {player.isHost && (
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30"
              >
                <Crown className="w-4 h-4 text-white" />
              </motion.div>
            )}

            {/* Ready indicator */}
            <motion.div
              initial={false}
              animate={{
                scale: player.isReady ? 1 : 0,
                opacity: player.isReady ? 1 : 0,
              }}
              className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-navy-900"
            >
              <Check className="w-3 h-3 text-white" />
            </motion.div>
          </div>

          {/* Name & Level */}
          <div className="text-center">
            <h3 className="font-heading font-semibold text-white text-sm flex items-center gap-1.5 justify-center">
              {player.name}
              {player.isSelf && (
                <span className="text-[10px] text-violet-400 font-normal">(you)</span>
              )}
            </h3>
            <div className="flex items-center gap-1.5 justify-center mt-1">
              <Shield className="w-3 h-3 text-slate-500" />
              <span className="text-xs text-slate-500">Level {player.level}</span>
            </div>
          </div>

          {/* Voice status */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${
              player.isMuted
                ? 'bg-rose-500/15 text-rose-400'
                : 'bg-emerald-500/15 text-emerald-400'
            }`}
          >
            {player.isMuted ? (
              <MicOff className="w-3 h-3" />
            ) : (
              <Mic className="w-3 h-3" />
            )}
            {player.isMuted ? 'Muted' : 'Voice On'}
          </div>

          {/* Ready status text */}
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider ${
              player.isReady ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {player.isReady ? 'Ready' : 'Not Ready'}
          </span>
        </div>

        {/* Kick button (host only, not self) */}
        <AnimatePresence>
          {isHost && !player.isHost && showKick && onKick && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onKick(player.id)}
              className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center hover:bg-rose-500/30 transition-colors"
            >
              <UserX className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function EmptySlot({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-2xl border-2 border-dashed border-white/10 p-5 flex flex-col items-center justify-center min-h-[220px]"
    >
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-3"
      >
        <Sparkles className="w-6 h-6 text-slate-600" />
      </motion.div>
      <p className="text-sm text-slate-600 font-medium">Waiting...</p>
    </motion.div>
  );
}

// ---------- Main Component ----------

export default function PlayerLobby({
  players,
  maxPlayers = 4,
  isHost = false,
  onToggleReady,
  onKickPlayer,
  selfReady = false,
}: PlayerLobbyProps) {
  const emptySlots = Math.max(0, maxPlayers - players.length);

  return (
    <div className="space-y-6">
      {/* Player count header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-heading font-semibold text-white text-lg">Players</h3>
          <span className="px-2.5 py-1 rounded-full bg-white/10 text-xs font-semibold text-slate-300">
            {players.length}/{maxPlayers}
          </span>
        </div>

        {/* Ready toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleReady}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
            selfReady
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
              : 'bg-white/10 text-slate-300 hover:bg-white/15'
          }`}
        >
          {selfReady ? (
            <>
              <Check className="w-4 h-4" />
              Ready!
            </>
          ) : (
            <>
              <X className="w-4 h-4" />
              Not Ready
            </>
          )}
        </motion.button>
      </div>

      {/* Player grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              isHost={isHost}
              onKick={onKickPlayer}
            />
          ))}
        </AnimatePresence>
        {Array.from({ length: emptySlots }).map((_, i) => (
          <EmptySlot key={`empty-${i}`} index={i} />
        ))}
      </div>
    </div>
  );
}
