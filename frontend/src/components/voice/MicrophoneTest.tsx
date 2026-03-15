'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Square,
  Check,
  AlertTriangle,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface MicrophoneTestProps {
  onTestComplete?: (success: boolean) => void;
  className?: string;
}

type TestState = 'idle' | 'requesting' | 'ready' | 'recording' | 'playback' | 'done';
type VolumeWarning = 'none' | 'too_low' | 'too_high';

const RECORD_DURATION = 5; // seconds
const BAR_COUNT = 24;

/* ─── Component ──────────────────────────────────────────────────────── */

const MicrophoneTest: React.FC<MicrophoneTestProps> = ({
  onTestComplete,
  className = '',
}) => {
  const [state, setState] = useState<TestState>('idle');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [showDeviceDropdown, setShowDeviceDropdown] = useState(false);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(BAR_COUNT).fill(0));
  const [volumeWarning, setVolumeWarning] = useState<VolumeWarning>('none');
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ─── Enumerate devices ──────────────────────────────────────────── */

  const enumerateDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = allDevices.filter((d) => d.kind === 'audioinput');
      setDevices(audioInputs);
      if (audioInputs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(audioInputs[0].deviceId);
      }
    } catch {
      // Silently fail
    }
  }, [selectedDeviceId]);

  /* ─── Request mic permission ─────────────────────────────────────── */

  const requestMicPermission = useCallback(async () => {
    setState('requesting');
    setPermissionDenied(false);

    try {
      const constraints: MediaStreamConstraints = {
        audio: selectedDeviceId
          ? { deviceId: { exact: selectedDeviceId } }
          : true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Set up audio analysis
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      await enumerateDevices();
      setState('ready');
    } catch {
      setPermissionDenied(true);
      setState('idle');
    }
  }, [selectedDeviceId, enumerateDevices]);

  /* ─── Audio level visualization ──────────────────────────────────── */

  useEffect(() => {
    if (state !== 'ready' && state !== 'recording') return;

    const analyser = analyserRef.current;
    if (!analyser) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateLevels = () => {
      analyser.getByteFrequencyData(dataArray);

      const newLevels: number[] = [];
      const step = Math.floor(dataArray.length / BAR_COUNT);
      let maxLevel = 0;

      for (let i = 0; i < BAR_COUNT; i++) {
        const value = dataArray[i * step] / 255;
        newLevels.push(value);
        if (value > maxLevel) maxLevel = value;
      }

      setAudioLevels(newLevels);

      // Volume warnings
      if (maxLevel < 0.05) {
        setVolumeWarning('too_low');
      } else if (maxLevel > 0.95) {
        setVolumeWarning('too_high');
      } else {
        setVolumeWarning('none');
      }

      animFrameRef.current = requestAnimationFrame(updateLevels);
    };

    animFrameRef.current = requestAnimationFrame(updateLevels);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [state]);

  /* ─── Start recording ────────────────────────────────────────────── */

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    setRecordingProgress(0);
    setRecordedUrl(null);

    try {
      const recorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        setState('done');
      };

      recorder.start();
      setState('recording');

      // Progress timer
      let elapsed = 0;
      timerRef.current = setInterval(() => {
        elapsed += 0.1;
        setRecordingProgress(Math.min(elapsed / RECORD_DURATION, 1));
        if (elapsed >= RECORD_DURATION) {
          recorder.stop();
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, 100);
    } catch {
      setState('ready');
    }
  }, []);

  /* ─── Playback ───────────────────────────────────────────────────── */

  const playRecording = useCallback(() => {
    if (!recordedUrl) return;

    if (audioElRef.current) {
      audioElRef.current.pause();
    }

    const audio = new Audio(recordedUrl);
    audioElRef.current = audio;
    setIsPlaying(true);

    audio.onended = () => setIsPlaying(false);
    audio.play();
  }, [recordedUrl]);

  const stopPlayback = useCallback(() => {
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  /* ─── Reset ──────────────────────────────────────────────────────── */

  const reset = useCallback(() => {
    // Clean up
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    stopPlayback();

    setState('idle');
    setAudioLevels(new Array(BAR_COUNT).fill(0));
    setVolumeWarning('none');
    setRecordingProgress(0);
    setRecordedUrl(null);
  }, [recordedUrl, stopPlayback]);

  /* ─── Cleanup on unmount ─────────────────────────────────────────── */

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      cancelAnimationFrame(animFrameRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  /* ─── Confirm mic working ────────────────────────────────────────── */

  const confirmMicWorking = useCallback(() => {
    onTestComplete?.(true);
  }, [onTestComplete]);

  /* ─── Render ─────────────────────────────────────────────────────── */

  return (
    <div
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
          <Mic size={18} className="text-violet-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Microphone Test</h3>
          <p className="text-[11px] text-slate-400">
            Check your mic before starting a voice quest
          </p>
        </div>
      </div>

      {/* Device selector */}
      {devices.length > 1 && state !== 'idle' && (
        <div className="relative mb-4">
          <button
            onClick={() => setShowDeviceDropdown(!showDeviceDropdown)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="truncate">
              {devices.find((d) => d.deviceId === selectedDeviceId)?.label ||
                'Select microphone'}
            </span>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform ${
                showDeviceDropdown ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {showDeviceDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute z-10 mt-1 w-full rounded-lg bg-navy-950/95 backdrop-blur-xl border border-white/10 overflow-hidden"
              >
                {devices.map((device) => (
                  <button
                    key={device.deviceId}
                    onClick={() => {
                      setSelectedDeviceId(device.deviceId);
                      setShowDeviceDropdown(false);
                      reset();
                    }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer ${
                      device.deviceId === selectedDeviceId
                        ? 'bg-violet-500/10 text-violet-300'
                        : 'text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Audio level bars */}
      <div className="flex items-end justify-center gap-[3px] h-16 mb-4">
        {audioLevels.map((level, i) => (
          <motion.div
            key={i}
            className="w-[6px] rounded-full"
            style={{
              backgroundColor:
                volumeWarning === 'too_high'
                  ? 'rgba(239, 68, 68, 0.7)'
                  : volumeWarning === 'too_low'
                    ? 'rgba(100, 116, 139, 0.4)'
                    : 'rgba(139, 92, 246, 0.7)',
            }}
            animate={{
              height: Math.max(4, level * 64),
            }}
            transition={{ duration: 0.05 }}
          />
        ))}
      </div>

      {/* Volume warnings */}
      <AnimatePresence mode="wait">
        {volumeWarning !== 'none' && (state === 'ready' || state === 'recording') && (
          <motion.div
            key={volumeWarning}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-4 text-xs ${
              volumeWarning === 'too_low'
                ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            {volumeWarning === 'too_low' ? (
              <>
                <VolumeX size={14} />
                <span>Volume too low. Try speaking louder or moving closer.</span>
              </>
            ) : (
              <>
                <AlertTriangle size={14} />
                <span>Volume too high. Try moving away from the mic.</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording progress */}
      {state === 'recording' && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-400">Recording...</span>
            <span className="text-[10px] text-slate-500">
              {Math.round(recordingProgress * RECORD_DURATION)}s / {RECORD_DURATION}s
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-red-500"
              animate={{ width: `${recordingProgress * 100}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>
      )}

      {/* Permission denied */}
      {permissionDenied && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4 bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          <MicOff size={14} />
          <span>Microphone access denied. Please allow mic access in your browser settings.</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {state === 'idle' && (
          <button
            onClick={requestMicPermission}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors cursor-pointer"
          >
            <Mic size={16} />
            Test Microphone
          </button>
        )}

        {state === 'requesting' && (
          <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 text-slate-400 text-sm">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-slate-500 border-t-violet-400 rounded-full"
            />
            Requesting permission...
          </div>
        )}

        {state === 'ready' && (
          <>
            <button
              onClick={startRecording}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors cursor-pointer"
            >
              <div className="w-3 h-3 rounded-full bg-white" />
              Record {RECORD_DURATION}s
            </button>
            <button
              onClick={() => {
                onTestComplete?.(true);
                setState('done');
              }}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition-colors cursor-pointer"
            >
              Skip
            </button>
          </>
        )}

        {state === 'done' && (
          <div className="flex-1 space-y-2">
            {/* Playback controls */}
            {recordedUrl && (
              <div className="flex items-center gap-2">
                <button
                  onClick={isPlaying ? stopPlayback : playRecording}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {isPlaying ? <Square size={14} /> : <Play size={14} />}
                  {isPlaying ? 'Stop' : 'Play'}
                </button>
                <button
                  onClick={reset}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <RefreshCw size={14} />
                  Retry
                </button>
              </div>
            )}

            {/* Confirm button */}
            <button
              onClick={confirmMicWorking}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors cursor-pointer"
            >
              <Check size={16} />
              Mic is working!
            </button>
          </div>
        )}
      </div>

      {/* Status indicator */}
      {(state === 'ready' || state === 'recording') && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <motion.div
            className={`w-2 h-2 rounded-full ${
              state === 'recording' ? 'bg-red-500' : 'bg-emerald-500'
            }`}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-[10px] text-slate-400">
            {state === 'recording' ? 'Recording in progress' : 'Microphone active'}
          </span>
        </div>
      )}

      {/* Success state */}
      {state === 'done' && !recordedUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-2 mt-3 text-emerald-400"
        >
          <Check size={16} />
          <span className="text-sm font-medium">Microphone is working correctly</span>
        </motion.div>
      )}
    </div>
  );
};

export default MicrophoneTest;
