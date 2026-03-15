/**
 * Security utilities for content sanitization, rate limiting,
 * CSRF protection, and secure storage.
 */

// --- Content Security helpers ---

/**
 * Basic XSS prevention: strips `<script>` blocks and inline event handlers.
 * For rich-text contexts only — prefer `sanitizeInput` for plain form values.
 */
export function sanitizeHTML(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript\s*:/gi, '');
}

// --- Rate limiter ---

/**
 * Sliding-window rate limiter suitable for client-side API-call throttling.
 *
 * @example
 * const limiter = new RateLimiter(10, 60_000); // 10 requests per minute
 * if (!limiter.canMakeRequest()) showToast('Too many requests');
 */
export class RateLimiter {
  private timestamps: number[] = [];

  constructor(
    private maxRequests: number,
    private windowMs: number,
  ) {}

  /** Returns `true` if a request is allowed and records it. */
  canMakeRequest(): boolean {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);
    if (this.timestamps.length >= this.maxRequests) return false;
    this.timestamps.push(now);
    return true;
  }

  /** Time in ms until the next request will be allowed. Returns 0 if allowed now. */
  timeUntilNextRequest(): number {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);
    if (this.timestamps.length < this.maxRequests) return 0;
    const oldest = this.timestamps[0];
    return oldest + this.windowMs - now;
  }

  /** Reset all recorded timestamps. */
  reset(): void {
    this.timestamps = [];
  }
}

// --- CSRF token management ---

/**
 * Generate or retrieve a CSRF token stored in a same-site cookie.
 * The token is a random UUID created on first call and reused for the session.
 */
export function getCSRFToken(): string {
  if (typeof document === 'undefined') return '';

  const cookieName = 'csrf-token';
  const existing = document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${cookieName}=`));

  if (existing) {
    return existing.split('=')[1];
  }

  const token = crypto.randomUUID();
  document.cookie = `${cookieName}=${token}; path=/; SameSite=Strict; Secure`;
  return token;
}

// --- Input sanitization ---

/**
 * Strip angle brackets and trim whitespace — suitable for plain-text form inputs.
 */
export function sanitizeInput(value: string): string {
  return value.trim().replace(/[<>]/g, '');
}

/**
 * Validate and sanitize an email address.
 * Returns the trimmed, lowercased email or `null` if invalid.
 */
export function sanitizeEmail(value: string): string | null {
  const cleaned = value.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(cleaned) ? cleaned : null;
}

// --- Secure storage wrapper ---

/**
 * Thin wrapper around `localStorage` that silently catches quota/access errors
 * (e.g. in private browsing mode or when storage is disabled).
 */
export const secureStorage = {
  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage may be unavailable (private browsing, quota exceeded)
    }
  },

  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  },

  /** Store a JSON-serializable value. */
  setJSON<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore
    }
  },

  /** Retrieve and parse a JSON value. Returns `null` on any failure. */
  getJSON<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
};
