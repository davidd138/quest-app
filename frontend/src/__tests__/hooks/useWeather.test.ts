import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useWeather } from '@/hooks/useWeather';

// Reset module-level cache between tests
beforeEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function mockFetchSuccess(data: Record<string, unknown>) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  });
}

function mockFetchError(status: number) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.resolve({}),
  });
}

const sampleApiResponse = {
  current: {
    temperature_2m: 22.5,
    weather_code: 0,
    is_day: 1,
  },
};

const cloudyApiResponse = {
  current: {
    temperature_2m: 15.0,
    weather_code: 3,
    is_day: 1,
  },
};

const rainyNightResponse = {
  current: {
    temperature_2m: 8.0,
    weather_code: 63,
    is_day: 0,
  },
};

describe('useWeather', () => {
  it('returns null weather initially while loading', () => {
    mockFetchSuccess(sampleApiResponse);
    const { result } = renderHook(() => useWeather(40.42, -3.70));

    // Initially loading
    expect(result.current.weather).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('fetches and returns weather data', async () => {
    mockFetchSuccess(sampleApiResponse);
    const { result } = renderHook(() => useWeather(40.42, -3.70));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.weather).not.toBeNull();
    expect(result.current.weather!.temperature).toBe(22.5);
    expect(result.current.weather!.weatherCode).toBe(0);
    expect(result.current.weather!.isDay).toBe(true);
    expect(result.current.weather!.description).toBe('Clear sky');
    expect(result.current.weather!.icon).toBe('sun');
    expect(result.current.error).toBeNull();
  });

  it('maps overcast weather code correctly', async () => {
    mockFetchSuccess(cloudyApiResponse);
    const { result } = renderHook(() => useWeather(41.39, 2.17));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.weather!.description).toBe('Overcast');
    expect(result.current.weather!.icon).toBe('cloud');
  });

  it('maps night icon correctly for rain', async () => {
    mockFetchSuccess(rainyNightResponse);
    const { result } = renderHook(() => useWeather(48.86, 2.35));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.weather!.description).toBe('Moderate rain');
    expect(result.current.weather!.icon).toBe('cloud-rain');
    expect(result.current.weather!.isDay).toBe(false);
  });

  it('handles fetch error', async () => {
    mockFetchError(500);
    const { result } = renderHook(() => useWeather(51.51, -0.13));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.weather).toBeNull();
    expect(result.current.error).toBeTruthy();
    expect(result.current.error).toContain('Weather API error');
  });

  it('uses cached result for same coordinates', async () => {
    mockFetchSuccess(sampleApiResponse);

    // First render fetches
    const { result: result1, unmount } = renderHook(() => useWeather(40.42, -3.70));

    await waitFor(() => {
      expect(result1.current.loading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    unmount();

    // Second render with same coords should use cache
    const { result: result2 } = renderHook(() => useWeather(40.42, -3.70));

    // Should immediately have data from cache (not loading)
    expect(result2.current.weather).not.toBeNull();
    expect(result2.current.loading).toBe(false);

    // Should not have made another fetch call
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
