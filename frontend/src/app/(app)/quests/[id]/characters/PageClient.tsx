'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Mic,
  ChevronDown,
  ChevronUp,
  Shield,
  Sword,
  Sparkles,
  Volume2,
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@/hooks/useGraphQL';
import { GET_QUEST } from '@/lib/graphql/queries';
import type { Quest } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45 } },
};

const roleIcons: Record<string, React.ReactNode> = {
  NPC: <Shield className="w-4 h-4" />,
  Guide: <Sparkles className="w-4 h-4" />,
  Guardian: <Sword className="w-4 h-4" />,
  Merchant: <Sparkles className="w-4 h-4" />,
};

const roleGradients: Record<string, string> = {
  NPC: 'from-blue-500/30 to-cyan-500/10 border-blue-500/20',
  Guide: 'from-emerald-500/30 to-teal-500/10 border-emerald-500/20',
  Guardian: 'from-rose-500/30 to-orange-500/10 border-rose-500/20',
  Merchant: 'from-amber-500/30 to-yellow-500/10 border-amber-500/20',
};

interface CharacterDisplay {
  id: string;
  name: string;
  role: string;
  personality: string;
  backstory: string;
  voiceStyle: string;
  greetingMessage: string;
  stageTitle: string;
  challengeDescription: string;
}

function CharacterCard({ character }: { character: CharacterDisplay }) {
  const [expanded, setExpanded] = useState(false);
  const gradient = roleGradients[character.role] || roleGradients.NPC;
  const icon = roleIcons[character.role] || roleIcons.NPC;

  const initials = character.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div variants={cardVariants} layout>
      <div
        className={`rounded-2xl overflow-hidden border bg-gradient-to-br ${gradient} backdrop-blur-xl bg-white/[0.03] transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/5`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-violet-500/20 shrink-0">
              <span className="text-xl font-bold text-white">{initials}</span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-heading text-xl font-bold text-white">{character.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-navy-800/60 text-slate-300 font-medium">
                  {icon}
                  {character.role}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-navy-800/60 text-slate-300">
                  <Volume2 className="w-3 h-3 text-violet-400" />
                  {character.voiceStyle}
                </span>
              </div>
            </div>
          </div>

          {/* Personality */}
          <p className="text-sm text-slate-400 mt-4 leading-relaxed">
            <span className="text-slate-300 font-medium">Personality:</span> {character.personality}
          </p>

          {/* Challenge they guard */}
          <div className="mt-3 p-3 rounded-xl bg-navy-900/40">
            <p className="text-xs text-slate-500 mb-1">Guards this challenge:</p>
            <p className="text-sm text-slate-300">{character.challengeDescription}</p>
            <p className="text-xs text-slate-500 mt-1">Stage: {character.stageTitle}</p>
          </div>

          {/* Backstory Toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 mt-4 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {expanded ? 'Hide Backstory' : 'Show Backstory'}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="text-sm text-slate-400 mt-3 leading-relaxed border-t border-slate-700/30 pt-3">
                  {character.backstory}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Talk Button */}
          <Link
            href={`/quest-play/${character.id}/chat/${character.id}`}
            className="mt-5 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all shadow-lg shadow-violet-600/20 hover:shadow-violet-500/30"
          >
            <Mic className="w-4 h-4" />
            Talk to {character.name}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function QuestCharactersPage() {
  const params = useParams();
  const questId = params.id as string;

  const { data: quest, loading, execute: fetchQuest } = useQuery<Quest>(GET_QUEST);

  useEffect(() => {
    if (questId) {
      fetchQuest({ id: questId });
    }
  }, [questId, fetchQuest]);

  const characters: CharacterDisplay[] =
    quest?.stages?.map((stage) => ({
      id: stage.id,
      name: stage.character.name,
      role: stage.character.role,
      personality: stage.character.personality,
      backstory: stage.character.backstory,
      voiceStyle: stage.character.voiceStyle,
      greetingMessage: stage.character.greetingMessage,
      stageTitle: stage.title,
      challengeDescription: stage.challenge.description,
    })) || [];

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-6 w-32 rounded bg-navy-800 animate-pulse" />
        <div className="h-10 w-64 rounded-lg bg-navy-800 animate-pulse" />
        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 rounded-2xl bg-navy-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* Back Link */}
      <motion.div variants={cardVariants}>
        <Link
          href={`/quests/${questId}`}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-violet-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quest
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={cardVariants}>
        <h1 className="font-heading text-3xl font-bold text-white">
          {quest?.title ? `${quest.title} — Characters` : 'Quest Characters'}
        </h1>
        <p className="text-slate-400 mt-1">
          Meet the characters you will encounter on this quest
        </p>
      </motion.div>

      {/* Characters Grid */}
      {characters.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 gap-6"
        >
          {characters.map((character) => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </motion.div>
      ) : (
        <div className="glass rounded-2xl p-16 text-center">
          <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="font-heading text-xl font-semibold text-white mb-2">
            No characters found
          </h3>
          <p className="text-slate-400">
            This quest does not have any characters yet.
          </p>
        </div>
      )}
    </motion.div>
  );
}
