'use client';

import { motion } from 'framer-motion';

function SpinningCompass() {
  return (
    <motion.div
      className="w-24 h-24"
      animate={{ rotate: 360 }}
      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
    >
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="loadRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <linearGradient id="loadNeedleN" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="loadNeedleS" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#065f46" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="55" stroke="url(#loadRing)" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
        <circle cx="60" cy="60" r="42" stroke="#a78bfa" strokeWidth="1.5" opacity="0.3" />
        {[0, 90, 180, 270].map((angle) => {
          const rad = ((angle - 90) * Math.PI) / 180;
          const x1 = 60 + Math.cos(rad) * 42;
          const y1 = 60 + Math.sin(rad) * 42;
          const x2 = 60 + Math.cos(rad) * 49;
          const y2 = 60 + Math.sin(rad) * 49;
          return (
            <line
              key={angle}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#a78bfa"
              strokeWidth="2"
              strokeLinecap="round"
            />
          );
        })}
        <motion.g
          style={{ transformOrigin: '60px 60px' }}
          animate={{ rotate: [0, 15, -10, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <polygon points="60,18 54,60 66,60" fill="url(#loadNeedleN)" />
          <polygon points="60,102 54,60 66,60" fill="url(#loadNeedleS)" />
        </motion.g>
        <circle cx="60" cy="60" r="6" fill="#7c3aed" />
        <circle cx="60" cy="60" r="3" fill="white" />
      </svg>
    </motion.div>
  );
}

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-navy-950">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-emerald-600/5 blur-[80px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Compass */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <SpinningCompass />
        </motion.div>

        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center"
        >
          <h1 className="font-heading text-3xl font-bold text-white">
            Quest
            <span className="bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
              Master
            </span>
          </h1>
        </motion.div>

        {/* Loading bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-48 h-1 rounded-full bg-slate-800 overflow-hidden"
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>

        {/* Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-sm text-slate-500"
        >
          Preparando tu aventura...
        </motion.p>
      </div>
    </div>
  );
}
