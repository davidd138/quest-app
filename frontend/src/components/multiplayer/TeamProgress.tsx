'use client';

import { motion } from 'framer-motion';
import {
  Zap,
  Clock,
  TrendingUp,
  CheckCircle2,
  Loader2,
  ChevronRight,
} from 'lucide-react';

// ---------- Types ----------

export interface TeamMember {
  id: string;
  name: string;
  currentStage: number;
  totalStages: number;
  points: number;
  isAhead: boolean;
  isBehind: boolean;
  isWaiting: boolean;
  isSelf?: boolean;
}

interface TeamProgressProps {
  members: TeamMember[];
  teamPoints: number;
  questTitle?: string;
}

// ---------- Helpers ----------

const avatarGradients = [
  'from-violet-500 to-fuchsia-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
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

function MemberProgressRow({ member, index }: { member: TeamMember; index: number }) {
  const progress = (member.currentStage / member.totalStages) * 100;
  const gradient = avatarGradients[index % avatarGradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={`relative rounded-xl p-4 border transition-all ${
        member.isSelf
          ? 'bg-violet-500/5 border-violet-500/20'
          : 'bg-white/[0.02] border-white/5'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white text-xs shadow-lg`}
          >
            {getInitials(member.name)}
          </div>
          {member.isWaiting && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-navy-900 flex items-center justify-center"
            >
              <Loader2 className="w-3 h-3 text-amber-400" />
            </motion.div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-semibold ${
                  member.isSelf ? 'text-violet-400' : 'text-white'
                }`}
              >
                {member.name}
                {member.isSelf && (
                  <span className="text-[10px] text-violet-500 ml-1">(you)</span>
                )}
              </span>

              {member.isAhead && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold">
                  <TrendingUp className="w-2.5 h-2.5" />
                  Ahead
                </span>
              )}
              {member.isBehind && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-semibold">
                  <Clock className="w-2.5 h-2.5" />
                  Behind
                </span>
              )}
              {member.isWaiting && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-slate-500/15 text-slate-400 text-[10px] font-semibold">
                  <Loader2 className="w-2.5 h-2.5" />
                  Waiting
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span className="text-white font-semibold">{member.currentStage}</span>
              <span>/</span>
              <span>{member.totalStages}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-navy-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: index * 0.15, ease: 'easeOut' }}
              className={`h-full rounded-full relative ${
                member.isAhead
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : member.isBehind
                  ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                  : 'bg-gradient-to-r from-violet-500 to-fuchsia-400'
              }`}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              />
            </motion.div>
          </div>
        </div>

        {/* Points contribution */}
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-1 text-sm font-semibold text-emerald-400">
            <Zap className="w-3.5 h-3.5" />
            {member.points.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500">pts</p>
        </div>
      </div>
    </motion.div>
  );
}

function StageTimeline({ members }: { members: TeamMember[] }) {
  const maxStages = Math.max(...members.map((m) => m.totalStages));
  const stages = Array.from({ length: maxStages }, (_, i) => i + 1);

  return (
    <div className="relative">
      {/* Stage markers */}
      <div className="flex items-center justify-between px-2">
        {stages.map((stage) => {
          const playersAtStage = members.filter((m) => m.currentStage === stage);
          const anyCompleted = members.some((m) => m.currentStage > stage);
          const allCompleted = members.every((m) => m.currentStage >= stage);

          return (
            <div key={stage} className="flex flex-col items-center gap-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: stage * 0.08, type: 'spring' }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  allCompleted
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                    : anyCompleted
                    ? 'bg-violet-500/30 text-violet-300 border border-violet-500/40'
                    : 'bg-white/5 text-slate-600 border border-white/10'
                }`}
              >
                {allCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  stage
                )}
              </motion.div>

              {/* Player indicators at this stage */}
              {playersAtStage.length > 0 && (
                <div className="flex -space-x-1">
                  {playersAtStage.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className={`w-4 h-4 rounded-full bg-gradient-to-br ${
                        avatarGradients[members.indexOf(p) % avatarGradients.length]
                      } border border-navy-900`}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Connecting line */}
      <div className="absolute top-4 left-6 right-6 h-0.5 bg-white/5 -z-10" />
    </div>
  );
}

// ---------- Main Component ----------

export default function TeamProgress({
  members,
  teamPoints,
  questTitle,
}: TeamProgressProps) {
  const allStages = members.reduce((sum, m) => sum + m.currentStage, 0);
  const totalStages = members.reduce((sum, m) => sum + m.totalStages, 0);
  const overallProgress = totalStages > 0 ? Math.round((allStages / totalStages) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Team stats header */}
      <div className="glass rounded-2xl p-6 border border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 via-transparent to-emerald-600/5" />

        <div className="relative">
          {questTitle && (
            <div className="flex items-center gap-2 mb-4">
              <ChevronRight className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-slate-400">
                Team Quest: <span className="text-white font-medium">{questTitle}</span>
              </span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-2xl font-heading font-bold text-white"
              >
                {teamPoints.toLocaleString()}
              </motion.p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">
                Team Points
              </p>
            </div>
            <div className="text-center">
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-heading font-bold text-emerald-400"
              >
                {overallProgress}%
              </motion.p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">
                Progress
              </p>
            </div>
            <div className="text-center">
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-heading font-bold text-violet-400"
              >
                {members.length}
              </motion.p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">
                Players
              </p>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="mt-5">
            <div className="w-full h-3 rounded-full bg-navy-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-500 relative"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Stage timeline */}
      {members.length > 0 && members[0].totalStages <= 10 && (
        <div className="glass rounded-2xl p-6 border border-white/10">
          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Stage Overview
          </h4>
          <StageTimeline members={members} />
        </div>
      )}

      {/* Individual progress */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Individual Progress
        </h4>
        {members.map((member, i) => (
          <MemberProgressRow key={member.id} member={member} index={i} />
        ))}
      </div>
    </div>
  );
}
