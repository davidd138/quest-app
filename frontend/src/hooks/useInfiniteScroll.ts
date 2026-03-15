'use client';

import { useRef, useEffect, useCallback } from 'react';

/**
 * Infinite scroll hook powered by IntersectionObserver.
 *
 * Attach the returned `sentinelRef` to a sentinel element at the bottom of
 * your list. When the sentinel enters the viewport the `callback` fires,
 * provided `hasMore` is `true`.
 *
 * @example
 * const { sentinelRef } = useInfiniteScroll(loadMore, hasNextPage);
 *
 * return (
 *   <>
 *     {items.map(item => <Card key={item.id} {...item} />)}
 *     <div ref={sentinelRef} />
 *   </>
 * );
 */
export function useInfiniteScroll(
  callback: () => void,
  hasMore: boolean,
  options?: { rootMargin?: string; threshold?: number },
) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const callbackRef = useRef(callback);

  // Keep the callback ref in sync without resubscribing the observer.
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry?.isIntersecting && hasMore) {
        callbackRef.current();
      }
    },
    [hasMore],
  );

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: options?.rootMargin ?? '200px',
      threshold: options?.threshold ?? 0,
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [observerCallback, options?.rootMargin, options?.threshold]);

  return { sentinelRef };
}
