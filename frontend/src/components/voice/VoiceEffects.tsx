'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  Music,
  TreePine,
  Waves,
  Building2,
  Wine,
  BookOpen,
  Church,
  Sparkles,
  Lightbulb,
  Trophy,
  Activity,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* ─── Ambient sound definitions ──────────────────────────────────────── */

interface AmbientSound {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  /** Oscillator frequency hint — real implementation would use audio files. */
  frequencyHint: number;
}

const ambientSounds: AmbientSound[] = [
  { id: 'forest', name: 'Forest', icon: TreePine, description: 'Birds chirping among the trees', frequencyHint: 220 },
  { id: 'ocean', name: 'Ocean', icon: Waves, description: 'Gentle waves washing ashore', frequencyHint: 180 },
  { id: 'city', name: 'City', icon: Building2, description: 'Bustling urban atmosphere', frequencyHint: 300 },
  { id: 'tavern', name: 'Tavern', icon: Wine, description: 'Warm hearth and murmurs', frequencyHint: 260 },
  { id: 'library', name: 'Library', icon: BookOpen, description: 'Quiet pages turning softly', frequencyHint: 140 },
  { id: 'temple', name: 'Temple', icon: Church, description: 'Ethereal chants and echoes', frequencyHint: 200 },
];

/* ─── Sound effect definitions ───────────────────────────────────────── */

interface SoundEffect {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

const soundEffects: SoundEffect[] = [
  { id: 'success', label: 'Success', icon: Sparkles, color: 'text-emerald-400' },
  { id: 'hint', label: 'Hint', icon: Lightbulb, color: 'text-amber-400' },
  { id: 'fanfare', label: 'Fanfare', icon: Trophy, color: 'text-violet-400' },
];

/* ─── Component ──────────────────────────────────────────────────────── */

interface VoiceEffectsProps {
  className?: string;
}

const VoiceEffects: React.FC<VoiceEffectsProps> = ({ className = '' }) => {
  const [selectedAmbient, setSelectedAmbient] = useState<string | null>(null);
  const [ambientVolume, setAmbientVolume] = useState(0.4);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [triggeredEffect, setTriggeredEffect] = useState<string | null>(null);

  // Web Audio API refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);
  const ambientSourceRef = useRef<OscillatorNode | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);
  const musicSourceRef = useRef<OscillatorNode | null>(null);

  /** Lazily initialise AudioContext (must happen in a user gesture). */
  const getAudioContext = useCallback((): AudioContext => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  /* ── Ambient sound management ──────────────────────────────────────── */

  const stopAmbient = useCallback(() => {
    try {
      ambientSourceRef.current?.stop();
    } catch {
      /* already stopped */
    }
    ambientSourceRef.current = null;
  }, []);

  const startAmbient = useCallback(
    (ambient: AmbientSound) => {
      stopAmbient();
      const ctx = getAudioContext();
      const gain = ctx.createGain();
      gain.gain.value = ambientVolume;
      gain.connect(ctx.destination);
      ambientGainRef.current = gain;

      // Use a filtered noise-like oscillator as a placeholder for real ambient audio files
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = ambient.frequencyHint;

      // Add slight modulation for a more organic sound
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.3;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 5;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      osc.connect(gain);
      osc.start();
      ambientSourceRef.current = osc;
    },
    [ambientVolume, getAudioContext, stopAmbient],
  );

  const handleSelectAmbient = useCallback(
    (id: string) => {
      if (selectedAmbient === id) {
        stopAmbient();
        setSelectedAmbient(null);
        return;
      }
      const ambient = ambientSounds.find((a) => a.id === id);
      if (ambient) {
        startAmbient(ambient);
        setSelectedAmbient(id);
      }
    },
    [selectedAmbient, startAmbient, stopAmbient],
  );

  // Update gain when volume slider changes
  useEffect(() => {
    if (ambientGainRef.current) {
      ambientGainRef.current.gain.value = ambientVolume;
    }
  }, [ambientVolume]);

  /* ── Background music management ───────────────────────────────────── */

  const stopMusic = useCallback(() => {
    try {
      musicSourceRef.current?.stop();
    } catch {
      /* already stopped */
    }
    musicSourceRef.current = null;
  }, []);

  const startMusic = useCallback(() => {
    stopMusic();
    const ctx = getAudioContext();
    const gain = ctx.createGain();
    gain.gain.value = 0.15;
    gain.connect(ctx.destination);
    musicGainRef.current = gain;

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 330;
    osc.connect(gain);
    osc.start();
    musicSourceRef.current = osc;
  }, [getAudioContext, stopMusic]);

  useEffect(() => {
    if (musicEnabled) {
      startMusic();
    } else {
      stopMusic();
    }
  }, [musicEnabled, startMusic, stopMusic]);

  /* ── Sound effect triggers ─────────────────────────────────────────── */

  const triggerSoundEffect = useCallback(
    (id: string) => {
      const ctx = getAudioContext();
      const gain = ctx.createGain();
      gain.gain.value = 0.3;
      gain.connect(ctx.destination);

      const osc = ctx.createOscillator();
      osc.type = id === 'fanfare' ? 'sawtooth' : id === 'hint' ? 'triangle' : 'sine';
      osc.frequency.value = id === 'fanfare' ? 523.25 : id === 'hint' ? 440 : 659.25;
      osc.connect(gain);
      osc.start();

      // Envelope
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.stop(ctx.currentTime + 0.65);

      setTriggeredEffect(id);
      setTimeout(() => setTriggeredEffect(null), 500);
    },
    [getAudioContext],
  );

  /* ── Cleanup ───────────────────────────────────────────────────────── */

  useEffect(() => {
    return () => {
      stopAmbient();
      stopMusic();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, [stopAmbient, stopMusic]);

  /* ── Render ────────────────────────────────────────────────────────── */

  return (
    <div
      className={[
        'rounded-2xl p-5 space-y-5',
        'bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/20',
        className,
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Activity size={16} className="text-violet-400" />
        <h3 className="font-heading font-semibold text-white text-sm">Audio Effects</h3>
      </div>

      {/* ── Ambient sounds ─────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
          Ambient Sounds
        </p>
        <div className="grid grid-cols-3 gap-2">
          {ambientSounds.map((ambient) => {
            const isActive = selectedAmbient === ambient.id;
            const Icon = ambient.icon;
            return (
              <motion.button
                key={ambient.id}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSelectAmbient(ambient.id)}
                className={[
                  'flex flex-col items-center gap-1 p-3 rounded-xl text-center transition-colors cursor-pointer',
                  isActive
                    ? 'bg-violet-500/20 border border-violet-500/40 text-violet-300'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10',
                ].join(' ')}
                title={ambient.description}
              >
                <Icon size={18} />
                <span className="text-[10px] font-medium leading-tight">{ambient.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Volume slider ──────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
            Ambient Volume
          </p>
          <span className="text-xs text-slate-400 tabular-nums">
            {Math.round(ambientVolume * 100)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <VolumeX size={14} className="text-slate-500 flex-shrink-0" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={ambientVolume}
            onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-violet-500 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-400"
            aria-label="Ambient volume"
          />
          <Volume2 size={14} className="text-slate-500 flex-shrink-0" />
        </div>
      </div>

      {/* ── Background music toggle ────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music size={14} className="text-slate-400" />
          <span className="text-xs text-slate-300">Background Music</span>
        </div>
        <button
          onClick={() => setMusicEnabled((v) => !v)}
          className={[
            'relative w-10 h-5 rounded-full transition-colors cursor-pointer',
            musicEnabled ? 'bg-violet-500' : 'bg-white/10',
          ].join(' ')}
          role="switch"
          aria-checked={musicEnabled}
          aria-label="Toggle background music"
        >
          <motion.span
            className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow"
            animate={{ x: musicEnabled ? 20 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {/* ── Sound effect triggers ──────────────────────────────────── */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
          Sound Effects
        </p>
        <div className="flex gap-2">
          {soundEffects.map((sfx) => {
            const Icon = sfx.icon;
            const isTriggered = triggeredEffect === sfx.id;
            return (
              <motion.button
                key={sfx.id}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => triggerSoundEffect(sfx.id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <AnimatePresence mode="wait">
                  {isTriggered ? (
                    <motion.span
                      key="active"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1.3 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Icon size={14} className={sfx.color} />
                    </motion.span>
                  ) : (
                    <motion.span key="idle" initial={{ scale: 1 }} animate={{ scale: 1 }}>
                      <Icon size={14} className="text-slate-400" />
                    </motion.span>
                  )}
                </AnimatePresence>
                <span className={`text-[10px] font-medium ${isTriggered ? sfx.color : 'text-slate-400'}`}>
                  {sfx.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VoiceEffects;
