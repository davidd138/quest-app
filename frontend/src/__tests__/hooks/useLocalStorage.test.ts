import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns initial value when nothing in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    // Before hydration, returns initialValue
    expect(result.current[0]).toBe('default');
  });

  it('sets value in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    act(() => {
      result.current[1]('new-value');
    });

    expect(result.current[0]).toBe('new-value');
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('new-value'));
  });

  it('reads existing value from localStorage', () => {
    localStorage.setItem('existing-key', JSON.stringify('stored-value'));

    const { result } = renderHook(() => useLocalStorage('existing-key', 'default'));

    // After hydration (useEffect runs), should read stored value
    expect(result.current[0]).toBe('stored-value');
  });

  it('handles JSON serialization for objects', () => {
    const { result } = renderHook(() =>
      useLocalStorage('obj-key', { name: 'Alice', score: 0 }),
    );

    act(() => {
      result.current[1]({ name: 'Alice', score: 100 });
    });

    expect(result.current[0]).toEqual({ name: 'Alice', score: 100 });
    expect(JSON.parse(localStorage.getItem('obj-key')!)).toEqual({
      name: 'Alice',
      score: 100,
    });
  });

  it('handles JSON serialization for arrays', () => {
    const { result } = renderHook(() => useLocalStorage<string[]>('arr-key', []));

    act(() => {
      result.current[1](['a', 'b', 'c']);
    });

    expect(result.current[0]).toEqual(['a', 'b', 'c']);
    expect(JSON.parse(localStorage.getItem('arr-key')!)).toEqual(['a', 'b', 'c']);
  });

  it('supports functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);

    act(() => {
      result.current[1]((prev) => prev + 5);
    });

    expect(result.current[0]).toBe(6);
  });

  it('responds to cross-tab storage events', () => {
    const { result } = renderHook(() => useLocalStorage('sync-key', 'initial'));

    // Simulate cross-tab storage event
    act(() => {
      const event = new StorageEvent('storage', {
        key: 'sync-key',
        newValue: JSON.stringify('updated-from-another-tab'),
      });
      window.dispatchEvent(event);
    });

    expect(result.current[0]).toBe('updated-from-another-tab');
  });

  it('ignores storage events for different keys', () => {
    const { result } = renderHook(() => useLocalStorage('my-key', 'mine'));

    act(() => {
      result.current[1]('my-value');
    });

    // Fire event for a different key
    act(() => {
      const event = new StorageEvent('storage', {
        key: 'other-key',
        newValue: JSON.stringify('other-value'),
      });
      window.dispatchEvent(event);
    });

    expect(result.current[0]).toBe('my-value');
  });

  it('removeValue resets to initial and clears localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('remove-key', 'default'));

    act(() => {
      result.current[1]('something');
    });

    expect(result.current[0]).toBe('something');

    // Call removeValue (third element)
    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe('default');
    expect(localStorage.getItem('remove-key')).toBeNull();
  });
});
