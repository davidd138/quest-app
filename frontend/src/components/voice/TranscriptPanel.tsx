'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TranscriptMessage {
  id: string;
  speaker: 'user' | 'character';
  text: string;
  timestamp: Date;
}

interface TranscriptPanelProps {
  messages: TranscriptMessage[];
  characterName: string;
  className?: string;
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  messages,
  characterName,
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      className={`flex flex-col h-full rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-semibold text-white">Transcript</h3>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.length === 0 && (
          <p className="text-xs text-slate-500 text-center mt-8">
            Conversation will appear here...
          </p>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((msg) => {
            const isUser = msg.speaker === 'user';
            return (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                {/* Speaker label */}
                <span className="text-[10px] text-slate-500 mb-1 px-1">
                  {isUser ? 'You' : characterName} &middot;{' '}
                  {formatTimestamp(msg.timestamp)}
                </span>

                {/* Message bubble */}
                <div
                  className={[
                    'max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed',
                    isUser
                      ? 'bg-violet-500/20 text-violet-100 rounded-br-sm'
                      : 'bg-white/[0.07] backdrop-blur-sm text-slate-200 border border-white/10 rounded-bl-sm',
                  ].join(' ')}
                >
                  {msg.text}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TranscriptPanel;
