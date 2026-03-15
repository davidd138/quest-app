'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users } from 'lucide-react';

// ---------- Types ----------

interface LivePlayerCountProps {
  questId?: string;
  className?: string;
}

interface MockPlayer {
  id: string;
  name: string;
  avatarColor: string;
}

// ---------- Mock Data ----------

const avatarColors = [
  'bg-violet-500', 'bg-fuchsia-500', 'bg-cyan-500',
  'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
  'bg-indigo-500', 'bg-teal-500',
];

const mockNames = [
  'Ana', 'Carlos', 'Maria', 'Luis', 'Elena',
  'Pablo', 'Sofia', 'Diego', 'Laura', 'Javier',
  'Carmen', 'Andres', 'Lucia', 'Miguel', 'Isabel',
];

function generateMockPlayers(count: number): MockPlayer[] {
  return Array.from({ length: Math.min(count, 8) }).map((_, i) => ({
    id: `player-${i}`,
    name: mockNames[i % mockNames.length],
    avatarColor: avatarColors[i % avatarColors.length],
  }));
}

// ---------- Main Component ----------

export default function LivePlayerCount({ questId, className = '' }: LivePlayerCountProps) {
  const [playerCount, setPlayerCount] = useState(() => 8 + Math.floor(Math.random() * 20));
  const [players, setPlayers] = useState<MockPlayer[]>(() => generateMockPlayers(playerCount));
  const [prevCount, setPrevCount] = useState(playerCount);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate random fluctuation
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setPlayerCount((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const next = Math.max(3, Math.min(50, prev + delta));
        setPrevCount(prev);
        return next;
      });
    }, 4000 + Math.random() * 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    setPlayers(generateMockPlayers(playerCount));
  }, [playerCount]);

  const countDirection = playerCount > prevCount ? 'up' : playerCount < prevCount ? 'down' : 'same';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center gap-3
        glass rounded-full border border-white/10
        px-4 py-2.5
        ${className}
      `}
    >
      {/* Pulsing green dot */}
      <div className="relative flex-shrink-0">
        <motion.div
          animate={{
            scale: [1, 1.6, 1],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400"
        />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 relative" />
      </div>

      {/* Avatar stack */}
      <div className="flex -space-x-2">
        <AnimatePresence mode="popLayout">
          {players.slice(0, 5).map((player) => (
            <motion.div
              key={player.id}
              initial={{ scale: 0, x: -10 }}
              animate={{ scale: 1, x: 0 }}
              exit={{ scale: 0, x: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`
                w-6 h-6 rounded-full ${player.avatarColor}
                border-2 border-slate-900/80
                flex items-center justify-center
                text-[8px] font-bold text-white
              `}
              title={player.name}
            >
              {player.name[0]}
            </motion.div>
          ))}
        </AnimatePresence>
        {playerCount > 5 && (
          <motion.div
            className="w-6 h-6 rounded-full bg-white/10 border-2 border-slate-900/80 flex items-center justify-center text-[8px] font-medium text-slate-400"
          >
            +{playerCount - 5}
          </motion.div>
        )}
      </div>

      {/* Count */}
      <div className="flex items-center gap-1.5">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={playerCount}
            initial={{
              y: countDirection === 'up' ? 10 : -10,
              opacity: 0,
            }}
            animate={{ y: 0, opacity: 1 }}
            exit={{
              y: countDirection === 'up' ? -10 : 10,
              opacity: 0,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="text-sm font-bold text-white tabular-nums"
          >
            {playerCount}
          </motion.span>
        </AnimatePresence>
        <span className="text-xs text-slate-400">jugadores activos ahora</span>
      </div>

      {/* Users icon */}
      <Users size={14} className="text-slate-500 flex-shrink-0" />
    </motion.div>
  );
}
