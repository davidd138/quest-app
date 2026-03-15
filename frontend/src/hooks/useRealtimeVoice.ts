'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { GET_REALTIME_TOKEN } from '@/lib/graphql/queries';
import type { Character, Challenge, RealtimeToken } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: any = null;
function getClient() {
  if (!_client) _client = generateClient();
  return _client;
}

export type VoiceState = 'idle' | 'connecting' | 'connected' | 'listening' | 'speaking' | 'error';

export interface TranscriptEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface UseRealtimeVoiceParams {
  questId: string;
  stageId: string;
  character: Character;
  challenge: Challenge;
}

function buildSystemPrompt(character: Character, challenge: Challenge): string {
  return `You are ${character.name}, ${character.role}.
${character.backstory}

PERSONALITY: ${character.personality}
VOICE STYLE: Speak in a ${character.voiceStyle} manner.

CHALLENGE: ${challenge.description}
SUCCESS CRITERIA: ${challenge.successCriteria}

RULES:
- Stay in character at ALL times
- Guide the conversation naturally toward the challenge
- If the user struggles, provide hints subtly
- NEVER reveal you are an AI
- Keep responses under 3 sentences
- Greet the user with: "${character.greetingMessage}"`;
}

function floatTo16BitPCM(float32Array: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToFloat32Array(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16Array = new Int16Array(bytes.buffer);
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 0x8000;
  }
  return float32Array;
}

export function useRealtimeVoice({ questId, stageId, character, challenge }: UseRealtimeVoiceParams) {
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const currentAssistantTextRef = useRef<string>('');
  const playbackQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);

  const playAudioQueue = useCallback(() => {
    if (isPlayingRef.current || playbackQueueRef.current.length === 0) return;
    isPlayingRef.current = true;

    const ctx = playbackContextRef.current;
    if (!ctx) {
      isPlayingRef.current = false;
      return;
    }

    const chunk = playbackQueueRef.current.shift()!;
    const buffer = ctx.createBuffer(1, chunk.length, 24000);
    buffer.getChannelData(0).set(chunk);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => {
      isPlayingRef.current = false;
      playAudioQueue();
    };
    source.start();
  }, []);

  const connect = useCallback(async () => {
    setState('connecting');
    setError(null);
    setTranscript([]);
    currentAssistantTextRef.current = '';
    playbackQueueRef.current = [];

    try {
      // Fetch realtime token
      const result = await getClient().graphql({
        query: GET_REALTIME_TOKEN,
        variables: { questId, stageId },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tokenData = (result as any).data?.getRealtimeToken as RealtimeToken;
      if (!tokenData?.token) {
        throw new Error('Failed to obtain realtime token');
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      // Create audio contexts
      const audioCtx = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = audioCtx;

      const playbackCtx = new AudioContext({ sampleRate: 24000 });
      playbackContextRef.current = playbackCtx;

      // Connect to OpenAI Realtime API
      const ws = new WebSocket(
        'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17',
        ['realtime', `openai-insecure-api-key.${tokenData.token}`],
      );
      wsRef.current = ws;

      ws.onopen = () => {
        // Send session.update with system prompt
        const sessionUpdate = {
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: buildSystemPrompt(character, challenge),
            voice: 'alloy',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1',
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
            },
          },
        };
        ws.send(JSON.stringify(sessionUpdate));

        // Set up audio capture
        const source = audioCtx.createMediaStreamSource(stream);
        sourceRef.current = source;
        const processor = audioCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const inputData = e.inputBuffer.getChannelData(0);
          const pcm16 = floatTo16BitPCM(inputData);
          const base64Audio = arrayBufferToBase64(pcm16);
          ws.send(
            JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: base64Audio,
            }),
          );
        };

        source.connect(processor);
        processor.connect(audioCtx.destination);

        setState('connected');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'session.created':
          case 'session.updated':
            setState('listening');
            break;

          case 'input_audio_buffer.speech_started':
            setState('listening');
            break;

          case 'response.audio.delta': {
            setState('speaking');
            if (data.delta) {
              const audioData = base64ToFloat32Array(data.delta);
              playbackQueueRef.current.push(audioData);
              playAudioQueue();
            }
            break;
          }

          case 'response.audio.done':
            setState('listening');
            break;

          case 'response.text.delta': {
            if (data.delta) {
              currentAssistantTextRef.current += data.delta;
            }
            break;
          }

          case 'response.text.done': {
            const text = currentAssistantTextRef.current || data.text || '';
            if (text.trim()) {
              setTranscript((prev) => [
                ...prev,
                {
                  role: 'assistant',
                  content: text,
                  timestamp: Date.now(),
                },
              ]);
            }
            currentAssistantTextRef.current = '';
            break;
          }

          case 'response.audio_transcript.delta': {
            if (data.delta) {
              currentAssistantTextRef.current += data.delta;
            }
            break;
          }

          case 'response.audio_transcript.done': {
            const transcriptText = data.transcript || currentAssistantTextRef.current || '';
            if (transcriptText.trim()) {
              setTranscript((prev) => [
                ...prev,
                {
                  role: 'assistant',
                  content: transcriptText,
                  timestamp: Date.now(),
                },
              ]);
            }
            currentAssistantTextRef.current = '';
            break;
          }

          case 'conversation.item.input_audio_transcription.completed': {
            if (data.transcript?.trim()) {
              setTranscript((prev) => [
                ...prev,
                {
                  role: 'user',
                  content: data.transcript,
                  timestamp: Date.now(),
                },
              ]);
            }
            break;
          }

          case 'error': {
            console.error('Realtime API error:', data.error);
            setError(data.error?.message || 'An error occurred');
            setState('error');
            break;
          }
        }
      };

      ws.onerror = () => {
        setError('WebSocket connection error');
        setState('error');
      };

      ws.onclose = () => {
        if (state !== 'idle') {
          setState('idle');
        }
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to connect';
      setError(errMsg);
      setState('error');
    }
  }, [questId, stageId, character, challenge, playAudioQueue]);

  const disconnect = useCallback(() => {
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Stop audio processing
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    // Close audio contexts
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (playbackContextRef.current) {
      playbackContextRef.current.close();
      playbackContextRef.current = null;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    playbackQueueRef.current = [];
    isPlayingRef.current = false;
    currentAssistantTextRef.current = '';
    setState('idle');
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { state, transcript, connect, disconnect, error };
}
