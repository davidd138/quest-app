import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGeolocation } from '@/hooks/useGeolocation';

// Store the callbacks so we can trigger them
let successCallback: PositionCallback;
let errorCallback: PositionErrorCallback;

const mockGetCurrentPosition = vi.fn(
  (success: PositionCallback, error: PositionErrorCallback) => {
    successCallback = success;
    errorCallback = error;
  },
);

describe('useGeolocation', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: mockGetCurrentPosition,
      },
      configurable: true,
      writable: true,
    });
  });

  it('returns null position initially', () => {
    const { result } = renderHook(() => useGeolocation());

    expect(result.current.position).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets position after permission granted', () => {
    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestLocation();
    });

    expect(result.current.loading).toBe(true);

    act(() => {
      successCallback({
        coords: {
          latitude: 40.4168,
          longitude: -3.7038,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      });
    });

    expect(result.current.position).toEqual({
      lat: 40.4168,
      lng: -3.7038,
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles denied permission', () => {
    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestLocation();
    });

    act(() => {
      errorCallback({
        code: 1, // PERMISSION_DENIED
        message: 'User denied Geolocation',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      });
    });

    expect(result.current.position).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toContain('permission denied');
  });

  it('handles position unavailable', () => {
    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestLocation();
    });

    act(() => {
      errorCallback({
        code: 2, // POSITION_UNAVAILABLE
        message: 'Position unavailable',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      });
    });

    expect(result.current.position).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toContain('unavailable');
  });

  it('sets error when geolocation is not supported', () => {
    Object.defineProperty(navigator, 'geolocation', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestLocation();
    });

    expect(result.current.error).toContain('not supported');
    expect(result.current.loading).toBe(false);
  });
});
