'use client';

import React, { useEffect, useState } from 'react';

interface LiveRegionProps {
  /** The message to announce to screen readers */
  message: string;
  /** ARIA live politeness setting */
  politeness?: 'polite' | 'assertive';
  /** Time in ms before clearing the message (0 = never clear) */
  clearAfter?: number;
}

/**
 * ARIA live region that announces dynamic content changes to screen readers.
 * Visually hidden but accessible to assistive technologies.
 */
export default function LiveRegion({
  message,
  politeness = 'polite',
  clearAfter = 5000,
}: LiveRegionProps) {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (!message) {
      setAnnouncement('');
      return;
    }

    // Clear and re-set to force screen readers to re-announce
    setAnnouncement('');
    const setTimer = setTimeout(() => {
      setAnnouncement(message);
    }, 50);

    let clearTimer: ReturnType<typeof setTimeout> | undefined;
    if (clearAfter > 0) {
      clearTimer = setTimeout(() => {
        setAnnouncement('');
      }, clearAfter + 50);
    }

    return () => {
      clearTimeout(setTimer);
      if (clearTimer) clearTimeout(clearTimer);
    };
  }, [message, clearAfter]);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}
