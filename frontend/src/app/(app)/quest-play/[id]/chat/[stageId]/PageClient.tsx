'use client';

import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { useQuery, useMutation } from '@/hooks/useGraphQL';
import { GET_QUEST, GET_PROGRESS } from '@/lib/graphql/queries';
import {
  CREATE_CONVERSATION,
  UPDATE_CONVERSATION,
} from '@/lib/graphql/mutations';
import QuestChat from '@/components/quest/QuestChat';
import Card from '@/components/ui/Card';
import ErrorState from '@/components/ui/ErrorState';
import type { Quest, Progress, Conversation } from '@/types';

const pageVariants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, x: -30 },
};

export default function QuestChatPage() {
  const params = useParams<{ id: string; stageId: string }>();
  const router = useRouter();
  const { id: questId, stageId } = params;

  const { data: quest, loading: questLoading, execute: fetchQuest } = useQuery<Quest>(GET_QUEST);
  const { data: progress, execute: fetchProgress } = useQuery<Progress>(GET_PROGRESS);
  const { execute: createConversation } = useMutation<Conversation>(CREATE_CONVERSATION);
  const { execute: updateConversation } = useMutation<Conversation>(UPDATE_CONVERSATION);

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuest({ id: questId });
    fetchProgress({ questId });
  }, [questId, fetchQuest, fetchProgress]);

  // Create conversation on mount
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const conv = await createConversation({ input: { questId, stageId } });
        if (!cancelled && conv?.id) {
          setConversationId(conv.id);
        }
      } catch {
        if (!cancelled) setError('Failed to start conversation.');
      }
    }
    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questId, stageId]);

  const stage = useMemo(
    () => quest?.stages?.find((s) => s.id === stageId) ?? null,
    [quest, stageId],
  );

  const handleSendMessage = useCallback(
    async (message: string): Promise<string> => {
      // Append to running transcript
      const updatedTranscript = `${transcript}\nUser: ${message}`;
      setTranscript(updatedTranscript);

      // In a real implementation this would call OpenAI's text API.
      // For now, update the conversation transcript and return a placeholder response.
      if (conversationId) {
        try {
          await updateConversation({
            input: { id: conversationId, transcript: updatedTranscript },
          });
        } catch {
          // Silently continue — transcript will be synced on next send
        }
      }

      // Simulate character response
      // In production, replace with an actual API call to generate the response
      const response = generatePlaceholderResponse(stage?.character.personality ?? '');
      const withResponse = `${updatedTranscript}\n${stage?.character.name ?? 'Character'}: ${response}`;
      setTranscript(withResponse);

      return response;
    },
    [conversationId, transcript, stage, updateConversation],
  );

  const handleRequestHint = useCallback(() => {
    // In production, this would decrement hints on the server and return a hint
  }, []);

  if (questLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorState
          message={error}
          onRetry={() => {
            setError(null);
            router.refresh();
          }}
        />
      </div>
    );
  }

  if (!quest || !stage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card padding="lg">
          <p className="text-slate-400">Stage not found.</p>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen flex flex-col p-4 md:p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => router.push(`/quest-play/${questId}/stage/${stageId}`)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-violet-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare size={10} />
            Text Chat
          </p>
          <h1 className="font-heading text-lg md:text-xl font-bold text-white truncate">
            {stage.title}
          </h1>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 min-h-0">
        <QuestChat
          character={stage.character}
          challenge={stage.challenge}
          questId={questId}
          stageId={stageId}
          conversationId={conversationId ?? ''}
          onSendMessage={handleSendMessage}
          onRequestHint={handleRequestHint}
          hintsRemaining={stage.hints.length}
          className="h-[calc(100vh-140px)]"
        />
      </div>
    </motion.div>
  );
}

/* ─── Placeholder response generator ─────────────────────────────────── */

function generatePlaceholderResponse(personality: string): string {
  const responses = [
    'Interesting approach! Tell me more about what you think.',
    'I see where you are going with this. What makes you believe that?',
    'Hmm, that is one way to look at it. Have you considered another angle?',
    'You are getting warmer! Keep following that line of thought.',
    'A bold statement! Can you back it up with reasoning?',
    'Not quite what I expected. Let me give you a moment to reconsider.',
  ];
  // Use personality length as a simple seed for variety
  const idx = (personality.length + Date.now()) % responses.length;
  return responses[idx];
}
