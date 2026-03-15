'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, MessageSquare, ChevronRight, ScrollText } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@/hooks/useGraphQL';
import { LIST_CONVERSATIONS } from '@/lib/graphql/queries';
import type { ConversationConnection, Conversation } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function ConversationCard({ conversation }: { conversation: Conversation }) {
  const statusColors: Record<string, string> = {
    completed: 'bg-emerald-500/15 text-emerald-400',
    analyzed: 'bg-violet-500/15 text-violet-400',
    in_progress: 'bg-amber-500/15 text-amber-400',
  };

  const score = conversation.challengeResult?.score;
  const passed = conversation.challengeResult?.passed;
  const duration = conversation.duration
    ? `${Math.round(conversation.duration / 60)}m ${conversation.duration % 60}s`
    : '--';

  return (
    <motion.div variants={itemVariants}>
      <div className="glass rounded-xl p-5 hover:bg-white/[0.02] transition-all duration-200 group border border-transparent hover:border-violet-500/15">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-violet-600/10 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-heading font-semibold text-white truncate">
                {conversation.characterName}
              </h4>
              <p className="text-sm text-slate-400 mt-0.5">
                Quest: {conversation.questId.slice(0, 8)}... / Stage: {conversation.stageId.slice(0, 8)}...
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {duration}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[conversation.status] || 'bg-slate-800 text-slate-400'}`}>
                  {conversation.status.replace(/_/g, ' ')}
                </span>
                {score !== undefined && (
                  <span className={`flex items-center gap-1 font-medium ${passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <Zap className="w-3 h-3" />
                    {score}%
                  </span>
                )}
              </div>
              {conversation.challengeResult?.feedback && (
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                  {conversation.challengeResult.feedback}
                </p>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-slate-500">
              {new Date(conversation.startedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            <ChevronRight className="w-4 h-4 text-slate-600 mt-2 ml-auto group-hover:text-violet-400 transition-colors" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function HistoryPage() {
  const { data, loading, execute } = useQuery<ConversationConnection>(LIST_CONVERSATIONS);

  useEffect(() => {
    execute({ limit: 50 });
  }, [execute]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl font-bold text-white">History</h1>
        <p className="text-slate-400 mt-1">Your past quest conversations and results</p>
      </motion.div>

      {/* Conversation List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass rounded-xl p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-navy-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-1/3 bg-navy-800 rounded" />
                  <div className="h-4 w-1/2 bg-navy-800 rounded" />
                  <div className="h-3 w-1/4 bg-navy-800 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : data?.items && data.items.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {data.items.map((conv) => (
            <ConversationCard key={conv.id} conversation={conv} />
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl p-16 text-center"
        >
          <ScrollText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="font-heading text-xl font-semibold text-white mb-2">No history yet</h3>
          <p className="text-slate-400 max-w-sm mx-auto">
            Start a quest to build your conversation history. Your interactions and results will appear here.
          </p>
          <Link
            href="/quests"
            className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            Browse Quests
            <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}
    </div>
  );
}
