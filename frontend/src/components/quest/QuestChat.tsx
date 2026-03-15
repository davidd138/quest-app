'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Lightbulb,
  Clock,
  Target,
  ChevronRight,
  Bot,
  User,
} from 'lucide-react';
import type { Character, Challenge } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface ChatMessage {
  id: string;
  role: 'user' | 'character';
  content: string;
  timestamp: Date;
}

interface QuestChatProps {
  character: Character;
  challenge: Challenge;
  questId: string;
  stageId: string;
  conversationId: string;
  /** External handler for sending messages (calls OpenAI text API). */
  onSendMessage: (message: string) => Promise<string>;
  /** Called when the user requests a hint. */
  onRequestHint: () => void;
  hintsRemaining: number;
  /** Current challenge progress percentage (0–100). */
  challengeProgress?: number;
  /** Time limit in seconds, if any. */
  timeLimit?: number;
  className?: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ─── Component ──────────────────────────────────────────────────────── */

const QuestChat: React.FC<QuestChatProps> = ({
  character,
  challenge,
  onSendMessage,
  onRequestHint,
  hintsRemaining,
  challengeProgress = 0,
  timeLimit,
  className = '',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: generateId(),
      role: 'character',
      content: character.greetingMessage,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await onSendMessage(text);
      const characterMessage: ChatMessage = {
        id: generateId(),
        role: 'character',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, characterMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'character',
        content: 'I seem to have lost my train of thought... Could you repeat that?',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  }, [input, isTyping, onSendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const isTimerWarning = timeLimit ? elapsed >= timeLimit * 0.8 : false;
  const isTimeUp = timeLimit ? elapsed >= timeLimit : false;

  return (
    <div
      className={[
        'grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 h-full',
        className,
      ].join(' ')}
    >
      {/* ── Main chat area ─────────────────────────────────────────── */}
      <div className="flex flex-col h-full rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center flex-shrink-0">
            {character.avatarUrl ? (
              <img
                src={character.avatarUrl}
                alt={character.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-xs font-bold text-white">
                {character.name.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{character.name}</p>
            <p className="text-[10px] text-slate-400">{character.role}</p>
          </div>
          {/* Timer */}
          <div
            className={`flex items-center gap-1.5 text-xs font-mono ${
              isTimeUp
                ? 'text-rose-400'
                : isTimerWarning
                  ? 'text-amber-400'
                  : 'text-slate-400'
            }`}
          >
            <Clock size={12} />
            {formatTime(elapsed)}
            {timeLimit && (
              <span className="text-slate-600">/ {formatTime(timeLimit)}</span>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex items-end gap-2 max-w-[80%] ${
                      isUser ? 'flex-row-reverse' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isUser
                          ? 'bg-violet-500/20'
                          : 'bg-white/10'
                      }`}
                    >
                      {isUser ? (
                        <User size={12} className="text-violet-400" />
                      ) : (
                        <Bot size={12} className="text-slate-400" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div
                      className={[
                        'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                        isUser
                          ? 'bg-violet-600/30 border border-violet-500/30 text-white rounded-br-md'
                          : 'bg-white/5 backdrop-blur-sm border border-white/10 text-slate-200 rounded-bl-md',
                      ].join(' ')}
                    >
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-end gap-2"
            >
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <Bot size={12} className="text-slate-400" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-slate-400"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                  />
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-slate-400"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0.15 }}
                  />
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-slate-400"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            {/* Hint button */}
            <Button
              variant="ghost"
              size="sm"
              leftIcon={Lightbulb}
              onClick={onRequestHint}
              disabled={hintsRemaining <= 0 || isTyping}
              className="flex-shrink-0"
            >
              {hintsRemaining}
            </Button>

            {/* Text input */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isTimeUp ? 'Time is up!' : 'Type your message...'}
                disabled={isTimeUp}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all disabled:opacity-50"
                aria-label="Chat message"
              />
            </div>

            {/* Send button */}
            <Button
              variant="primary"
              size="sm"
              leftIcon={Send}
              onClick={handleSend}
              disabled={!input.trim() || isTyping || isTimeUp}
              className="flex-shrink-0"
            >
              Send
            </Button>
          </div>
        </div>
      </div>

      {/* ── Sidebar ────────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col gap-4">
        {/* Challenge progress */}
        <Card variant="elevated" padding="md">
          <h4 className="font-heading font-semibold text-white text-sm mb-3 flex items-center gap-2">
            <Target size={14} className="text-violet-400" />
            Challenge Progress
          </h4>

          <Badge color="violet" size="sm">
            {challenge.type}
          </Badge>

          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {challenge.description}
          </p>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Progress</span>
              <span>{challengeProgress}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${challengeProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Success criteria */}
          <div className="mt-4 p-3 rounded-xl bg-white/5">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
              Success Criteria
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              {challenge.successCriteria}
            </p>
          </div>
        </Card>

        {/* Hints */}
        {challenge.failureHints.length > 0 && (
          <Card padding="md">
            <h4 className="font-heading font-semibold text-white text-sm mb-3 flex items-center gap-2">
              <Lightbulb size={14} className="text-amber-400" />
              Available Hints
            </h4>
            <div className="space-y-2">
              {challenge.failureHints.map((hint, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-2 rounded-lg bg-white/5"
                >
                  <ChevronRight size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-400">{hint}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Stats */}
        <Card padding="md">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 rounded-lg bg-white/5">
              <p className="text-violet-400 font-bold text-sm">
                {messages.filter((m) => m.role === 'user').length}
              </p>
              <p className="text-[10px] text-slate-500">Messages</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/5">
              <p className="text-amber-400 font-bold text-sm">{hintsRemaining}</p>
              <p className="text-[10px] text-slate-500">Hints Left</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default QuestChat;
