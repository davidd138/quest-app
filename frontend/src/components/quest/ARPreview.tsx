'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Navigation,
  Crosshair,
  Eye,
  Sparkles,
  MapPin,
  MessageSquare,
  HelpCircle,
  BookOpen,
  Handshake,
  Megaphone,
  Compass,
  Lightbulb,
} from 'lucide-react';
import type { Stage, ChallengeType } from '@/types';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface ARPreviewProps {
  stage: Stage;
  stageIndex: number;
  totalStages: number;
  distanceMeters?: number;
  className?: string;
}

/* ─── Challenge type icons ───────────────────────────────────────────── */

const challengeIcons: Record<ChallengeType, React.ElementType> = {
  conversation: MessageSquare,
  riddle: HelpCircle,
  knowledge: BookOpen,
  negotiation: Handshake,
  persuasion: Megaphone,
  exploration: Compass,
  trivia: Lightbulb,
};

/* ─── Helpers ────────────────────────────────────────────────────────── */

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

/* ─── Scan Lines Effect ──────────────────────────────────────────────── */

function ScanLines() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Horizontal scan lines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)',
        }}
      />
      {/* Moving scan line */}
      <motion.div
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-400/40 to-transparent"
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

/* ─── Component ──────────────────────────────────────────────────────── */

const ARPreview: React.FC<ARPreviewProps> = ({
  stage,
  stageIndex,
  totalStages,
  distanceMeters = 150,
  className = '',
}) => {
  const [showInfo, setShowInfo] = useState(true);
  const ChallengeIcon = challengeIcons[stage.challenge.type] ?? Crosshair;

  return (
    <div
      className={`relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-navy-950 border border-white/10 ${className}`}
    >
      {/* Simulated camera background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-navy-950 to-slate-900">
        {/* Grid pattern to simulate environment */}
        <svg
          className="absolute inset-0 w-full h-full opacity-5"
          aria-hidden="true"
        >
          <defs>
            <pattern id="ar-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ar-grid)" />
        </svg>

        {/* Depth gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </div>

      {/* Scan lines effect */}
      <ScanLines />

      {/* Viewfinder frame */}
      <div className="absolute inset-4 pointer-events-none" aria-hidden="true">
        {/* Corner brackets */}
        {(['top-0 left-0', 'top-0 right-0 rotate-90', 'bottom-0 right-0 rotate-180', 'bottom-0 left-0 -rotate-90'] as const).map(
          (pos, i) => (
            <div key={i} className={`absolute ${pos}`}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path
                  d="M2 12 L2 2 L12 2"
                  stroke="rgba(139, 92, 246, 0.6)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          ),
        )}

        {/* Center crosshair */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Crosshair size={24} className="text-violet-400/50" />
          </motion.div>
        </div>
      </div>

      {/* Character avatar floating overlay */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%]"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="relative">
          {/* Glow ring */}
          <motion.div
            className="absolute -inset-3 rounded-full bg-violet-500/20 blur-md"
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {/* Avatar circle */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/30 to-violet-700/30 backdrop-blur-sm border-2 border-violet-400/40 flex items-center justify-center">
            <span className="text-xl" role="img" aria-label="Character">
              {stage.character.avatarUrl ? (
                <img
                  src={stage.character.avatarUrl}
                  alt={stage.character.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-violet-300">
                  {stage.character.name.charAt(0)}
                </span>
              )}
            </span>
          </div>
          {/* Character name tag */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-[10px] font-medium text-violet-300 bg-violet-500/10 backdrop-blur-sm px-2 py-0.5 rounded-full border border-violet-500/20">
              {stage.character.name}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Challenge type icon overlay */}
      <motion.div
        className="absolute top-4 right-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="w-10 h-10 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center">
          <ChallengeIcon size={18} className="text-violet-400" />
        </div>
      </motion.div>

      {/* Stage info overlay */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div className="px-2.5 py-1 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10">
          <span className="text-[10px] font-semibold text-slate-300">
            Stage {stageIndex + 1}/{totalStages}
          </span>
        </div>
        <motion.div
          className="px-2.5 py-1 rounded-lg bg-violet-500/10 backdrop-blur-xl border border-violet-500/20 flex items-center gap-1"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Camera size={10} className="text-violet-400" />
          <span className="text-[10px] font-medium text-violet-300">LIVE</span>
        </motion.div>
      </div>

      {/* Distance indicator */}
      <motion.div
        className="absolute bottom-20 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
          <Navigation size={12} className="text-emerald-400" />
          <span className="text-xs font-medium text-white">
            {formatDistance(distanceMeters)}
          </span>
          <span className="text-[10px] text-slate-400">away</span>
        </div>
      </motion.div>

      {/* "Point your camera" instruction */}
      <motion.div
        className="absolute bottom-28 left-1/2 -translate-x-1/2 text-center"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <p className="text-[11px] text-slate-400 whitespace-nowrap">
          Point your camera at the location
        </p>
      </motion.div>

      {/* Glass morphism info panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 p-4"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">
                    {stage.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                    {stage.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-[10px] text-slate-500">
                      <MapPin size={10} />
                      {stage.location.name}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-violet-400">
                      <Sparkles size={10} />
                      {stage.points} pts
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowInfo(false)}
                  className="p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Hide info panel"
                >
                  <Eye size={14} className="text-slate-400" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show info toggle when hidden */}
      {!showInfo && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowInfo(true)}
          className="absolute bottom-4 right-4 p-2 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Show info panel"
        >
          <Eye size={14} className="text-violet-400" />
        </motion.button>
      )}

      {/* "AR Mode Coming Soon" badge */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-12"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-500/20 to-amber-500/20 backdrop-blur-xl border border-violet-500/30">
          <div className="flex items-center gap-1.5">
            <Sparkles size={12} className="text-amber-400" />
            <span className="text-[11px] font-semibold text-white">
              AR Mode Coming Soon
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ARPreview;
