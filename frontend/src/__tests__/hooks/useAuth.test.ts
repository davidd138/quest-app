import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuthProvider } from '@/hooks/useAuth';
import { signIn, signUp, signOut, getCurrentUser, confirmSignUp } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';

// The setup.ts already mocks aws-amplify/auth and aws-amplify/api

const mockGraphql = vi.fn();
vi.mocked(generateClient).mockReturnValue({ graphql: mockGraphql } as ReturnType<typeof generateClient>);

const mockUser = {
  userId: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  status: 'active',
  totalPoints: 500,
  questsCompleted: 3,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('useAuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the cached client by re-mocking generateClient
    vi.mocked(generateClient).mockReturnValue({ graphql: mockGraphql } as ReturnType<typeof generateClient>);
  });

  it('returns loading true initially', () => {
    vi.mocked(getCurrentUser).mockImplementation(() => new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useAuthProvider());
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('returns user after checkAuth succeeds', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ userId: 'user-1', username: 'test' } as Awaited<ReturnType<typeof getCurrentUser>>);
    mockGraphql.mockResolvedValue({ data: { syncUser: mockUser } });

    const { result } = renderHook(() => useAuthProvider());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
  });

  it('sets user to null when getCurrentUser fails', async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(new Error('Not authenticated'));

    const { result } = renderHook(() => useAuthProvider());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
  });

  it('handles sign in and calls syncUser', async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(new Error('Not authenticated'));
    vi.mocked(signIn).mockResolvedValue({ isSignedIn: true, nextStep: { signInStep: 'DONE' } } as Awaited<ReturnType<typeof signIn>>);
    vi.mocked(signOut).mockResolvedValue(undefined);
    mockGraphql.mockResolvedValue({ data: { syncUser: mockUser } });

    const { result } = renderHook(() => useAuthProvider());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.signIn('test@example.com', 'password123');
    });

    expect(signIn).toHaveBeenCalledWith({ username: 'test@example.com', password: 'password123' });
    expect(mockGraphql).toHaveBeenCalled();
    expect(result.current.user).toEqual(mockUser);
  });

  it('sets error on sign in failure', async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(new Error('Not authenticated'));
    vi.mocked(signOut).mockResolvedValue(undefined);
    vi.mocked(signIn).mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuthProvider());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.signIn('bad@example.com', 'wrong');
      }),
    ).rejects.toThrow('Invalid credentials');

    expect(result.current.error).toBe('Invalid credentials');
  });

  it('sign out clears user', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ userId: 'user-1', username: 'test' } as Awaited<ReturnType<typeof getCurrentUser>>);
    vi.mocked(signOut).mockResolvedValue(undefined);
    mockGraphql.mockResolvedValue({ data: { syncUser: mockUser } });

    const { result } = renderHook(() => useAuthProvider());

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBeNull();
    expect(signOut).toHaveBeenCalled();
  });

  it('handles sign up that requires confirmation', async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(new Error('Not authenticated'));
    vi.mocked(signUp).mockResolvedValue({
      isSignUpComplete: false,
      nextStep: { signUpStep: 'CONFIRM_SIGN_UP', codeDeliveryDetails: {} },
      userId: 'user-1',
    } as unknown as Awaited<ReturnType<typeof signUp>>);

    const { result } = renderHook(() => useAuthProvider());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let completed: boolean | undefined;
    await act(async () => {
      completed = await result.current.signUp('test@example.com', 'password123', 'Test User');
    });

    expect(completed).toBe(false);
    expect(result.current.needsConfirmation).toBe(true);
    expect(result.current.pendingEmail).toBe('test@example.com');
  });

  it('handles sign up that completes immediately', async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(new Error('Not authenticated'));
    vi.mocked(signUp).mockResolvedValue({
      isSignUpComplete: true,
      nextStep: { signUpStep: 'DONE' },
      userId: 'user-1',
    } as unknown as Awaited<ReturnType<typeof signUp>>);
    vi.mocked(signIn).mockResolvedValue({ isSignedIn: true, nextStep: { signInStep: 'DONE' } } as Awaited<ReturnType<typeof signIn>>);
    mockGraphql.mockResolvedValue({ data: { syncUser: mockUser } });

    const { result } = renderHook(() => useAuthProvider());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let completed: boolean | undefined;
    await act(async () => {
      completed = await result.current.signUp('test@example.com', 'password123', 'Test User');
    });

    expect(completed).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('confirms account and signs in', async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(new Error('Not authenticated'));
    vi.mocked(signUp).mockResolvedValue({
      isSignUpComplete: false,
      nextStep: { signUpStep: 'CONFIRM_SIGN_UP', codeDeliveryDetails: {} },
      userId: 'user-1',
    } as unknown as Awaited<ReturnType<typeof signUp>>);
    vi.mocked(confirmSignUp).mockResolvedValue({ isSignUpComplete: true, nextStep: { signUpStep: 'DONE' } } as Awaited<ReturnType<typeof confirmSignUp>>);
    vi.mocked(signIn).mockResolvedValue({ isSignedIn: true, nextStep: { signInStep: 'DONE' } } as Awaited<ReturnType<typeof signIn>>);
    mockGraphql.mockResolvedValue({ data: { syncUser: mockUser } });

    const { result } = renderHook(() => useAuthProvider());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signUp('test@example.com', 'password123', 'Test User');
    });

    expect(result.current.needsConfirmation).toBe(true);

    await act(async () => {
      await result.current.confirmAccount('123456');
    });

    expect(confirmSignUp).toHaveBeenCalledWith({
      username: 'test@example.com',
      confirmationCode: '123456',
    });
    expect(result.current.needsConfirmation).toBe(false);
    expect(result.current.user).toEqual(mockUser);
  });

  it('returns error as null initially', async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(new Error('Not authenticated'));

    const { result } = renderHook(() => useAuthProvider());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
  });
});
