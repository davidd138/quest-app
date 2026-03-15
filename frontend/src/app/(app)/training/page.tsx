'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Dumbbell,
  Shuffle,
  Clock,
  Target,
  TrendingUp,
  MessageSquare,
  HelpCircle,
  BookOpen,
  Handshake,
  Megaphone,
  Compass,
  Brain,
  Flame,
  CheckCircle,
} from 'lucide-react';
import type { ChallengeType } from '@/types';

// ---------- Types ----------

interface TrainingSession {
  id: string;
  type: ChallengeType;
  score: number;
  completedAt: string;
  duration: number;
}

interface DailyGoal {
  target: number;
  completed: number;
}

// ---------- Constants ----------

const CHALLENGE_TYPES: {
  type: ChallengeType;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  description: string;
}[] = [
  {
    type: 'conversation',
    label: 'Conversation',
    icon: MessageSquare,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/15',
    description: 'Practice conversational skills with AI characters',
  },
  {
    type: 'riddle',
    label: 'Riddle',
    icon: HelpCircle,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/15',
    description: 'Solve riddles and lateral thinking puzzles',
  },
  {
    type: 'knowledge',
    label: 'Knowledge',
    icon: BookOpen,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/15',
    description: 'Test and expand your knowledge base',
  },
  {
    type: 'negotiation',
    label: 'Negotiation',
    icon: Handshake,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/15',
    description: 'Master the art of negotiation and deal-making',
  },
  {
    type: 'persuasion',
    label: 'Persuasion',
    icon: Megaphone,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/15',
    description: 'Convince characters to see your point of view',
  },
  {
    type: 'exploration',
    label: 'Exploration',
    icon: Compass,
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/15',
    description: 'Discover hidden details and clues',
  },
  {
    type: 'trivia',
    label: 'Trivia',
    icon: Brain,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/15',
    description: 'Quick-fire trivia questions',
  },
];

const DIFFICULTY_LEVELS = [
  { value: 1, label: 'Easy', color: 'bg-emerald-500' },
  { value: 2, label: 'Medium', color: 'bg-amber-500' },
  { value: 3, label: 'Hard', color: 'bg-rose-500' },
];

// ---------- Skill Chart (mini bar chart) ----------

function SkillChart({ sessions }: { sessions: TrainingSession[] }) {
  const skillData = useMemo(() => {
    const byType: Record<string, { total: number; count: number }> = {};
    for (const s of sessions) {
      if (!byType[s.type]) byType[s.type] = { total: 0, count: 0 };
      byType[s.type].total += s.score;
      byType[s.type].count += 1;
    }
    return CHALLENGE_TYPES.map((ct) => {
      const data = byType[ct.type];
      return {
        ...ct,
        avgScore: data ? Math.round(data.total / data.count) : 0,
        sessions: data?.count ?? 0,
      };
    });
  }, [sessions]);

  return (
    <div className="space-y-2">
      {skillData
        .filter((s) => s.sessions > 0)
        .sort((a, b) => b.avgScore - a.avgScore)
        .map((skill) => {
          const Icon = skill.icon;
          return (
            <div key={skill.type} className="flex items-center gap-2">
              <Icon size={12} className={skill.color} />
              <span className="text-[10px] text-slate-400 w-20 truncate">
                {skill.label}
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${skill.bgColor.replace('/15', '')}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.avgScore}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <span className="text-[10px] text-slate-500 w-8 text-right">
                {skill.avgScore}%
              </span>
            </div>
          );
        })}
      {skillData.every((s) => s.sessions === 0) && (
        <p className="text-xs text-slate-500 text-center py-4">
          Complete training sessions to see your skills
        </p>
      )}
    </div>
  );
}

// ---------- Main Page ----------

export default function TrainingPage() {
  const [selectedType, setSelectedType] = useState<ChallengeType | null>(null);
  const [difficulty, setDifficulty] = useState(1);
  const [sessions] = useState<TrainingSession[]>([]);
  const [dailyGoal] = useState<DailyGoal>({ target: 3, completed: 0 });
  const [isStarting, setIsStarting] = useState(false);

  const handleRandomChallenge = useCallback(() => {
    const randomType =
      CHALLENGE_TYPES[Math.floor(Math.random() * CHALLENGE_TYPES.length)].type;
    setSelectedType(randomType);
    setDifficulty(Math.floor(Math.random() * 3) + 1);
  }, []);

  const handleStartSession = useCallback(() => {
    if (!selectedType) return;
    setIsStarting(true);
    // In a real app, this would navigate to the training session
    setTimeout(() => setIsStarting(false), 1500);
  }, [selectedType]);

  const todaysSessions = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return sessions.filter((s) => s.completedAt.startsWith(today));
  }, [sessions]);

  const streakDays = useMemo(() => {
    if (sessions.length === 0) return 0;
    // Simple streak calculation
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      if (sessions.some((s) => s.completedAt.startsWith(dateStr))) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [sessions]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl font-bold text-white">Training</h1>
        <p className="text-slate-400 mt-1">
          Practice specific skills in quick 5-minute sessions
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          {
            icon: Target,
            label: 'Sessions Today',
            value: todaysSessions.length,
            color: 'text-blue-400',
          },
          {
            icon: Flame,
            label: 'Day Streak',
            value: streakDays,
            color: 'text-amber-400',
          },
          {
            icon: TrendingUp,
            label: 'Total Sessions',
            value: sessions.length,
            color: 'text-emerald-400',
          },
          {
            icon: Clock,
            label: 'Time Trained',
            value: `${Math.round(sessions.reduce((s, ss) => s + ss.duration, 0) / 60)}m`,
            color: 'text-violet-400',
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="glass rounded-xl p-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <Icon size={18} className={stat.color} />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-[10px] text-slate-500">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Daily goal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Dumbbell size={16} className="text-violet-400" />
            <span className="text-sm font-medium text-white">Daily Training Goal</span>
          </div>
          <span className="text-sm text-violet-400 font-medium">
            {dailyGoal.completed}/{dailyGoal.target}
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${Math.min((dailyGoal.completed / dailyGoal.target) * 100, 100)}%`,
            }}
            transition={{ duration: 0.8 }}
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-amber-500"
          />
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          {Array.from({ length: dailyGoal.target }).map((_, i) => (
            <div
              key={i}
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                i < dailyGoal.completed
                  ? 'bg-violet-500/20'
                  : 'bg-white/5'
              }`}
            >
              {i < dailyGoal.completed ? (
                <CheckCircle size={12} className="text-violet-400" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Main content grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Challenge type selection */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Select Challenge Type</h2>
            <button
              onClick={handleRandomChallenge}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 transition-colors"
            >
              <Shuffle size={12} />
              Random Challenge
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CHALLENGE_TYPES.map((ct) => {
              const Icon = ct.icon;
              const isSelected = selectedType === ct.type;

              return (
                <motion.button
                  key={ct.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedType(ct.type)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? `${ct.bgColor} border-current ${ct.color}`
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${ct.bgColor} flex items-center justify-center mb-2`}
                  >
                    <Icon size={18} className={ct.color} />
                  </div>
                  <h3
                    className={`text-sm font-medium ${
                      isSelected ? ct.color : 'text-white'
                    }`}
                  >
                    {ct.label}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                    {ct.description}
                  </p>
                </motion.button>
              );
            })}
          </div>

          {/* Difficulty selector */}
          <div className="glass rounded-xl p-4">
            <h3 className="text-xs font-medium text-slate-300 mb-3">Difficulty</h3>
            <div className="flex gap-3">
              {DIFFICULTY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setDifficulty(level.value)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                    difficulty === level.value
                      ? `${level.color}/20 border-current text-white`
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Start button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleStartSession}
            disabled={!selectedType || isStarting}
            className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all ${
              selectedType && !isStarting
                ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:from-violet-500 hover:to-violet-400 shadow-lg shadow-violet-500/20'
                : 'bg-white/5 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isStarting ? (
              <span className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                Starting...
              </span>
            ) : selectedType ? (
              <span className="flex items-center justify-center gap-2">
                <Dumbbell size={16} />
                Start 5-Minute Session
              </span>
            ) : (
              'Select a challenge type to start'
            )}
          </motion.button>
        </div>

        {/* Sidebar: skill chart */}
        <div className="space-y-4">
          <div className="glass rounded-xl p-4">
            <h3 className="text-xs font-semibold text-white mb-3 flex items-center gap-1.5">
              <TrendingUp size={12} className="text-emerald-400" />
              Skill Improvement
            </h3>
            <SkillChart sessions={sessions} />
          </div>

          {/* Quick tip */}
          <div className="glass rounded-xl p-4">
            <h3 className="text-xs font-semibold text-white mb-2">Quick Tip</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Consistent daily practice is more effective than long occasional sessions.
              Try to complete at least {dailyGoal.target} sessions per day to build momentum.
            </p>
          </div>

          {/* Session duration info */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-slate-400" />
              <h3 className="text-xs font-semibold text-white">Session Info</h3>
            </div>
            <ul className="space-y-1.5">
              <li className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-violet-400" />
                5 minutes per session
              </li>
              <li className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-violet-400" />
                Score tracked per type
              </li>
              <li className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-violet-400" />
                No quest progress affected
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
