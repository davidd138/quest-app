'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipForward,
  Bookmark,
  Volume2,
  MapPin,
  MessageSquare,
  Gauge,
  ChevronRight,
} from 'lucide-react';

interface ReplayMessage {
  id: string;
  speaker: 'player' | 'character';
  characterName?: string;
  text: string;
  timestamp: number; // seconds from start
  emotion?: 'neutral' | 'happy' | 'curious' | 'surprised' | 'serious';
  isChallengeMoment?: boolean;
  stageId?: string;
}

interface ReplayStage {
  id: string;
  title: string;
  location: { name: string; latitude: number; longitude: number };
  characterName: string;
  completed: boolean;
}

interface QuestReplayProps {
  questTitle: string;
  stages: ReplayStage[];
  messages: ReplayMessage[];
  totalDuration: number; // seconds
  className?: string;
}

const emotionColors: Record<string, string> = {
  neutral: 'from-slate-500/30 to-slate-600/30',
  happy: 'from-amber-500/30 to-orange-500/30',
  curious: 'from-cyan-500/30 to-blue-500/30',
  surprised: 'from-rose-500/30 to-pink-500/30',
  serious: 'from-violet-500/30 to-indigo-500/30',
};

const emotionEmojis: Record<string, string> = {
  neutral: '',
  happy: '',
  curious: '',
  surprised: '',
  serious: '',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function CharacterPortrait({
  characterName,
  emotion,
}: {
  characterName: string;
  emotion: string;
}) {
  const initials = characterName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <motion.div
      key={emotion}
      initial={{ scale: 0.9, opacity: 0.5 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-2"
    >
      <div
        className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${emotionColors[emotion] || emotionColors.neutral} flex items-center justify-center border border-white/10 shadow-xl relative`}
      >
        <span className="text-2xl font-bold text-white">{initials}</span>
        <motion.div
          key={`${emotion}-emoji`}
          initial={{ scale: 0, y: -5 }}
          animate={{ scale: 1, y: 0 }}
          className="absolute -top-2 -right-2 text-lg"
        >
          {emotionEmojis[emotion] || ''}
        </motion.div>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-white">{characterName}</p>
        <p className="text-[10px] text-slate-500 capitalize">{emotion}</p>
      </div>
    </motion.div>
  );
}

const QuestReplay: React.FC<QuestReplayProps> = ({
  questTitle,
  stages,
  messages,
  totalDuration,
  className = '',
}) => {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const challengeMoments = messages.filter((m) => m.isChallengeMoment);

  // Find current messages (up to currentTime)
  const visibleMessages = messages.filter((m) => m.timestamp <= currentTime);
  const currentMessage = visibleMessages[visibleMessages.length - 1];
  const currentEmotion = currentMessage?.emotion || 'neutral';
  const currentCharacter =
    currentMessage?.characterName || stages[activeStageIdx]?.characterName || 'Unknown';

  // Update active stage based on current message
  useEffect(() => {
    if (currentMessage?.stageId) {
      const idx = stages.findIndex((s) => s.id === currentMessage.stageId);
      if (idx >= 0) setActiveStageIdx(idx);
    }
  }, [currentMessage, stages]);

  // Playback logic
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.1 * speed;
          if (next >= totalDuration) {
            setPlaying(false);
            return totalDuration;
          }
          return next;
        });
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, speed, totalDuration]);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [visibleMessages.length]);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setCurrentTime(ratio * totalDuration);
    },
    [totalDuration],
  );

  const jumpToChallenge = useCallback((timestamp: number) => {
    setCurrentTime(timestamp);
  }, []);

  const cycleSpeed = useCallback(() => {
    setSpeed((prev) => (prev === 0.5 ? 1 : prev === 1 ? 2 : 0.5));
  }, []);

  return (
    <div
      className={`rounded-2xl bg-white/[0.06] backdrop-blur-2xl border border-white/10 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h3 className="font-heading font-bold text-white text-lg">Quest Replay</h3>
          <p className="text-xs text-slate-400">{questTitle}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Volume2 className="w-3.5 h-3.5" />
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Left: Character + Stage progress */}
        <div className="p-5 border-b lg:border-b-0 lg:border-r border-white/10 space-y-5">
          {/* Character portrait */}
          <CharacterPortrait characterName={currentCharacter} emotion={currentEmotion} />

          {/* Stage progress */}
          <div className="space-y-2">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Stage Progress
            </p>
            {stages.map((stage, i) => (
              <div
                key={stage.id}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-all ${
                  i === activeStageIdx
                    ? 'bg-violet-500/15 border border-violet-500/30 text-violet-300'
                    : i < activeStageIdx
                    ? 'text-emerald-400 opacity-60'
                    : 'text-slate-600'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${
                    i === activeStageIdx
                      ? 'bg-violet-500 text-white'
                      : i < activeStageIdx
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-white/5 text-slate-600'
                  }`}
                >
                  {i + 1}
                </div>
                <span className="truncate font-medium">{stage.title}</span>
              </div>
            ))}
          </div>

          {/* Challenge bookmarks */}
          {challengeMoments.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-1">
                <Bookmark className="w-3 h-3" />
                Challenge Moments
              </p>
              {challengeMoments.map((m) => (
                <button
                  key={m.id}
                  onClick={() => jumpToChallenge(m.timestamp)}
                  className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                >
                  <Bookmark className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{m.text.slice(0, 40)}...</span>
                  <span className="ml-auto text-[10px] text-amber-500 flex-shrink-0">
                    {formatTime(m.timestamp)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Transcript */}
        <div className="lg:col-span-2 flex flex-col">
          <div
            ref={transcriptRef}
            className="flex-1 p-5 space-y-3 overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-white/10"
          >
            {visibleMessages.map((msg, i) => {
              const isPlayer = msg.speaker === 'player';
              const isActive = i === visibleMessages.length - 1;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: isActive ? 1 : 0.7, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-3 ${isPlayer ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 relative ${
                      isPlayer
                        ? 'bg-gradient-to-br from-violet-600 to-violet-500 text-white rounded-tr-md'
                        : 'bg-white/[0.07] border border-white/10 text-slate-200 rounded-tl-md'
                    } ${isActive ? 'ring-1 ring-violet-400/30' : ''} ${
                      msg.isChallengeMoment ? 'border-amber-500/30' : ''
                    }`}
                  >
                    {!isPlayer && (
                      <p className="text-[10px] text-violet-400 font-semibold mb-1">
                        {msg.characterName}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p
                      className={`text-[10px] mt-1 ${isPlayer ? 'text-violet-200' : 'text-slate-600'}`}
                    >
                      {formatTime(msg.timestamp)}
                    </p>
                    {msg.isChallengeMoment && (
                      <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                        <Bookmark className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {visibleMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 text-slate-600">
                <MessageSquare className="w-8 h-8 mb-2" />
                <p className="text-sm">Press play to start the replay</p>
              </div>
            )}
          </div>

          {/* Playback controls */}
          <div className="border-t border-white/10 px-5 py-4 space-y-3">
            {/* Seek bar */}
            <div
              className="relative h-2 rounded-full bg-navy-800 cursor-pointer group"
              onClick={handleSeek}
            >
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                style={{ width: `${(currentTime / totalDuration) * 100}%` }}
              />
              {/* Challenge markers */}
              {challengeMoments.map((m) => (
                <div
                  key={m.id}
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400 border border-navy-950 z-10"
                  style={{ left: `${(m.timestamp / totalDuration) * 100}%` }}
                />
              ))}
              {/* Thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `${(currentTime / totalDuration) * 100}%`, marginLeft: '-8px' }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setPlaying(!playing)}
                  className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-600/25"
                >
                  {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </motion.button>

                {challengeMoments.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const next = challengeMoments.find((m) => m.timestamp > currentTime);
                      if (next) jumpToChallenge(next.timestamp);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 hover:bg-white/10 transition-colors"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                    Next Challenge
                  </motion.button>
                )}
              </div>

              <button
                onClick={cycleSpeed}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors"
              >
                <Gauge className="w-3.5 h-3.5" />
                {speed}x
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestReplay;
