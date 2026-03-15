'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Puzzle,
  BookOpen,
  Handshake,
  Megaphone,
  Compass,
  Lightbulb,
  Eye,
  EyeOff,
  Clock,
  HelpCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import type { Challenge, ChallengeType } from '@/types';
import Badge from '@/components/ui/Badge';

// ---------- Types ----------

interface ChallengePreviewProps {
  challenge: Challenge;
  previousAttempts?: number;
  hintsAvailable?: number;
  estimatedTime?: number;
  className?: string;
}

// ---------- Config ----------

interface ChallengeConfig {
  icon: React.FC<{ size?: number; className?: string }>;
  gradient: string;
  border: string;
  glow: string;
  color: 'violet' | 'emerald' | 'amber' | 'rose' | 'slate';
  label: string;
  tips: string[];
}

const challengeConfigs: Record<ChallengeType, ChallengeConfig> = {
  conversation: {
    icon: MessageSquare,
    gradient: 'from-violet-600/20 to-purple-600/20',
    border: 'border-violet-500/30',
    glow: 'shadow-violet-500/10',
    color: 'violet',
    label: 'Conversation',
    tips: [
      'Listen carefully to the character and respond thoughtfully',
      'Stay in context with the conversation topic',
      'Ask clarifying questions if unsure',
    ],
  },
  riddle: {
    icon: Puzzle,
    gradient: 'from-amber-600/20 to-orange-600/20',
    border: 'border-amber-500/30',
    glow: 'shadow-amber-500/10',
    color: 'amber',
    label: 'Riddle',
    tips: [
      'Think outside the box - answers are often metaphorical',
      'Pay attention to every word in the riddle',
      'Consider multiple interpretations before answering',
    ],
  },
  knowledge: {
    icon: BookOpen,
    gradient: 'from-blue-600/20 to-cyan-600/20',
    border: 'border-blue-500/30',
    glow: 'shadow-blue-500/10',
    color: 'slate',
    label: 'Knowledge',
    tips: [
      'Draw from your existing knowledge base',
      'Be specific and detailed in your answers',
      'Context clues in the question can help guide you',
    ],
  },
  negotiation: {
    icon: Handshake,
    gradient: 'from-emerald-600/20 to-teal-600/20',
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/10',
    color: 'emerald',
    label: 'Negotiation',
    tips: [
      'Understand what the other party values most',
      'Look for win-win solutions rather than compromises',
      'Be firm but respectful in your position',
    ],
  },
  persuasion: {
    icon: Megaphone,
    gradient: 'from-rose-600/20 to-pink-600/20',
    border: 'border-rose-500/30',
    glow: 'shadow-rose-500/10',
    color: 'rose',
    label: 'Persuasion',
    tips: [
      'Build your argument with clear evidence',
      'Appeal to emotions and logic equally',
      'Acknowledge counterarguments to strengthen your position',
    ],
  },
  exploration: {
    icon: Compass,
    gradient: 'from-teal-600/20 to-cyan-600/20',
    border: 'border-teal-500/30',
    glow: 'shadow-teal-500/10',
    color: 'emerald',
    label: 'Exploration',
    tips: [
      'Explore the environment thoroughly before making decisions',
      'Take note of small details - they often matter',
      'Interact with everything you can find',
    ],
  },
  trivia: {
    icon: Lightbulb,
    gradient: 'from-yellow-600/20 to-amber-600/20',
    border: 'border-yellow-500/30',
    glow: 'shadow-yellow-500/10',
    color: 'amber',
    label: 'Trivia',
    tips: [
      'Trust your first instinct on factual questions',
      'Eliminate obviously wrong answers to narrow choices',
      'Look for patterns in the questions',
    ],
  },
};

// ---------- Difficulty Indicator ----------

function DifficultyIndicator({ criteria }: { criteria: string }) {
  // Rough heuristic based on criteria length and certain keywords
  const words = criteria.toLowerCase();
  let level = 1;
  if (words.includes('must') || words.includes('all')) level = 2;
  if (words.includes('exactly') || words.includes('perfect') || words.length > 200) level = 3;

  const labels = ['Easy', 'Medium', 'Hard'];
  const colors = ['text-emerald-400', 'text-amber-400', 'text-rose-400'];
  const dotColors = ['bg-emerald-400', 'bg-amber-400', 'bg-rose-400'];

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i <= level ? dotColors[level - 1] : 'bg-white/10'
            }`}
          />
        ))}
      </div>
      <span className={`text-xs font-medium ${colors[level - 1]}`}>
        {labels[level - 1]}
      </span>
    </div>
  );
}

// ---------- Main Component ----------

const ChallengePreview: React.FC<ChallengePreviewProps> = ({
  challenge,
  previousAttempts = 0,
  hintsAvailable = 0,
  estimatedTime,
  className = '',
}) => {
  const [criteriaRevealed, setCriteriaRevealed] = useState(false);
  const config = challengeConfigs[challenge.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border ${config.border} bg-gradient-to-br ${config.gradient} backdrop-blur-xl overflow-hidden shadow-xl ${config.glow} ${className}`}
    >
      {/* Header with animated icon */}
      <div className="relative p-6 pb-4">
        <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <Icon size={128} />
          </motion.div>
        </div>

        <div className="relative flex items-start gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.gradient} border ${config.border} flex items-center justify-center flex-shrink-0`}
          >
            <Icon size={24} className="text-white" />
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge color={config.color} size="md">
                {config.label}
              </Badge>
              <DifficultyIndicator criteria={challenge.successCriteria} />
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {challenge.description}
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-6 pb-4 flex items-center gap-4 flex-wrap">
        {estimatedTime && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock size={12} />
            <span>~{estimatedTime}m estimated</span>
          </div>
        )}
        {previousAttempts > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <RotateCcw size={12} />
            <span>
              {previousAttempts} previous {previousAttempts === 1 ? 'attempt' : 'attempts'}
            </span>
          </div>
        )}
        {hintsAvailable > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-amber-400">
            <HelpCircle size={12} />
            <span>
              {hintsAvailable} {hintsAvailable === 1 ? 'hint' : 'hints'} available
            </span>
          </div>
        )}
        {challenge.maxAttempts && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Max: {challenge.maxAttempts} attempts</span>
          </div>
        )}
      </div>

      {/* Success criteria (hidden by default) */}
      <div className="px-6 pb-4">
        <button
          onClick={() => setCriteriaRevealed(!criteriaRevealed)}
          className="flex items-center gap-2 text-xs text-violet-300 hover:text-violet-200 transition-colors"
        >
          {criteriaRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
          {criteriaRevealed ? 'Hide success criteria' : 'Reveal success criteria'}
        </button>

        <AnimatePresence>
          {criteriaRevealed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="mt-2 text-xs text-slate-400 leading-relaxed p-3 rounded-xl bg-white/[0.03] border border-white/5">
                {challenge.successCriteria}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tips section */}
      <div className="px-6 pb-6">
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
          <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Sparkles size={12} className="text-amber-400" />
            Tips for {config.label} Challenges
          </h4>
          <ul className="space-y-1.5">
            {config.tips.map((tip, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="text-xs text-slate-500 flex items-start gap-2"
              >
                <span className="text-slate-600 mt-0.5">&#8226;</span>
                {tip}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default ChallengePreview;
