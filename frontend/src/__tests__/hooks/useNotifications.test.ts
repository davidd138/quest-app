import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotifications } from '@/hooks/useNotifications';

// Mock Notification API
const mockNotificationInstance = { close: vi.fn() };

class MockNotification {
  static permission = 'default';
  static requestPermission = vi.fn();
  title: string;
  body?: string;
  icon?: string;
  tag?: string;
  data?: Record<string, unknown>;

  constructor(title: string, options?: NotificationOptions) {
    this.title = title;
    this.body = options?.body;
    this.icon = options?.icon;
    this.tag = options?.tag;
    this.data = options?.data as Record<string, unknown>;
    Object.assign(this, mockNotificationInstance);
  }
}

const localStorageStore: Record<string, string> = {};

const mockLocalStorage = {
  getItem: vi.fn((key: string) => localStorageStore[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageStore[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageStore[key];
  }),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(localStorageStore).forEach((k) => delete localStorageStore[k]);

    Object.defineProperty(window, 'Notification', {
      value: MockNotification,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });

    MockNotification.permission = 'default';
  });

  it('returns correct initial permission', () => {
    MockNotification.permission = 'granted';

    const { result } = renderHook(() => useNotifications());

    // After useEffect runs
    expect(result.current.supported).toBe(true);
    expect(result.current.permission).toBe('granted');
  });

  it('returns default permission when Notification API not available', () => {
    Object.defineProperty(window, 'Notification', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useNotifications());

    expect(result.current.supported).toBe(false);
    expect(result.current.permission).toBe('default');
  });

  it('requestPermission calls Notification API', async () => {
    MockNotification.requestPermission.mockResolvedValue('granted');

    const { result } = renderHook(() => useNotifications());

    let perm: string | undefined;
    await act(async () => {
      perm = await result.current.requestPermission();
    });

    expect(MockNotification.requestPermission).toHaveBeenCalled();
    expect(perm).toBe('granted');
    expect(result.current.permission).toBe('granted');
  });

  it('requestPermission returns denied when not supported', async () => {
    Object.defineProperty(window, 'Notification', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useNotifications());

    let perm: string | undefined;
    await act(async () => {
      perm = await result.current.requestPermission();
    });

    expect(perm).toBe('denied');
  });

  it('notify creates notification when permission is granted', () => {
    MockNotification.permission = 'granted';

    const { result } = renderHook(() => useNotifications());

    let notification: Notification | null = null;
    act(() => {
      notification = result.current.notify({
        title: 'Test Title',
        body: 'Test body',
      });
    });

    expect(notification).not.toBeNull();
    expect((notification as Notification).title).toBe('Test Title');
  });

  it('notify returns null when permission is not granted', () => {
    MockNotification.permission = 'denied';

    const { result } = renderHook(() => useNotifications());

    let notification: Notification | null | undefined;
    act(() => {
      notification = result.current.notify({
        title: 'Test',
        body: 'Test',
      });
    });

    expect(notification).toBeNull();
  });

  it('preferences are saved to localStorage', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.setPreferences({ marketing: true });
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'qm-notification-preferences',
      expect.stringContaining('"marketing":true'),
    );
  });

  it('clearBadge resets badge count to zero', () => {
    localStorageStore['qm-badge-count'] = '5';

    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.clearBadge();
    });

    expect(result.current.badgeCount).toBe(0);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('qm-badge-count', '0');
  });

  it('scheduleNotification returns timeout ID when permitted', () => {
    MockNotification.permission = 'granted';

    const { result } = renderHook(() => useNotifications());

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    act(() => {
      timeoutId = result.current.scheduleNotification(
        { title: 'Later', body: 'Test' },
        5000,
      );
    });

    expect(timeoutId).not.toBeNull();

    // Clean up timer
    if (timeoutId) clearTimeout(timeoutId);
  });
});
