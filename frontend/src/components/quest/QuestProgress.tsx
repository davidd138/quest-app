'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { Stage, CompletedStage } from '@/types';

interface QuestProgressProps {
  stages: Stage[];
  completedStages: CompletedStage[];
  currentStageIndex: number;
  className?: string;
}

const QuestProgress: React.FC<QuestProgressProps> = ({
  stages,
  completedStages,
  currentStageIndex,
  className = '',
}) => {
  const completedIds = new Set(completedStages.map((s) => s.stageId));

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <div className="flex items-center min-w-max px-2">
        {stages.map((stage, idx) => {
          const isCompleted = completedIds.has(stage.id);
          const isCurrent = idx === currentStageIndex;
          const isLast = idx === stages.length - 1;

          return (
            <React.Fragment key={stage.id}>
              {/* Stage dot + label */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={
                    isCurrent
                      ? {
                          boxShadow: [
                            '0 0 0 0 rgba(139,92,246,0.4)',
                            '0 0 0 8px rgba(139,92,246,0)',
                          ],
                        }
                      : {}
                  }
                  transition={
                    isCurrent
                      ? { duration: 1.5, repeat: Infinity }
                      : {}
                  }
                  className={[
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-400 text-white'
                      : isCurrent
                        ? 'bg-violet-500 border-violet-400 text-white'
                        : 'bg-white/5 border-white/20 text-slate-500',
                  ].join(' ')}
                >
                  {isCompleted ? <Check size={14} /> : idx + 1}
                </motion.div>
                <span
                  className={[
                    'mt-2 text-[10px] max-w-[60px] text-center truncate',
                    isCompleted
                      ? 'text-emerald-400'
                      : isCurrent
                        ? 'text-violet-400'
                        : 'text-slate-600',
                  ].join(' ')}
                >
                  {stage.title}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-shrink-0 w-10 h-0.5 mx-1 mt-[-16px]">
                  <div
                    className={[
                      'h-full rounded-full transition-colors',
                      isCompleted && (idx + 1 <= currentStageIndex || completedIds.has(stages[idx + 1]?.id))
                        ? 'bg-emerald-500'
                        : 'bg-white/10',
                    ].join(' ')}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default QuestProgress;
