import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sanitizeHTML, sanitizeInput, RateLimiter } from '@/lib/security';

describe('sanitizeHTML', () => {
  it('removes script tags', () => {
    const input = '<p>Hello</p><script>alert("xss")</script><p>World</p>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('<script');
    expect(result).not.toContain('</script>');
    expect(result).toContain('<p>Hello</p>');
    expect(result).toContain('<p>World</p>');
  });

  it('removes nested script tags', () => {
    const input = '<script>var x = "<script>nested</script>";</script>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('alert');
    expect(result).not.toContain('<script');
  });

  it('removes inline event handlers with double quotes', () => {
    const input = '<img src="x" onerror="alert(1)" />';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('alert');
  });

  it('removes inline event handlers with single quotes', () => {
    const input = "<div onclick='stealCookies()'>Click me</div>";
    const result = sanitizeHTML(input);
    expect(result).not.toContain('onclick');
    expect(result).not.toContain('stealCookies');
  });

  it('removes javascript: protocol', () => {
    const input = '<a href="javascript:alert(1)">Click</a>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('javascript:');
  });

  it('preserves safe HTML content', () => {
    const input = '<p>Hello <strong>World</strong></p>';
    expect(sanitizeHTML(input)).toBe(input);
  });
});

describe('sanitizeInput', () => {
  it('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  it('removes angle brackets', () => {
    expect(sanitizeInput('hello <script>')).toBe('hello script');
  });

  it('handles empty strings', () => {
    expect(sanitizeInput('')).toBe('');
  });

  it('handles strings with only whitespace', () => {
    expect(sanitizeInput('   ')).toBe('');
  });

  it('escapes both opening and closing brackets', () => {
    expect(sanitizeInput('<div>content</div>')).toBe('divcontent/div');
  });
});

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests within the limit', () => {
    const limiter = new RateLimiter(3, 1000);
    expect(limiter.canMakeRequest()).toBe(true);
    expect(limiter.canMakeRequest()).toBe(true);
    expect(limiter.canMakeRequest()).toBe(true);
  });

  it('blocks requests over the limit', () => {
    const limiter = new RateLimiter(2, 1000);
    expect(limiter.canMakeRequest()).toBe(true);
    expect(limiter.canMakeRequest()).toBe(true);
    expect(limiter.canMakeRequest()).toBe(false);
  });

  it('resets after the time window passes', () => {
    const limiter = new RateLimiter(1, 1000);
    expect(limiter.canMakeRequest()).toBe(true);
    expect(limiter.canMakeRequest()).toBe(false);

    // Advance past the window
    vi.advanceTimersByTime(1001);
    expect(limiter.canMakeRequest()).toBe(true);
  });

  it('reports correct time until next request', () => {
    const limiter = new RateLimiter(1, 1000);
    expect(limiter.timeUntilNextRequest()).toBe(0);

    limiter.canMakeRequest();
    const wait = limiter.timeUntilNextRequest();
    expect(wait).toBeGreaterThan(0);
    expect(wait).toBeLessThanOrEqual(1000);
  });

  it('manual reset clears all timestamps', () => {
    const limiter = new RateLimiter(1, 60000);
    limiter.canMakeRequest();
    expect(limiter.canMakeRequest()).toBe(false);

    limiter.reset();
    expect(limiter.canMakeRequest()).toBe(true);
  });

  it('uses sliding window correctly', () => {
    const limiter = new RateLimiter(2, 1000);

    // First request at t=0
    limiter.canMakeRequest();

    // Advance 500ms, second request
    vi.advanceTimersByTime(500);
    limiter.canMakeRequest();

    // At t=500, should be blocked
    expect(limiter.canMakeRequest()).toBe(false);

    // At t=1001, first request expires, one slot opens
    vi.advanceTimersByTime(501);
    expect(limiter.canMakeRequest()).toBe(true);
  });
});
