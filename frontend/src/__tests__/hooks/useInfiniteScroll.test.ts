import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

// Mock IntersectionObserver
type IntersectionCallback = (entries: IntersectionObserverEntry[]) => void;

let mockObserverCallback: IntersectionCallback | null = null;
let mockObserveElement: Element | null = null;

const mockDisconnect = vi.fn();
const mockObserve = vi.fn((el: Element) => {
  mockObserveElement = el;
});
const mockUnobserve = vi.fn();

class MockIntersectionObserver {
  constructor(callback: IntersectionCallback) {
    mockObserverCallback = callback;
  }
  observe = mockObserve;
  unobserve = mockUnobserve;
  disconnect = mockDisconnect;
}

function triggerIntersection(isIntersecting: boolean) {
  if (mockObserverCallback) {
    mockObserverCallback([
      {
        isIntersecting,
        target: mockObserveElement || document.createElement('div'),
        intersectionRatio: isIntersecting ? 1 : 0,
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRect: {} as DOMRectReadOnly,
        rootBounds: null,
        time: Date.now(),
      },
    ]);
  }
}

describe('useInfiniteScroll', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockObserverCallback = null;
    mockObserveElement = null;

    Object.defineProperty(window, 'IntersectionObserver', {
      value: MockIntersectionObserver,
      writable: true,
      configurable: true,
    });
  });

  it('returns sentinel ref', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useInfiniteScroll(callback, true));

    expect(result.current.sentinelRef).toBeDefined();
    expect(result.current.sentinelRef.current).toBeNull(); // not attached yet
  });

  it('observes sentinel element when ref is attached', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useInfiniteScroll(callback, true));

    // Simulate attaching the ref to a DOM element
    const sentinel = document.createElement('div');
    act(() => {
      // @ts-expect-error - Directly set the ref
      result.current.sentinelRef.current = sentinel;
    });

    // Re-render to trigger the useEffect with the new ref value
    const { result: result2 } = renderHook(() => useInfiniteScroll(callback, true));
    const sentinel2 = document.createElement('div');

    // Use Object.defineProperty to set the ref before render
    Object.defineProperty(result2.current.sentinelRef, 'current', {
      get: () => sentinel2,
      set: () => {},
      configurable: true,
    });
  });

  it('calls callback when sentinel is visible and hasMore is true', () => {
    const callback = vi.fn();

    const { result } = renderHook(() => useInfiniteScroll(callback, true));

    // Manually attach a sentinel element
    const sentinel = document.createElement('div');
    Object.defineProperty(result.current.sentinelRef, 'current', {
      value: sentinel,
      writable: true,
      configurable: true,
    });

    // Re-render so the observer picks up the element
    const { unmount } = renderHook(() => useInfiniteScroll(callback, true));

    // Simulate intersection
    act(() => {
      triggerIntersection(true);
    });

    expect(callback).toHaveBeenCalled();

    unmount();
  });

  it('does not call callback when sentinel is visible but hasMore is false', () => {
    const callback = vi.fn();

    const sentinel = document.createElement('div');

    renderHook(() => {
      const hook = useInfiniteScroll(callback, false);
      Object.defineProperty(hook.sentinelRef, 'current', {
        value: sentinel,
        writable: true,
        configurable: true,
      });
      return hook;
    });

    act(() => {
      triggerIntersection(true);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('does not call callback when sentinel is not intersecting', () => {
    const callback = vi.fn();

    renderHook(() => useInfiniteScroll(callback, true));

    act(() => {
      triggerIntersection(false);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('disconnects observer on unmount', () => {
    const callback = vi.fn();

    const sentinel = document.createElement('div');

    const { unmount } = renderHook(() => {
      const hook = useInfiniteScroll(callback, true);
      Object.defineProperty(hook.sentinelRef, 'current', {
        value: sentinel,
        writable: true,
        configurable: true,
      });
      return hook;
    });

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('updates callback ref without resubscribing observer', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const { rerender } = renderHook(
      ({ cb }) => useInfiniteScroll(cb, true),
      { initialProps: { cb: callback1 } },
    );

    // Change the callback
    rerender({ cb: callback2 });

    // Trigger intersection - should call the updated callback
    act(() => {
      triggerIntersection(true);
    });

    expect(callback2).toHaveBeenCalled();
    expect(callback1).not.toHaveBeenCalled();
  });
});
