'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, AlertTriangle, Clock, ChevronDown, ChevronUp } from 'lucide-react';

// ---------- Types ----------

interface Hint {
  id: string;
  text: string;
  level: 'vague' | 'moderate' | 'direct';
}

interface HintSystemProps {
  hints: Hint[];
  hintsUsed: number;
  scorePenaltyPerHint: number;
  cooldownSeconds?: number;
  onUseHint?: (hintIndex: number) => void;
  className?: string;
}

// ---------- Typewriter Effect ----------

function TypewriterText({ text, speed = 30 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setDisplayedText(text.slice(0, idx));
      if (idx >= text.length) {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span className="text-[11px] text-slate-200 leading-relaxed">
      {displayedText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-0.5 h-3 bg-violet-400 ml-0.5 align-middle"
        />
      )}
    </span>
  );
}

// ---------- Cooldown Timer ----------

function CooldownTimer({
  seconds,
  onComplete,
}: {
  seconds: number;
  onComplete: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, onComplete]);

  return (
    <div className="flex items-center gap-1.5 text-slate-500">
      <Clock size={12} />
      <span className="text-[10px] font-mono">{remaining}s cooldown</span>
    </div>
  );
}

// ---------- Confirmation Dialog ----------

function ConfirmDialog({
  penalty,
  hintLevel,
  onConfirm,
  onCancel,
}: {
  penalty: number;
  hintLevel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20"
    >
      <div className="flex items-start gap-2 mb-3">
        <AlertTriangle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-medium text-white mb-1">Use this hint?</p>
          <p className="text-[10px] text-slate-400">
            This {hintLevel} hint will cost you{' '}
            <span className="text-amber-400 font-medium">-{penalty} points</span> from your score.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-[11px] font-medium hover:bg-white/10 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/25 text-amber-400 text-[11px] font-medium hover:bg-amber-500/25 transition-all"
        >
          Use Hint
        </button>
      </div>
    </motion.div>
  );
}

// ---------- Hint Card ----------

function HintCard({ hint }: { hint: Hint }) {
  const levelConfig = {
    vague: { label: 'Vague', color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
    moderate: { label: 'Moderate', color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/5' },
    direct: { label: 'Direct', color: 'text-rose-400', border: 'border-rose-500/20', bg: 'bg-rose-500/5' },
  };
  const config = levelConfig[hint.level];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-3 rounded-xl ${config.bg} border ${config.border} backdrop-blur-sm`}
      style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Lightbulb size={10} className={config.color} />
        <span className={`text-[9px] font-bold uppercase tracking-wider ${config.color}`}>
          {config.label} Hint
        </span>
      </div>
      <TypewriterText text={hint.text} />
    </motion.div>
  );
}

// ---------- Main Component ----------

const HintSystem: React.FC<HintSystemProps> = ({
  hints,
  hintsUsed,
  scorePenaltyPerHint,
  cooldownSeconds = 10,
  onUseHint,
  className = '',
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  const [showRevealedHints, setShowRevealedHints] = useState(true);

  const totalHints = hints.length;
  const hintsRemaining = totalHints - hintsUsed;
  const nextHintIndex = hintsUsed;
  const totalPenalty = hintsUsed * scorePenaltyPerHint;

  const handleUseHint = useCallback(() => {
    setShowConfirm(true);
  }, []);

  const handleConfirm = useCallback(() => {
    setShowConfirm(false);
    onUseHint?.(nextHintIndex);
    if (cooldownSeconds > 0) {
      setIsCooldown(true);
    }
  }, [nextHintIndex, onUseHint, cooldownSeconds]);

  const handleCancelConfirm = useCallback(() => {
    setShowConfirm(false);
  }, []);

  const handleCooldownComplete = useCallback(() => {
    setIsCooldown(false);
  }, []);

  const canUseHint = hintsRemaining > 0 && !showConfirm && !isCooldown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb size={16} className="text-amber-400" />
          <span className="text-sm font-medium text-white">Hints</span>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalHints }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < hintsUsed ? 'bg-amber-400' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Counter */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-slate-400">
          {hintsRemaining} of {totalHints} hints remaining
        </span>
        {totalPenalty > 0 && (
          <span className="text-[10px] text-rose-400 font-medium">
            -{totalPenalty} pts penalty
          </span>
        )}
      </div>

      {/* Cooldown */}
      {isCooldown && (
        <div className="mb-3">
          <CooldownTimer
            seconds={cooldownSeconds}
            onComplete={handleCooldownComplete}
          />
        </div>
      )}

      {/* Use Hint Button */}
      <button
        onClick={handleUseHint}
        disabled={!canUseHint}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all mb-4 ${
          canUseHint
            ? 'bg-amber-500/15 border border-amber-500/25 text-amber-400 hover:bg-amber-500/25 cursor-pointer'
            : 'bg-white/[0.02] border border-white/5 text-slate-600 cursor-not-allowed'
        }`}
      >
        <Lightbulb size={14} />
        {hintsRemaining > 0
          ? `Use Hint (-${scorePenaltyPerHint} pts)`
          : 'No Hints Remaining'}
      </button>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirm && nextHintIndex < totalHints && (
          <div className="mb-4">
            <ConfirmDialog
              penalty={scorePenaltyPerHint}
              hintLevel={hints[nextHintIndex].level}
              onConfirm={handleConfirm}
              onCancel={handleCancelConfirm}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Revealed Hints */}
      {hintsUsed > 0 && (
        <>
          <button
            onClick={() => setShowRevealedHints((s) => !s)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-300 transition-colors mb-3"
          >
            <span>Revealed hints ({hintsUsed})</span>
            {showRevealedHints ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <AnimatePresence>
            {showRevealedHints && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-2"
              >
                {hints.slice(0, hintsUsed).map((hint) => (
                  <HintCard key={hint.id} hint={hint} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Score Penalty Info */}
      <div className="mt-4 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
        <div className="flex items-start gap-2">
          <AlertTriangle size={10} className="text-slate-500 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Each hint costs {scorePenaltyPerHint} points. Hints progress from vague to direct.
            Use wisely!
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default HintSystem;
