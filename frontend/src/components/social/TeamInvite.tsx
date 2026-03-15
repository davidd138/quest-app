'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Check,
  X,
  Clock,
  Compass,
  Sparkles,
} from 'lucide-react';

// ---------- Types ----------

interface TeamInviteProps {
  inviteId: string;
  questTitle: string;
  questDifficulty?: string;
  questThumbnail?: string;
  inviterName: string;
  inviterAvatar: string | null;
  /** ISO timestamp when the invite expires */
  expiresAt: string;
  /** Number of remaining spots */
  spotsRemaining: number;
  /** Total team size */
  totalSpots: number;
  /** Current team members (names/avatars) */
  teamMembers?: { name: string; avatar: string | null }[];
  onAccept?: (inviteId: string) => void;
  onDecline?: (inviteId: string) => void;
  className?: string;
}

type InviteStatus = 'pending' | 'accepted' | 'declined' | 'expired';

// ---------- Helpers ----------

function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Expired';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

function getInitials(name: string): string {
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
];

function getGradient(name: string): string {
  return avatarGradients[name.charCodeAt(0) % avatarGradients.length];
}

const difficultyConfig: Record<string, { label: string; color: string }> = {
  easy: { label: 'Easy', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  medium: { label: 'Medium', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  hard: { label: 'Hard', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  legendary: { label: 'Legendary', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
};

// ---------- Sub-components ----------

function AvatarBubble({ name, avatar }: { name: string; avatar: string | null }) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className="w-7 h-7 rounded-full object-cover border-2 border-slate-900"
        title={name}
      />
    );
  }
  return (
    <div
      className={`w-7 h-7 rounded-full bg-gradient-to-br ${getGradient(name)} flex items-center justify-center text-[9px] font-bold text-white border-2 border-slate-900`}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}

// ---------- Main Component ----------

const TeamInvite: React.FC<TeamInviteProps> = ({
  inviteId,
  questTitle,
  questDifficulty,
  inviterName,
  inviterAvatar,
  expiresAt,
  spotsRemaining,
  totalSpots,
  teamMembers = [],
  onAccept,
  onDecline,
  className = '',
}) => {
  const [status, setStatus] = useState<InviteStatus>('pending');
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  });

  const tick = useCallback(() => {
    const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
    const remaining = Math.max(0, diff);
    setSecondsLeft(remaining);
    if (remaining <= 0 && status === 'pending') {
      setStatus('expired');
    }
  }, [expiresAt, status]);

  useEffect(() => {
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  const handleAccept = () => {
    setStatus('accepted');
    onAccept?.(inviteId);
  };

  const handleDecline = () => {
    setStatus('declined');
    onDecline?.(inviteId);
  };

  const isUrgent = secondsLeft > 0 && secondsLeft < 300;
  const diffConfig = questDifficulty ? difficultyConfig[questDifficulty] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`relative rounded-2xl border border-violet-500/20 bg-white/[0.02] backdrop-blur-xl overflow-hidden ${className}`}
    >
      {/* Violet accent gradient top edge */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500" />

      <div className="p-5">
        {/* Header: Inviter info */}
        <div className="flex items-center gap-3 mb-4">
          {inviterAvatar ? (
            <img
              src={inviterAvatar}
              alt={inviterName}
              className="w-9 h-9 rounded-full object-cover border border-violet-500/30"
            />
          ) : (
            <div
              className={`w-9 h-9 rounded-full bg-gradient-to-br ${getGradient(inviterName)} flex items-center justify-center text-xs font-bold text-white border border-violet-500/30`}
            >
              {getInitials(inviterName)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-200">
              <span className="font-semibold text-white">{inviterName}</span>
              <span className="text-slate-400"> invited you to join</span>
            </p>
          </div>
          <Sparkles className="w-4 h-4 text-violet-400 flex-shrink-0" />
        </div>

        {/* Quest preview card */}
        <div className="rounded-xl bg-violet-500/5 border border-violet-500/10 p-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center flex-shrink-0">
              <Compass className="w-5 h-5 text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">{questTitle}</p>
              {diffConfig && (
                <span className={`inline-block mt-1 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${diffConfig.color}`}>
                  {diffConfig.label}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Team members + spots */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-slate-500" />
            <div className="flex -space-x-2">
              {teamMembers.slice(0, 4).map((member, i) => (
                <AvatarBubble key={i} name={member.name} avatar={member.avatar} />
              ))}
              {teamMembers.length > 4 && (
                <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-300 border-2 border-slate-900">
                  +{teamMembers.length - 4}
                </div>
              )}
            </div>
          </div>
          <span className={`text-xs font-medium ${spotsRemaining <= 1 ? 'text-rose-400' : 'text-slate-400'}`}>
            {spotsRemaining} of {totalSpots} spot{spotsRemaining !== 1 ? 's' : ''} left
          </span>
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-1.5 mb-4 text-xs ${
          isUrgent ? 'text-rose-400' : 'text-slate-500'
        }`}>
          <Clock size={12} />
          <span className="font-medium">
            {status === 'expired'
              ? 'Invite expired'
              : `Expires in ${formatTimeRemaining(secondsLeft)}`}
          </span>
          {isUrgent && (
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-rose-400 font-semibold"
            >
              Hurry!
            </motion.span>
          )}
        </div>

        {/* Action buttons */}
        <AnimatePresence mode="wait">
          {status === 'pending' && (
            <motion.div
              key="actions"
              exit={{ opacity: 0, y: -5 }}
              className="flex gap-3"
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAccept}
                disabled={secondsLeft <= 0}
                className="flex-1 py-2.5 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30 hover:bg-violet-500/30 text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Check size={14} />
                Accept
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleDecline}
                className="flex-1 py-2.5 rounded-xl bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <X size={14} />
                Decline
              </motion.button>
            </motion.div>
          )}

          {status === 'accepted' && (
            <motion.div
              key="accepted"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium text-center flex items-center justify-center gap-2"
            >
              <Check size={14} />
              You joined the team!
            </motion.div>
          )}

          {status === 'declined' && (
            <motion.div
              key="declined"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-500 text-sm font-medium text-center"
            >
              Invite declined
            </motion.div>
          )}

          {status === 'expired' && (
            <motion.div
              key="expired"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-2.5 rounded-xl bg-slate-500/10 border border-slate-500/20 text-slate-500 text-sm font-medium text-center"
            >
              This invite has expired
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TeamInvite;
