'use client';

import { useState, useEffect, useCallback } from 'react';

type NotificationPermission = 'default' | 'granted' | 'denied';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

interface NotificationPreferences {
  questUpdates: boolean;
  achievements: boolean;
  social: boolean;
  marketing: boolean;
}

const STORAGE_KEYS = {
  subscription: 'qm-push-subscription',
  preferences: 'qm-notification-preferences',
  badgeCount: 'qm-badge-count',
};

const DEFAULT_PREFERENCES: NotificationPreferences = {
  questUpdates: true,
  achievements: true,
  social: true,
  marketing: false,
};

function getStoredPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.preferences);
    return stored ? JSON.parse(stored) : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function getStoredBadgeCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    return parseInt(localStorage.getItem(STORAGE_KEYS.badgeCount) || '0', 10);
  } catch {
    return 0;
  }
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(false);
  const [preferences, setPreferencesState] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [badgeCount, setBadgeCountState] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setSupported(true);
      setPermission(Notification.permission as NotificationPermission);
    }
    setPreferencesState(getStoredPreferences());
    setBadgeCountState(getStoredBadgeCount());
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!supported) return 'denied';
    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermission);

      if (result === 'granted') {
        // Store subscription flag
        localStorage.setItem(STORAGE_KEYS.subscription, JSON.stringify({ subscribed: true, subscribedAt: new Date().toISOString() }));
      }

      return result as NotificationPermission;
    } catch {
      return 'denied';
    }
  }, [supported]);

  const notify = useCallback(
    ({ title, body, icon, tag, data }: NotificationOptions) => {
      if (!supported || permission !== 'granted') return null;

      try {
        const notification = new Notification(title, {
          body,
          icon: icon || '/icons/icon-192.png',
          tag,
          data,
        });

        // Auto-increment badge
        const newCount = getStoredBadgeCount() + 1;
        localStorage.setItem(STORAGE_KEYS.badgeCount, String(newCount));
        setBadgeCountState(newCount);

        return notification;
      } catch {
        return null;
      }
    },
    [supported, permission],
  );

  const scheduleNotification = useCallback(
    (options: NotificationOptions, delayMs: number) => {
      if (!supported || permission !== 'granted') return null;

      const timeoutId = setTimeout(() => {
        notify(options);
      }, delayMs);

      return timeoutId;
    },
    [supported, permission, notify],
  );

  const clearBadge = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.badgeCount, '0');
    setBadgeCountState(0);
  }, []);

  const setPreferences = useCallback((prefs: Partial<NotificationPreferences>) => {
    setPreferencesState((prev) => {
      const updated = { ...prev, ...prefs };
      localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    permission,
    supported,
    preferences,
    badgeCount,
    requestPermission,
    notify,
    scheduleNotification,
    clearBadge,
    setPreferences,
  };
}
