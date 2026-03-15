import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRealtimeVoice } from '@/hooks/useRealtimeVoice';
import { generateClient } from 'aws-amplify/api';
import type { Character, Challenge } from '@/types';

// Mock generateClient
const mockGraphql = vi.fn();
vi.mocked(generateClient).mockReturnValue({ graphql: mockGraphql } as ReturnType<typeof generateClient>);

// Mock WebSocket
class MockWebSocket {
  static OPEN = 1;
  readyState = MockWebSocket.OPEN;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;
  send = vi.fn();
  close = vi.fn();

  constructor() {
    // Simulate async open
    setTimeout(() => this.onopen?.(), 0);
  }
}

// Mock AudioContext
class MockAudioContext {
  sampleRate = 24000;
  destination = {};
  createMediaStreamSource = vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));
  createScriptProcessor = vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    onaudioprocess: null,
  }));
  createBuffer = vi.fn(() => ({
    getChannelData: vi.fn(() => ({ set: vi.fn() })),
  }));
  createBufferSource = vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    buffer: null,
    onended: null,
  }));
  close = vi.fn();
}

const mockCharacter: Character = {
  name: 'Captain Blackbeard',
  role: 'Pirate Captain',
  personality: 'Gruff but fair',
  backstory: 'A legendary pirate who sailed the seven seas.',
  voiceStyle: 'deep and commanding',
  greetingMessage: 'Ahoy, landlubber!',
};

const mockChallenge: Challenge = {
  type: 'conversation',
  description: 'Convince the captain to share his treasure map',
  successCriteria: 'The user must persuade the captain through dialogue',
  failureHints: ['Try being more diplomatic', 'Appeal to his sense of adventure'],
};

const hookParams = {
  questId: 'quest-1',
  stageId: 'stage-1',
  character: mockCharacter,
  challenge: mockChallenge,
};

describe('useRealtimeVoice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(generateClient).mockReturnValue({ graphql: mockGraphql } as ReturnType<typeof generateClient>);

    // Set up global mocks
    vi.stubGlobal('WebSocket', MockWebSocket);
    vi.stubGlobal('AudioContext', MockAudioContext);

    // Mock getUserMedia
    vi.mocked(navigator.mediaDevices.getUserMedia).mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    } as unknown as MediaStream);
  });

  it('initial state is idle', () => {
    const { result } = renderHook(() => useRealtimeVoice(hookParams));
    expect(result.current.state).toBe('idle');
    expect(result.current.transcript).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('connect changes state to connecting', async () => {
    mockGraphql.mockResolvedValue({
      data: { getRealtimeToken: { token: 'test-token', expiresAt: '2026-01-01T00:00:00Z' } },
    });

    const { result } = renderHook(() => useRealtimeVoice(hookParams));

    await act(async () => {
      result.current.connect();
      // Allow the promise to start but not fully resolve
    });

    // After connect is called, state should transition from idle
    // It goes to 'connecting' first, then 'connected' after WebSocket opens
    expect(['connecting', 'connected', 'listening']).toContain(result.current.state);
  });

  it('disconnect resets state to idle', async () => {
    mockGraphql.mockResolvedValue({
      data: { getRealtimeToken: { token: 'test-token', expiresAt: '2026-01-01T00:00:00Z' } },
    });

    const { result } = renderHook(() => useRealtimeVoice(hookParams));

    await act(async () => {
      await result.current.connect();
    });

    act(() => {
      result.current.disconnect();
    });

    expect(result.current.state).toBe('idle');
  });

  it('handles token fetch error', async () => {
    mockGraphql.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useRealtimeVoice(hookParams));

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.state).toBe('error');
    expect(result.current.error).toBe('Network error');
  });

  it('handles missing token in response', async () => {
    mockGraphql.mockResolvedValue({
      data: { getRealtimeToken: { token: null } },
    });

    const { result } = renderHook(() => useRealtimeVoice(hookParams));

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.state).toBe('error');
    expect(result.current.error).toBe('Failed to obtain realtime token');
  });

  it('clears transcript on new connect', async () => {
    mockGraphql.mockResolvedValue({
      data: { getRealtimeToken: { token: 'test-token', expiresAt: '2026-01-01T00:00:00Z' } },
    });

    const { result } = renderHook(() => useRealtimeVoice(hookParams));

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.transcript).toEqual([]);
  });

  it('returns connect and disconnect functions', () => {
    const { result } = renderHook(() => useRealtimeVoice(hookParams));
    expect(typeof result.current.connect).toBe('function');
    expect(typeof result.current.disconnect).toBe('function');
  });

  it('handles getUserMedia failure', async () => {
    mockGraphql.mockResolvedValue({
      data: { getRealtimeToken: { token: 'test-token', expiresAt: '2026-01-01T00:00:00Z' } },
    });
    vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValueOnce(
      new Error('Permission denied'),
    );

    const { result } = renderHook(() => useRealtimeVoice(hookParams));

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.state).toBe('error');
    expect(result.current.error).toBe('Permission denied');
  });

  it('cleans up on unmount', async () => {
    mockGraphql.mockResolvedValue({
      data: { getRealtimeToken: { token: 'test-token', expiresAt: '2026-01-01T00:00:00Z' } },
    });

    const { result, unmount } = renderHook(() => useRealtimeVoice(hookParams));

    await act(async () => {
      await result.current.connect();
    });

    // Unmount should call disconnect
    unmount();
    // No error should be thrown
  });
});
