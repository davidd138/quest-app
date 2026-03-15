'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Star,
  Clock,
  Check,
  X,
  TrendingUp,
  Award,
  Share2,
  Download,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Users,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import type { Quest, Progress, Conversation, CompletedStage, ChallengeType } from '@/types';
import Badge from '@/components/ui/Badge';
import CharacterAvatar from './CharacterAvatar';

// ---------- Types ----------

interface QuestReportProps {
  quest: Quest;
  progress: Progress;
  conversations: Conversation[];
  percentile?: number;
  bestTime?: number;
  onShare?: () => void;
  onDownload?: () => void;
  className?: string;
}

interface SkillScore {
  skill: string;
  score: number;
  fullMark: number;
}

// ---------- Helpers ----------

function computeGrade(score: number, max: number): string {
  const pct = max > 0 ? (score / max) * 100 : 0;
  if (pct >= 97) return 'A+';
  if (pct >= 93) return 'A';
  if (pct >= 87) return 'B+';
  if (pct >= 80) return 'B';
  if (pct >= 70) return 'C';
  if (pct >= 60) return 'D';
  return 'F';
}

function gradeColor(grade: string): string {
  if (grade.startsWith('A')) return 'text-emerald-400';
  if (grade.startsWith('B')) return 'text-cyan-400';
  if (grade === 'C') return 'text-amber-400';
  return 'text-rose-400';
}

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

const challengeColors: Record<ChallengeType, 'violet' | 'emerald' | 'amber' | 'rose' | 'slate'> = {
  conversation: 'violet',
  riddle: 'amber',
  knowledge: 'emerald',
  negotiation: 'rose',
  persuasion: 'rose',
  exploration: 'emerald',
  trivia: 'amber',
};

// ---------- Sub-components ----------

function AnimatedScore({ value, max }: { value: number; max: number }) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
      className="relative"
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="font-heading text-7xl md:text-8xl font-bold text-white block text-center"
      >
        {value}
      </motion.span>
      <span className="text-slate-500 text-lg block text-center">/ {max}</span>
    </motion.div>
  );
}

function StageRow({
  stage,
  completed,
  conversation,
  index,
  isExpanded,
  onToggle,
}: {
  stage: Quest['stages'][number];
  completed?: CompletedStage;
  conversation?: Conversation;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const passed = conversation?.challengeResult?.passed ?? (completed ? true : false);
  const score = conversation?.challengeResult?.score ?? completed?.points ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8 + index * 0.1 }}
    >
      <div
        onClick={onToggle}
        className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] cursor-pointer transition-colors border border-white/5"
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-xs font-bold text-slate-400">
          {index + 1}
        </div>

        <CharacterAvatar character={stage.character} size="sm" />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{stage.title}</p>
          <Badge color={challengeColors[stage.challenge.type]} size="sm">
            {stage.challenge.type}
          </Badge>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <span className="text-xs text-slate-400">
            {completed ? formatDuration(completed.duration) : '--'}
          </span>
          <span className="text-sm font-semibold text-white">{score} pts</span>
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}
          >
            {passed ? <Check size={12} /> : <X size={12} />}
          </div>
          {isExpanded ? (
            <ChevronUp size={16} className="text-slate-500" />
          ) : (
            <ChevronDown size={16} className="text-slate-500" />
          )}
        </div>
      </div>

      {/* Expanded transcript */}
      {isExpanded && conversation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-1 ml-12 p-4 rounded-xl bg-white/[0.02] border border-white/5"
        >
          {conversation.transcript ? (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {conversation.transcript.split('\n').filter(Boolean).map((line, i) => {
                const isUser = line.toLowerCase().startsWith('user:');
                return (
                  <div
                    key={i}
                    className={`text-xs leading-relaxed ${
                      isUser ? 'text-violet-300' : 'text-slate-400'
                    }`}
                  >
                    {line}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-600">No transcript available.</p>
          )}

          {conversation.challengeResult && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <p className="text-xs text-slate-300">
                <span className="text-slate-500">Score:</span>{' '}
                {conversation.challengeResult.score}/100
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {conversation.challengeResult.feedback}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// ---------- Main Component ----------

const QuestReport: React.FC<QuestReportProps> = ({
  quest,
  progress,
  conversations,
  percentile = 78,
  bestTime,
  onShare,
  onDownload,
  className = '',
}) => {
  const [expandedStage, setExpandedStage] = React.useState<string | null>(null);

  const grade = computeGrade(progress.totalPoints, quest.totalPoints);
  const sortedStages = useMemo(
    () => [...quest.stages].sort((a, b) => a.order - b.order),
    [quest],
  );

  const completedMap = useMemo(() => {
    const m = new Map<string, CompletedStage>();
    progress.completedStages.forEach((cs) => m.set(cs.stageId, cs));
    return m;
  }, [progress]);

  const conversationMap = useMemo(() => {
    const m = new Map<string, Conversation>();
    conversations.forEach((c) => m.set(c.stageId, c));
    return m;
  }, [conversations]);

  // Compute skill scores from challenge types and results
  const skillData: SkillScore[] = useMemo(() => {
    const skills: Record<string, { total: number; count: number }> = {
      Communication: { total: 0, count: 0 },
      Knowledge: { total: 0, count: 0 },
      Persuasion: { total: 0, count: 0 },
      Creativity: { total: 0, count: 0 },
      'Problem Solving': { total: 0, count: 0 },
    };

    const typeToSkill: Record<ChallengeType, string[]> = {
      conversation: ['Communication', 'Creativity'],
      riddle: ['Problem Solving', 'Creativity'],
      knowledge: ['Knowledge'],
      negotiation: ['Persuasion', 'Communication'],
      persuasion: ['Persuasion', 'Communication'],
      exploration: ['Creativity', 'Problem Solving'],
      trivia: ['Knowledge', 'Problem Solving'],
    };

    sortedStages.forEach((stage) => {
      const conv = conversationMap.get(stage.id);
      const score = conv?.challengeResult?.score ?? 0;
      const mappedSkills = typeToSkill[stage.challenge.type] ?? ['Knowledge'];
      mappedSkills.forEach((skill) => {
        skills[skill].total += score;
        skills[skill].count += 1;
      });
    });

    return Object.entries(skills).map(([skill, { total, count }]) => ({
      skill,
      score: count > 0 ? Math.round(total / count) : 0,
      fullMark: 100,
    }));
  }, [sortedStages, conversationMap]);

  // Aggregate AI feedback
  const allStrengths = useMemo(
    () => conversations.flatMap((c) => c.challengeResult?.strengths ?? []).filter(Boolean),
    [conversations],
  );
  const allImprovements = useMemo(
    () => conversations.flatMap((c) => c.challengeResult?.improvements ?? []).filter(Boolean),
    [conversations],
  );

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.5, ease: 'easeOut' as const },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`space-y-8 ${className}`}
    >
      {/* Hero Section */}
      <motion.div
        custom={0}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-violet-900/40 via-navy-950 to-fuchsia-900/30 border border-white/10 p-8 md:p-12 text-center"
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(139,92,246,0.15),transparent_70%)] pointer-events-none" />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
          className="relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 flex items-center justify-center shadow-2xl shadow-amber-500/30 mb-6"
        >
          <Trophy className="w-10 h-10 text-navy-900" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-heading text-3xl md:text-4xl font-bold text-white mb-2"
        >
          Quest Completed!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-violet-300 font-medium mb-1"
        >
          {quest.title}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="text-sm text-slate-500"
        >
          Completed in {formatDuration(progress.totalDuration)}
          {bestTime && (
            <span className="ml-2 text-slate-600">
              (Best: {formatDuration(bestTime)})
            </span>
          )}
        </motion.p>
      </motion.div>

      {/* Score + Grade */}
      <motion.div
        custom={1}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Overall Score */}
        <div className="md:col-span-1 glass rounded-2xl border border-white/10 p-8 flex flex-col items-center justify-center">
          <AnimatedScore value={progress.totalPoints} max={quest.totalPoints} />
          <div className="mt-4 flex items-center gap-3">
            <span className={`font-heading text-4xl font-bold ${gradeColor(grade)}`}>
              {grade}
            </span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={16}
                  className={
                    s <= Math.ceil((progress.totalPoints / quest.totalPoints) * 5)
                      ? 'text-amber-400'
                      : 'text-slate-700'
                  }
                  fill={
                    s <= Math.ceil((progress.totalPoints / quest.totalPoints) * 5)
                      ? 'currentColor'
                      : 'none'
                  }
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="md:col-span-1 glass rounded-2xl border border-white/10 p-6 space-y-4">
          <h3 className="font-heading font-semibold text-white flex items-center gap-2">
            <TrendingUp size={16} className="text-violet-400" />
            Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Stages Completed</span>
              <span className="text-sm font-semibold text-white">
                {progress.completedStages.length}/{quest.stages.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Total Time</span>
              <span className="text-sm font-semibold text-white">
                {formatDuration(progress.totalDuration)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Average Score</span>
              <span className="text-sm font-semibold text-white">
                {progress.completedStages.length > 0
                  ? Math.round(
                      progress.totalPoints / progress.completedStages.length,
                    )
                  : 0}{' '}
                pts/stage
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Pass Rate</span>
              <span className="text-sm font-semibold text-emerald-400">
                {conversations.length > 0
                  ? Math.round(
                      (conversations.filter((c) => c.challengeResult?.passed).length /
                        conversations.length) *
                        100,
                    )
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>

        {/* Percentile */}
        <div className="md:col-span-1 glass rounded-2xl border border-white/10 p-6 flex flex-col items-center justify-center">
          <Users size={20} className="text-violet-400 mb-3" />
          <h3 className="text-sm text-slate-400 mb-2">Player Ranking</h3>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.8 }}
            className="font-heading text-5xl font-bold text-white"
          >
            {percentile}%
          </motion.span>
          <p className="text-xs text-slate-500 mt-1 text-center">
            You scored better than {percentile}% of players
          </p>
        </div>
      </motion.div>

      {/* Radar Chart - Skills */}
      <motion.div
        custom={2}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="glass rounded-2xl border border-white/10 p-6"
      >
        <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
          <Award size={16} className="text-amber-400" />
          Skills Breakdown
        </h3>
        <div className="h-72 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={skillData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis
                dataKey="skill"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: '#475569', fontSize: 10 }}
                axisLine={false}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.25}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* AI Feedback */}
      {(allStrengths.length > 0 || allImprovements.length > 0) && (
        <motion.div
          custom={3}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Strengths */}
          <div className="glass rounded-2xl border border-emerald-500/20 p-6">
            <h3 className="font-heading font-semibold text-emerald-400 mb-4 flex items-center gap-2">
              <TrendingUp size={16} />
              Strengths
            </h3>
            <ul className="space-y-2">
              {[...new Set(allStrengths)].slice(0, 6).map((s, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + i * 0.08 }}
                  className="flex items-start gap-2 text-sm text-slate-300"
                >
                  <Check size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  {s}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="glass rounded-2xl border border-amber-500/20 p-6">
            <h3 className="font-heading font-semibold text-amber-400 mb-4 flex items-center gap-2">
              <Star size={16} />
              Areas for Improvement
            </h3>
            <ul className="space-y-2">
              {[...new Set(allImprovements)].slice(0, 6).map((s, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + i * 0.08 }}
                  className="flex items-start gap-2 text-sm text-slate-300"
                >
                  <TrendingUp size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  {s}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {/* Stage-by-stage breakdown */}
      <motion.div
        custom={4}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="glass rounded-2xl border border-white/10 p-6"
      >
        <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
          <MessageSquare size={16} className="text-violet-400" />
          Stage-by-Stage Breakdown
        </h3>
        <div className="space-y-2">
          {sortedStages.map((stage, idx) => (
            <StageRow
              key={stage.id}
              stage={stage}
              completed={completedMap.get(stage.id)}
              conversation={conversationMap.get(stage.id)}
              index={idx}
              isExpanded={expandedStage === stage.id}
              onToggle={() =>
                setExpandedStage((prev) => (prev === stage.id ? null : stage.id))
              }
            />
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        custom={5}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap gap-3 justify-center"
      >
        <button
          onClick={onShare}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-300 text-sm font-medium hover:bg-violet-500/25 transition-colors"
        >
          <Share2 size={16} />
          Share Report
        </button>
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/10 transition-colors"
        >
          <Download size={16} />
          Download Report
        </button>
      </motion.div>
    </motion.div>
  );
};

export default QuestReport;
