'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Lightbulb, Lock, Eye, EyeOff, Compass, Zap } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface StageHint {
  stageTitle: string;
  stageOrder: number;
  hints: { text: string; cost: number }[];
  unlocked: boolean;
}

const mockHints: StageHint[] = [
  { stageTitle: 'The Entrance', stageOrder: 1, unlocked: true, hints: [
    { text: 'Look for the symbol carved above the doorway.', cost: 0 },
    { text: 'The guard responds well to flattery about his armor.', cost: 10 },
    { text: 'Mention the ancient order by name to gain trust.', cost: 25 },
  ]},
  { stageTitle: 'Inner Chamber', stageOrder: 2, unlocked: true, hints: [
    { text: 'The riddle references the four elements.', cost: 0 },
    { text: 'Start with water, end with fire.', cost: 15 },
    { text: 'The answer is "reflection" - look in the pool.', cost: 50 },
  ]},
  { stageTitle: 'Treasure Room', stageOrder: 3, unlocked: false, hints: [
    { text: 'Complete previous stages to unlock hints.', cost: 0 },
  ]},
];

export default function PageClient({ id }: { id: string }) {
  const questId = id;
  const [revealedHints, setRevealedHints] = useState<Set<string>>(new Set());

  const toggleHint = (key: string) => {
    setRevealedHints((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-3xl mx-auto space-y-6">
      <motion.div variants={itemVariants}>
        <Link href={`/quests/${questId}`} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Quest
        </Link>
      </motion.div>

      <motion.div variants={itemVariants}>
        <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
          <Lightbulb className="w-8 h-8 text-amber-400" />
          Quest Hints
        </h1>
        <p className="text-slate-400 mt-1">Stuck? Reveal hints to help you progress. Some hints cost points.</p>
      </motion.div>

      {mockHints.map((stage) => (
        <motion.div key={stage.stageOrder} variants={itemVariants} className="glass rounded-2xl overflow-hidden border border-slate-700/30">
          <div className="px-6 py-4 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stage.unlocked ? 'bg-amber-500/15' : 'bg-slate-800'}`}>
                {stage.unlocked ? <Compass className="w-4 h-4 text-amber-400" /> : <Lock className="w-4 h-4 text-slate-600" />}
              </div>
              <h3 className="font-heading font-semibold text-white">Stage {stage.stageOrder}: {stage.stageTitle}</h3>
            </div>
            <span className="text-xs text-slate-500">{stage.hints.length} hints</span>
          </div>

          <div className="p-6 space-y-3">
            {stage.hints.map((hint, hi) => {
              const key = `${stage.stageOrder}-${hi}`;
              const isRevealed = revealedHints.has(key) || hint.cost === 0;

              return (
                <div key={hi} className={`p-4 rounded-xl border transition-all ${
                  !stage.unlocked ? 'border-slate-700/20 opacity-40' :
                  isRevealed ? 'border-amber-500/20 bg-amber-500/5' : 'border-white/5 bg-white/[0.02]'
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-slate-500">Hint {hi + 1}</span>
                        {hint.cost > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {hint.cost} pts
                          </span>
                        )}
                      </div>
                      {isRevealed ? (
                        <p className="text-sm text-slate-300">{hint.text}</p>
                      ) : (
                        <p className="text-sm text-slate-600 italic">Hint hidden. Click to reveal.</p>
                      )}
                    </div>
                    {stage.unlocked && !isRevealed && hint.cost > 0 && (
                      <button
                        onClick={() => toggleHint(key)}
                        className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-amber-400 transition-colors"
                        title="Reveal hint"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
