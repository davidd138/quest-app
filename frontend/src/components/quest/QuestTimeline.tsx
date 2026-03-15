'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Lock, Star, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import type { Stage, CompletedStage, Conversation, ChallengeType } from '@/types';
import CharacterAvatar from './CharacterAvatar';
import Badge from '@/components/ui/Badge';

// ---------- Types ----------

interface QuestTimelineProps {
  stages: Stage[];
  completedStages: CompletedStage[];
  currentStageIndex: number;
  conversations?: Conversation[];
  onStageClick?: (stage: Stage, index: number) => void;
  className?: string;
}

// ---------- Helpers ----------

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
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

// ---------- Timeline Node ----------

function TimelineNode({
  stage,
  index,
  state,
  completedData,
  conversation,
  isLast,
  isExpanded,
  onToggle,
  onStageClick,
}: {
  stage: Stage;
  index: number;
  state: 'completed' | 'current' | 'locked';
  completedData?: CompletedStage;
  conversation?: Conversation;
  isLast: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onStageClick?: (stage: Stage, index: number) => void;
}) {
  const isCompleted = state === 'completed';
  const isCurrent = state === 'current';
  const isLocked = state === 'locked';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="relative flex gap-4"
    >
      {/* Vertical line + node */}
      <div className="flex flex-col items-center flex-shrink-0">
        {/* Node */}
        <motion.div
          animate={
            isCurrent
              ? {
                  boxShadow: [
                    '0 0 0 0 rgba(139,92,246,0.4)',
                    '0 0 0 10px rgba(139,92,246,0)',
                  ],
                }
              : {}
          }
          transition={isCurrent ? { duration: 1.5, repeat: Infinity } : {}}
          onClick={() => {
            if (!isLocked && onStageClick) onStageClick(stage, index);
          }}
          className={[
            'relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all',
            isCompleted
              ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-400 cursor-pointer'
              : isCurrent
                ? 'bg-violet-500/20 border-violet-500/60 text-violet-400 cursor-pointer'
                : 'bg-white/5 border-white/10 text-slate-600 cursor-not-allowed',
          ].join(' ')}
        >
          {isCompleted ? (
            <Check size={20} strokeWidth={2.5} />
          ) : isLocked ? (
            <Lock size={16} />
          ) : (
            <span className="text-sm font-bold">{index + 1}</span>
          )}
        </motion.div>

        {/* Connection line */}
        {!isLast && (
          <div className="flex-1 w-px my-1">
            <div
              className={[
                'w-full h-full min-h-[40px]',
                isCompleted
                  ? 'bg-emerald-500/60'
                  : isCurrent
                    ? 'bg-violet-500/40 border-l border-dashed border-violet-500/40 bg-transparent'
                    : 'border-l border-dotted border-white/10 bg-transparent',
              ].join(' ')}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div
          onClick={() => {
            if (isCompleted) onToggle();
            else if (!isLocked && onStageClick) onStageClick(stage, index);
          }}
          className={[
            'rounded-xl p-4 transition-all border',
            isCompleted
              ? 'bg-emerald-500/[0.04] border-emerald-500/15 hover:bg-emerald-500/[0.08] cursor-pointer'
              : isCurrent
                ? 'bg-violet-500/[0.06] border-violet-500/20'
                : 'bg-white/[0.02] border-white/5 opacity-60',
          ].join(' ')}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-sm font-semibold text-white truncate">
                  {stage.title}
                </h4>
                {isCurrent && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    CURRENT
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mb-2">
                <CharacterAvatar character={stage.character} size="sm" />
                <span className="text-xs text-slate-400">{stage.character.name}</span>
                <Badge color={challengeColors[stage.challenge.type]} size="sm">
                  {stage.challenge.type}
                </Badge>
              </div>

              {/* Completed stats */}
              {isCompleted && completedData && (
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <Star size={12} />
                    {completedData.points} pts
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock size={12} />
                    {formatDuration(completedData.duration)}
                  </span>
                </div>
              )}
            </div>

            {isCompleted && (
              <button className="p-1 text-slate-500 hover:text-slate-300 transition-colors">
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            )}
          </div>

          {/* Expanded mini-transcript */}
          <AnimatePresence>
            {isExpanded && isCompleted && conversation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-white/5 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {conversation.transcript ? (
                    conversation.transcript
                      .split('\n')
                      .filter(Boolean)
                      .slice(0, 10)
                      .map((line, i) => {
                        const isUser = line.toLowerCase().startsWith('user:');
                        return (
                          <p
                            key={i}
                            className={`text-xs leading-relaxed mb-1 ${
                              isUser ? 'text-violet-300' : 'text-slate-500'
                            }`}
                          >
                            {line}
                          </p>
                        );
                      })
                  ) : (
                    <p className="text-xs text-slate-600">No transcript available.</p>
                  )}

                  {conversation.challengeResult && (
                    <p className="text-[10px] text-slate-600 mt-2 italic">
                      Score: {conversation.challengeResult.score}/100 &mdash;{' '}
                      {conversation.challengeResult.passed ? 'Passed' : 'Failed'}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ---------- Main Component ----------

const QuestTimeline: React.FC<QuestTimelineProps> = ({
  stages,
  completedStages,
  currentStageIndex,
  conversations = [],
  onStageClick,
  className = '',
}) => {
  const [expandedStageId, setExpandedStageId] = useState<string | null>(null);

  const completedIds = new Set(completedStages.map((s) => s.stageId));
  const completedMap = new Map(completedStages.map((s) => [s.stageId, s]));
  const conversationMap = new Map(conversations.map((c) => [c.stageId, c]));

  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  return (
    <div className={`${className}`}>
      {sortedStages.map((stage, idx) => {
        const isCompleted = completedIds.has(stage.id);
        const isCurrent = idx === currentStageIndex && !isCompleted;
        const state: 'completed' | 'current' | 'locked' = isCompleted
          ? 'completed'
          : isCurrent
            ? 'current'
            : 'locked';

        return (
          <TimelineNode
            key={stage.id}
            stage={stage}
            index={idx}
            state={state}
            completedData={completedMap.get(stage.id)}
            conversation={conversationMap.get(stage.id)}
            isLast={idx === sortedStages.length - 1}
            isExpanded={expandedStageId === stage.id}
            onToggle={() =>
              setExpandedStageId((prev) =>
                prev === stage.id ? null : stage.id,
              )
            }
            onStageClick={onStageClick}
          />
        );
      })}
    </div>
  );
};

export default QuestTimeline;
