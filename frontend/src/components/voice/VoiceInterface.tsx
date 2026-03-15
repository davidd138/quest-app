'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Phone, PhoneOff, Lightbulb, Clock } from 'lucide-react';
import type { Character, Challenge } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import AudioVisualizer from './AudioVisualizer';
import TranscriptPanel from './TranscriptPanel';
import CharacterPanel from './CharacterPanel';

type ConnectionState = 'idle' | 'connecting' | 'listening' | 'speaking';

export interface TranscriptMessage {
  id: string;
  speaker: 'user' | 'character';
  text: string;
  timestamp: Date;
}

interface VoiceInterfaceProps {
  character: Character;
  challenge: Challenge;
  onConnect: () => void;
  onDisconnect: () => void;
  connectionState: ConnectionState;
  transcript: TranscriptMessage[];
  hintsRemaining: number;
  onRequestHint: () => void;
  analyserNode?: AnalyserNode | null;
  isSpeaking?: boolean;
  className?: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const stateLabels: Record<ConnectionState, { label: string; color: string }> = {
  idle: { label: 'Ready', color: 'text-slate-400' },
  connecting: { label: 'Connecting...', color: 'text-amber-400' },
  listening: { label: 'Listening', color: 'text-violet-400' },
  speaking: { label: 'Speaking', color: 'text-emerald-400' },
};

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  character,
  challenge,
  onConnect,
  onDisconnect,
  connectionState,
  transcript,
  hintsRemaining,
  onRequestHint,
  analyserNode,
  isSpeaking = false,
  className = '',
}) => {
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isConnected = connectionState !== 'idle';

  useEffect(() => {
    if (isConnected) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isConnected]);

  const handleToggleConnection = useCallback(() => {
    if (isConnected) {
      onDisconnect();
    } else {
      onConnect();
    }
  }, [isConnected, onConnect, onDisconnect]);

  const stateInfo = stateLabels[connectionState];

  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-4 h-full ${className}`}
    >
      {/* Left: Character panel */}
      <div className="hidden lg:block">
        <CharacterPanel
          character={character}
          emotion={connectionState === 'speaking' ? 'happy' : 'thinking'}
          challenge={challenge}
        />
      </div>

      {/* Center: Controls */}
      <div className="flex flex-col items-center justify-center gap-6">
        {/* State indicator */}
        <motion.div
          key={connectionState}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              connectionState === 'idle'
                ? 'bg-slate-400'
                : connectionState === 'connecting'
                  ? 'bg-amber-400 animate-pulse'
                  : connectionState === 'listening'
                    ? 'bg-violet-400 animate-pulse'
                    : 'bg-emerald-400 animate-pulse'
            }`}
          />
          <span className={`text-sm font-medium ${stateInfo.color}`}>
            {stateInfo.label}
          </span>
        </motion.div>

        {/* Visualizer */}
        <AudioVisualizer
          analyserNode={analyserNode ?? null}
          isSpeaking={isSpeaking}
          size={180}
        />

        {/* Timer */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1.5 text-sm text-slate-400"
          >
            <Clock size={14} />
            {formatTime(elapsed)}
          </motion.div>
        )}

        {/* Controls row */}
        <div className="flex items-center gap-3">
          {/* Hint button */}
          {isConnected && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={Lightbulb}
              onClick={onRequestHint}
              disabled={hintsRemaining <= 0}
            >
              Hint ({hintsRemaining})
            </Button>
          )}

          {/* Connect / Disconnect */}
          <Button
            variant={isConnected ? 'danger' : 'primary'}
            size="lg"
            leftIcon={isConnected ? PhoneOff : Phone}
            onClick={handleToggleConnection}
            loading={connectionState === 'connecting'}
          >
            {isConnected ? 'End' : 'Start'}
          </Button>

          {/* Mute placeholder */}
          {isConnected && (
            <Button variant="ghost" size="sm" leftIcon={Mic}>
              Mute
            </Button>
          )}
        </div>

        {/* Challenge info */}
        <Card variant="default" padding="sm" className="max-w-xs w-full">
          <div className="text-center">
            <Badge color="violet" size="sm">
              {challenge.type}
            </Badge>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {challenge.description}
            </p>
          </div>
        </Card>
      </div>

      {/* Right: Transcript */}
      <div className="hidden lg:block">
        <TranscriptPanel
          messages={transcript}
          characterName={character.name}
        />
      </div>
    </div>
  );
};

export default VoiceInterface;
