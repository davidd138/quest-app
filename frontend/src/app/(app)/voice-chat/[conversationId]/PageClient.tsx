'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  PhoneOff,
  Lightbulb,
  Clock,
  Target,
  Volume2,
  User,
  MessageSquare,
} from 'lucide-react';
import { useQuery } from '@/hooks/useGraphQL';
import { useMutation } from '@/hooks/useGraphQL';
import { GET_CONVERSATION, GET_QUEST } from '@/lib/graphql/queries';
import { UPDATE_CONVERSATION, ANALYZE_CONVERSATION } from '@/lib/graphql/mutations';
import { useRealtimeVoice, type TranscriptEntry } from '@/hooks/useRealtimeVoice';
import type { Conversation, Quest, Stage } from '@/types';

// Particle component for immersive background
function Particles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 8 + 4,
        delay: Math.random() * 4,
      })),
    [],
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-violet-500/20"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Audio visualizer
function AudioVisualizer({ state }: { state: string }) {
  const bars = 24;
  const isActive = state === 'speaking' || state === 'listening';

  return (
    <div className="flex items-center justify-center gap-1 h-32">
      {Array.from({ length: bars }, (_, i) => {
        const center = bars / 2;
        const distFromCenter = Math.abs(i - center) / center;
        const maxHeight = (1 - distFromCenter * 0.6) * 100;

        return (
          <motion.div
            key={i}
            className={`w-1.5 rounded-full ${
              state === 'speaking'
                ? 'bg-gradient-to-t from-violet-600 to-violet-400'
                : state === 'listening'
                  ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                  : 'bg-slate-700'
            }`}
            animate={
              isActive
                ? {
                    height: [
                      `${maxHeight * 0.2}%`,
                      `${maxHeight * (0.3 + Math.random() * 0.7)}%`,
                      `${maxHeight * 0.2}%`,
                    ],
                  }
                : { height: '8px' }
            }
            transition={
              isActive
                ? {
                    duration: 0.4 + Math.random() * 0.3,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    delay: i * 0.03,
                  }
                : { duration: 0.5 }
            }
          />
        );
      })}
    </div>
  );
}

// Transcript panel
function TranscriptPanel({ transcript }: { transcript: TranscriptEntry[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin"
    >
      <AnimatePresence initial={false}>
        {transcript.map((entry, i) => (
          <motion.div
            key={`${entry.timestamp}-${i}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                entry.role === 'user'
                  ? 'bg-violet-500/20 border border-violet-500/20 text-white'
                  : 'bg-white/5 border border-white/10 text-slate-200'
              }`}
            >
              <p className="leading-relaxed">{entry.content}</p>
              <p className="text-[10px] text-slate-500 mt-1">
                {new Date(entry.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {transcript.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-500 text-sm text-center">
            Conversation transcript will appear here...
          </p>
        </div>
      )}
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function VoiceChatPage() {
  const params = useParams<{ conversationId: string }>();
  const router = useRouter();
  const conversationId = params.conversationId;

  const { data: conversation, execute: fetchConversation } = useQuery<Conversation>(GET_CONVERSATION);
  const { data: quest, execute: fetchQuest } = useQuery<Quest>(GET_QUEST);
  const { execute: updateConversation } = useMutation(UPDATE_CONVERSATION);
  const { execute: analyzeConversation } = useMutation(ANALYZE_CONVERSATION);

  const [isMuted, setIsMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [isEnding, setIsEnding] = useState(false);
  const startTimeRef = useRef(Date.now());

  // Find stage from conversation
  const stage: Stage | null = useMemo(() => {
    if (!quest || !conversation) return null;
    return quest.stages.find((s) => s.id === conversation.stageId) ?? null;
  }, [quest, conversation]);

  const voiceChat = useRealtimeVoice({
    questId: conversation?.questId ?? '',
    stageId: conversation?.stageId ?? '',
    character: stage?.character ?? {
      name: '',
      role: '',
      personality: '',
      backstory: '',
      voiceStyle: '',
      greetingMessage: '',
    },
    challenge: stage?.challenge ?? {
      type: 'conversation',
      description: '',
      successCriteria: '',
      failureHints: [],
    },
  });

  // Fetch conversation and quest data
  useEffect(() => {
    fetchConversation({ id: conversationId });
  }, [conversationId, fetchConversation]);

  useEffect(() => {
    if (conversation?.questId) {
      fetchQuest({ id: conversation.questId });
    }
  }, [conversation?.questId, fetchQuest]);

  // Auto-connect when stage is ready
  useEffect(() => {
    if (stage && voiceChat.state === 'idle' && !isEnding) {
      voiceChat.connect();
      startTimeRef.current = Date.now();
    }
  }, [stage, voiceChat, isEnding]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleEndCall = useCallback(async () => {
    setIsEnding(true);
    voiceChat.disconnect();

    try {
      // Save transcript
      const transcriptText = voiceChat.transcript
        .map((t) => `${t.role === 'user' ? 'User' : stage?.character.name ?? 'Character'}: ${t.content}`)
        .join('\n');

      await updateConversation({
        input: {
          id: conversationId,
          transcript: transcriptText,
          status: 'completed',
          duration: elapsed,
        },
      });

      // Trigger analysis
      await analyzeConversation({ conversationId });

      // Navigate back to stage page
      if (conversation) {
        router.push(`/quest-play/${conversation.questId}/stage/${conversation.stageId}`);
      }
    } catch {
      router.back();
    }
  }, [voiceChat, conversationId, elapsed, conversation, stage, updateConversation, analyzeConversation, router]);

  const handleNextHint = () => {
    if (!stage) return;
    if (currentHintIndex < stage.hints.length - 1) {
      setCurrentHintIndex((prev) => prev + 1);
    }
    setShowHint(true);
  };

  const stateLabel = {
    idle: 'Initializing...',
    connecting: 'Connecting...',
    connected: 'Connected',
    listening: 'Listening...',
    speaking: 'Speaking...',
    error: 'Error',
  }[voiceChat.state];

  const stateColor = {
    idle: 'text-slate-400',
    connecting: 'text-amber-400',
    connected: 'text-emerald-400',
    listening: 'text-emerald-400',
    speaking: 'text-violet-400',
    error: 'text-rose-400',
  }[voiceChat.state];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-navy-950 flex flex-col overflow-hidden"
    >
      <Particles />

      {/* Top bar */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-slate-400" />
            <span className="font-mono text-sm text-white">{formatTime(elapsed)}</span>
          </div>
          <div className={`flex items-center gap-2 ${stateColor}`}>
            <div
              className={`w-2 h-2 rounded-full ${
                voiceChat.state === 'speaking'
                  ? 'bg-violet-400 animate-pulse'
                  : voiceChat.state === 'listening'
                    ? 'bg-emerald-400 animate-pulse'
                    : voiceChat.state === 'error'
                      ? 'bg-rose-400'
                      : 'bg-slate-500'
              }`}
            />
            <span className="text-xs font-medium">{stateLabel}</span>
          </div>
        </div>

        {stage && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <Target size={12} className="text-amber-400" />
            <span className="text-xs text-slate-300 max-w-[200px] truncate">
              {stage.challenge.type}
            </span>
          </div>
        )}
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row relative z-10 overflow-hidden">
        {/* Character panel (left) */}
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:w-72 p-6 flex flex-col items-center justify-center border-r border-white/5 flex-shrink-0"
        >
          {/* Character avatar */}
          <motion.div
            animate={
              voiceChat.state === 'speaking'
                ? { boxShadow: ['0 0 20px rgba(139,92,246,0.3)', '0 0 40px rgba(139,92,246,0.6)', '0 0 20px rgba(139,92,246,0.3)'] }
                : { boxShadow: '0 0 20px rgba(139,92,246,0.1)' }
            }
            transition={
              voiceChat.state === 'speaking'
                ? { duration: 1.5, repeat: Infinity }
                : { duration: 0.5 }
            }
            className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center mb-4"
          >
            {stage?.character.avatarUrl ? (
              <img
                src={stage.character.avatarUrl}
                alt={stage.character.name}
                className="w-full h-full rounded-3xl object-cover"
              />
            ) : (
              <User size={40} className="text-white/80" />
            )}
          </motion.div>

          <h3 className="font-heading font-bold text-white text-lg text-center">
            {stage?.character.name ?? 'Character'}
          </h3>
          <p className="text-violet-400 text-sm text-center">{stage?.character.role ?? ''}</p>

          {/* Current emotion/state */}
          <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <Volume2
              size={12}
              className={voiceChat.state === 'speaking' ? 'text-violet-400' : 'text-slate-500'}
            />
            <span className="text-xs text-slate-400 capitalize">
              {voiceChat.state === 'speaking' ? 'Speaking' : 'Listening'}
            </span>
          </div>
        </motion.div>

        {/* Center - Visualizer */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-lg"
          >
            <AudioVisualizer state={voiceChat.state} />
          </motion.div>

          {/* Hint display */}
          <AnimatePresence>
            {showHint && stage && stage.hints[currentHintIndex] && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-8 max-w-md p-4 rounded-xl bg-amber-500/5 border border-amber-500/20"
              >
                <div className="flex items-start gap-3">
                  <Lightbulb size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-amber-400 font-medium mb-1">
                      Hint {currentHintIndex + 1} of {stage.hints.length}
                    </p>
                    <p className="text-sm text-slate-300">{stage.hints[currentHintIndex]}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error display */}
          {voiceChat.error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 px-4 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20"
            >
              <p className="text-rose-400 text-sm">{voiceChat.error}</p>
            </motion.div>
          )}
        </div>

        {/* Right - Transcript */}
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:w-80 p-4 flex flex-col border-l border-white/5 flex-shrink-0"
        >
          <h4 className="font-heading font-semibold text-white text-sm mb-3 flex items-center gap-2">
            <MessageSquare size={14} className="text-violet-400" />
            Transcript
          </h4>
          <TranscriptPanel transcript={voiceChat.transcript} />
        </motion.div>
      </div>

      {/* Bottom controls */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 flex items-center justify-center gap-4 px-6 py-5 border-t border-white/5"
      >
        {/* Hint button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNextHint}
          className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-amber-500/10 hover:border-amber-500/20 transition-colors"
          title="Get a hint"
        >
          <Lightbulb size={20} className="text-amber-400" />
        </motion.button>

        {/* Mic toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMuted(!isMuted)}
          className={`p-4 rounded-full border transition-colors ${
            isMuted
              ? 'bg-rose-500/20 border-rose-500/30 hover:bg-rose-500/30'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          {isMuted ? (
            <MicOff size={24} className="text-rose-400" />
          ) : (
            <Mic size={24} className="text-white" />
          )}
        </motion.button>

        {/* End call */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleEndCall}
          disabled={isEnding}
          className="p-4 rounded-full bg-rose-500 hover:bg-rose-600 transition-colors disabled:opacity-50 shadow-lg shadow-rose-500/25"
        >
          <PhoneOff size={24} className="text-white" />
        </motion.button>

        {/* Hint button (duplicate for symmetry placeholder - could be another control) */}
        <div className="w-12" />
      </motion.div>
    </motion.div>
  );
}
