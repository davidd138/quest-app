'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Bell, BellRing, Timer, Zap } from 'lucide-react';

// ---------- Types ----------

type CountdownMode = 'upcoming' | 'active' | 'expired';

interface QuestCountdownProps {
  /** ISO timestamp when the quest becomes available */
  availableAt?: string;
  /** ISO timestamp when the quest expires */
  expiresAt?: string;
  /** Callback when user clicks "Notify me" */
  onNotify?: () => void;
  /** Whether user already opted into notification */
  notified?: boolean;
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

// ---------- Helpers ----------

function getTimeRemaining(targetDate: Date): TimeRemaining {
  const now = Date.now();
  const diff = Math.max(0, targetDate.getTime() - now);
  const totalSeconds = Math.floor(diff / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    totalSeconds,
  };
}

function getMode(availableAt?: string, expiresAt?: string): CountdownMode {
  const now = Date.now();
  if (availableAt && new Date(availableAt).getTime() > now) return 'upcoming';
  if (expiresAt && new Date(expiresAt).getTime() > now) return 'active';
  return 'expired';
}

function getUrgencyColor(totalSeconds: number, mode: CountdownMode) {
  if (mode === 'expired') return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', digit: 'bg-slate-500/20' };
  if (mode === 'upcoming') return { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', digit: 'bg-cyan-500/20' };

  // Active mode: green -> yellow -> red based on time left
  if (totalSeconds > 3600) return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', digit: 'bg-emerald-500/20' };
  if (totalSeconds > 900) return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', digit: 'bg-amber-500/20' };
  return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', digit: 'bg-rose-500/20' };
}

// ---------- Sub-components ----------

function FlipDigit({ value, label, color }: { value: number; label: string; color: string }) {
  const display = value.toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={value}
            initial={{ rotateX: -90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: 90, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`${color} rounded-lg px-2.5 py-1.5 font-mono text-xl font-bold tracking-wider backdrop-blur-sm min-w-[44px] text-center`}
            style={{ perspective: 200 }}
          >
            {display}
          </motion.div>
        </AnimatePresence>
      </div>
      <span className="text-[9px] font-medium text-slate-500 uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

function Separator({ color }: { color: string }) {
  return (
    <motion.div
      animate={{ opacity: [1, 0.3, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
      className={`font-mono text-lg font-bold ${color} self-start mt-1.5`}
    >
      :
    </motion.div>
  );
}

// ---------- Main Component ----------

const QuestCountdown: React.FC<QuestCountdownProps> = ({
  availableAt,
  expiresAt,
  onNotify,
  notified = false,
  className = '',
}) => {
  const [mode, setMode] = useState<CountdownMode>(() => getMode(availableAt, expiresAt));
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(() => {
    const target = mode === 'upcoming' ? availableAt : expiresAt;
    return target ? getTimeRemaining(new Date(target)) : { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
  });
  const [showNotifyConfirm, setShowNotifyConfirm] = useState(false);

  const tick = useCallback(() => {
    const currentMode = getMode(availableAt, expiresAt);
    setMode(currentMode);

    const target = currentMode === 'upcoming' ? availableAt : expiresAt;
    if (target) {
      setTimeLeft(getTimeRemaining(new Date(target)));
    }
  }, [availableAt, expiresAt]);

  useEffect(() => {
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  const handleNotify = () => {
    onNotify?.();
    setShowNotifyConfirm(true);
    setTimeout(() => setShowNotifyConfirm(false), 2000);
  };

  const colors = getUrgencyColor(timeLeft.totalSeconds, mode);

  const modeLabels: Record<CountdownMode, { icon: React.ElementType; title: string; subtitle: string }> = {
    upcoming: { icon: Clock, title: 'Available In', subtitle: 'This quest opens soon' },
    active: { icon: Timer, title: 'Ends In', subtitle: 'Complete before time runs out' },
    expired: { icon: Clock, title: 'Expired', subtitle: 'This quest is no longer available' },
  };

  const modeInfo = modeLabels[mode];
  const ModeIcon = modeInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border ${colors.border} ${colors.bg} backdrop-blur-xl p-5 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
            <ModeIcon size={16} className={colors.text} />
          </div>
          <div>
            <h4 className={`text-sm font-semibold ${colors.text}`}>{modeInfo.title}</h4>
            <p className="text-[10px] text-slate-500">{modeInfo.subtitle}</p>
          </div>
        </div>

        {/* Urgency pulse for active quests about to expire */}
        {mode === 'active' && timeLeft.totalSeconds <= 900 && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="flex items-center gap-1 text-xs text-rose-400 font-medium"
          >
            <Zap size={12} />
            <span>Hurry!</span>
          </motion.div>
        )}
      </div>

      {/* Countdown display */}
      {mode !== 'expired' ? (
        <div className="flex items-center justify-center gap-2 mb-4">
          {timeLeft.days > 0 && (
            <>
              <FlipDigit value={timeLeft.days} label="Days" color={`${colors.digit} ${colors.text}`} />
              <Separator color={colors.text} />
            </>
          )}
          <FlipDigit value={timeLeft.hours} label="Hours" color={`${colors.digit} ${colors.text}`} />
          <Separator color={colors.text} />
          <FlipDigit value={timeLeft.minutes} label="Min" color={`${colors.digit} ${colors.text}`} />
          <Separator color={colors.text} />
          <FlipDigit value={timeLeft.seconds} label="Sec" color={`${colors.digit} ${colors.text}`} />
        </div>
      ) : (
        <div className="flex items-center justify-center py-4 mb-4">
          <p className="text-sm text-slate-500">This quest has ended</p>
        </div>
      )}

      {/* Notify me button for upcoming quests */}
      {mode === 'upcoming' && onNotify && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleNotify}
          disabled={notified || showNotifyConfirm}
          className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            notified || showNotifyConfirm
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 cursor-default'
              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30'
          }`}
        >
          <AnimatePresence mode="wait">
            {showNotifyConfirm ? (
              <motion.span
                key="confirmed"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-2"
              >
                <BellRing size={14} />
                You will be notified!
              </motion.span>
            ) : notified ? (
              <motion.span
                key="notified"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <BellRing size={14} />
                Notification set
              </motion.span>
            ) : (
              <motion.span
                key="notify"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <Bell size={14} />
                Notify me when available
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      )}

      {/* Progress bar for active quests */}
      {mode === 'active' && expiresAt && availableAt && (
        <div className="mt-1">
          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                timeLeft.totalSeconds > 3600
                  ? 'bg-emerald-500'
                  : timeLeft.totalSeconds > 900
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
              }`}
              animate={{
                width: `${Math.max(
                  0,
                  (timeLeft.totalSeconds /
                    ((new Date(expiresAt).getTime() - new Date(availableAt).getTime()) / 1000)) *
                    100
                )}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default QuestCountdown;
