'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Puzzle,
  BookOpen,
  Handshake,
  Megaphone,
  Compass,
  Lightbulb,
} from 'lucide-react';
import type { Stage, ChallengeType } from '@/types';

// ---------- Types ----------

interface QuestChallengesProps {
  stages: Stage[];
  className?: string;
}

interface ChallengeTypeInfo {
  type: ChallengeType;
  label: string;
  icon: React.FC<{ size?: number; className?: string }>;
  color: string;
  bg: string;
  border: string;
  glow: string;
  description: string;
}

// ---------- Config ----------

const challengeTypes: ChallengeTypeInfo[] = [
  {
    type: 'conversation',
    label: 'Conversation',
    icon: MessageSquare,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    glow: 'group-hover:shadow-violet-500/20',
    description:
      'Engage in dialogue with AI characters. Demonstrate communication skills, empathy, and active listening to navigate complex conversational scenarios.',
  },
  {
    type: 'riddle',
    label: 'Riddle',
    icon: Puzzle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    glow: 'group-hover:shadow-amber-500/20',
    description:
      'Solve clever puzzles and brain teasers. Think creatively and analyze clues to crack riddles presented by characters in the quest world.',
  },
  {
    type: 'knowledge',
    label: 'Knowledge',
    icon: BookOpen,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    glow: 'group-hover:shadow-blue-500/20',
    description:
      'Demonstrate your understanding of specific topics. Answer questions and provide detailed explanations to prove your expertise.',
  },
  {
    type: 'negotiation',
    label: 'Negotiation',
    icon: Handshake,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    glow: 'group-hover:shadow-emerald-500/20',
    description:
      'Strike deals and find compromises with AI characters. Balance competing interests to reach mutually beneficial agreements.',
  },
  {
    type: 'persuasion',
    label: 'Persuasion',
    icon: Megaphone,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    glow: 'group-hover:shadow-rose-500/20',
    description:
      'Convince characters of your viewpoint through compelling arguments. Build your case with evidence, emotion, and rhetoric.',
  },
  {
    type: 'exploration',
    label: 'Exploration',
    icon: Compass,
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/20',
    glow: 'group-hover:shadow-teal-500/20',
    description:
      'Discover hidden details and navigate environments. Use observation and curiosity to uncover secrets and complete objectives.',
  },
  {
    type: 'trivia',
    label: 'Trivia',
    icon: Lightbulb,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    glow: 'group-hover:shadow-yellow-500/20',
    description:
      'Test your general knowledge across various topics. Quick thinking and a broad knowledge base will serve you well.',
  },
];

// ---------- Challenge Card ----------

function ChallengeCard({
  info,
  count,
  index,
}: {
  info: ChallengeTypeInfo;
  count: number;
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = info.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative rounded-2xl border ${info.border} ${info.bg} p-5 transition-all duration-300 hover:shadow-xl ${info.glow} cursor-default overflow-hidden`}
    >
      {/* Background icon (subtle) */}
      <div className="absolute -bottom-4 -right-4 opacity-[0.04] pointer-events-none">
        <Icon size={96} />
      </div>

      <div className="relative">
        {/* Icon + count */}
        <div className="flex items-start justify-between mb-3">
          <motion.div
            animate={isHovered ? { rotate: [0, -10, 10, 0], scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.4 }}
            className={`w-12 h-12 rounded-xl ${info.bg} border ${info.border} flex items-center justify-center`}
          >
            <Icon size={22} className={info.color} />
          </motion.div>

          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold ${info.bg} ${info.color} border ${info.border}`}
          >
            {count}x
          </span>
        </div>

        {/* Label */}
        <h4 className="text-sm font-semibold text-white mb-1">{info.label}</h4>

        {/* Description (shown on hover) */}
        <AnimatePresence>
          {isHovered ? (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-slate-400 leading-relaxed overflow-hidden"
            >
              {info.description}
            </motion.p>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-slate-600"
            >
              Hover to learn more
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ---------- Main Component ----------

const QuestChallenges: React.FC<QuestChallengesProps> = ({
  stages,
  className = '',
}) => {
  // Count challenge types in this quest
  const typeCounts = useMemo(() => {
    const counts = new Map<ChallengeType, number>();
    stages.forEach((stage) => {
      const t = stage.challenge.type;
      counts.set(t, (counts.get(t) ?? 0) + 1);
    });
    return counts;
  }, [stages]);

  // Filter to only types present in the quest
  const presentTypes = challengeTypes.filter(
    (ct) => (typeCounts.get(ct.type) ?? 0) > 0,
  );

  if (presentTypes.length === 0) return null;

  return (
    <div className={className}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {presentTypes.map((info, idx) => (
          <ChallengeCard
            key={info.type}
            info={info}
            count={typeCounts.get(info.type) ?? 0}
            index={idx}
          />
        ))}
      </div>
    </div>
  );
};

export default QuestChallenges;
