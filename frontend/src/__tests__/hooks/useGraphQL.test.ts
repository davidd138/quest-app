import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQuery, useMutation } from '@/hooks/useGraphQL';
import { generateClient } from 'aws-amplify/api';

const mockGraphql = vi.fn();
vi.mocked(generateClient).mockReturnValue({ graphql: mockGraphql } as ReturnType<typeof generateClient>);

const TEST_QUERY = 'query GetItems { getItems { id name } }';
const TEST_MUTATION = 'mutation CreateItem($input: CreateItemInput!) { createItem(input: $input) { id name } }';

describe('useQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(generateClient).mockReturnValue({ graphql: mockGraphql } as ReturnType<typeof generateClient>);
  });

  it('returns initial state with loading false and null data', () => {
    const { result } = renderHook(() => useQuery(TEST_QUERY));
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('sets loading true during execute', async () => {
    let resolvePromise: (value: unknown) => void;
    mockGraphql.mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve;
      }),
    );

    const { result } = renderHook(() => useQuery(TEST_QUERY));

    act(() => {
      result.current.execute();
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolvePromise!({ data: { getItems: [{ id: '1', name: 'Item 1' }] } });
    });

    expect(result.current.loading).toBe(false);
  });

  it('sets data after successful execute', async () => {
    const items = [{ id: '1', name: 'Item 1' }, { id: '2', name: 'Item 2' }];
    mockGraphql.mockResolvedValue({ data: { getItems: items } });

    const { result } = renderHook(() => useQuery(TEST_QUERY));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toEqual(items);
    expect(result.current.error).toBeNull();
  });

  it('sets error on failure', async () => {
    mockGraphql.mockRejectedValue({
      errors: [{ message: 'Unauthorized' }],
    });

    const { result } = renderHook(() => useQuery(TEST_QUERY));

    await expect(
      act(async () => {
        await result.current.execute();
      }),
    ).rejects.toBeTruthy();

    expect(result.current.error).toBe('Unauthorized');
    expect(result.current.data).toBeNull();
  });

  it('passes variables to graphql call', async () => {
    mockGraphql.mockResolvedValue({ data: { getItems: [] } });

    const { result } = renderHook(() => useQuery(TEST_QUERY));

    await act(async () => {
      await result.current.execute({ limit: 10, category: 'adventure' });
    });

    expect(mockGraphql).toHaveBeenCalledWith({
      query: TEST_QUERY,
      variables: { limit: 10, category: 'adventure' },
    });
  });

  it('returns the data from execute', async () => {
    const items = [{ id: '1', name: 'Item 1' }];
    mockGraphql.mockResolvedValue({ data: { getItems: items } });

    const { result } = renderHook(() => useQuery(TEST_QUERY));

    let returned: unknown;
    await act(async () => {
      returned = await result.current.execute();
    });

    expect(returned).toEqual(items);
  });

  it('handles error with message field instead of errors array', async () => {
    mockGraphql.mockRejectedValue({ message: 'Network error' });

    const { result } = renderHook(() => useQuery(TEST_QUERY));

    await expect(
      act(async () => {
        await result.current.execute();
      }),
    ).rejects.toBeTruthy();

    expect(result.current.error).toBe('Network error');
  });

  it('sets loading false after error', async () => {
    mockGraphql.mockRejectedValue({ message: 'Failure' });

    const { result } = renderHook(() => useQuery(TEST_QUERY));

    await expect(
      act(async () => {
        await result.current.execute();
      }),
    ).rejects.toBeTruthy();

    expect(result.current.loading).toBe(false);
  });
});

describe('useMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(generateClient).mockReturnValue({ graphql: mockGraphql } as ReturnType<typeof generateClient>);
  });

  it('returns initial state with loading false', () => {
    const { result } = renderHook(() => useMutation(TEST_MUTATION));
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets loading true during execute', async () => {
    let resolvePromise: (value: unknown) => void;
    mockGraphql.mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve;
      }),
    );

    const { result } = renderHook(() => useMutation(TEST_MUTATION));

    act(() => {
      result.current.execute({ input: { name: 'New Item' } });
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolvePromise!({ data: { createItem: { id: '1', name: 'New Item' } } });
    });

    expect(result.current.loading).toBe(false);
  });

  it('returns data from execute', async () => {
    const newItem = { id: '1', name: 'New Item' };
    mockGraphql.mockResolvedValue({ data: { createItem: newItem } });

    const { result } = renderHook(() => useMutation(TEST_MUTATION));

    let returned: unknown;
    await act(async () => {
      returned = await result.current.execute({ input: { name: 'New Item' } });
    });

    expect(returned).toEqual(newItem);
  });

  it('sets error on mutation failure', async () => {
    mockGraphql.mockRejectedValue({
      errors: [{ message: 'Validation error' }],
    });

    const { result } = renderHook(() => useMutation(TEST_MUTATION));

    await expect(
      act(async () => {
        await result.current.execute({ input: { name: '' } });
      }),
    ).rejects.toBeTruthy();

    expect(result.current.error).toBe('Validation error');
  });

  it('passes variables to graphql call', async () => {
    mockGraphql.mockResolvedValue({ data: { createItem: { id: '1', name: 'Test' } } });

    const { result } = renderHook(() => useMutation(TEST_MUTATION));

    await act(async () => {
      await result.current.execute({ input: { name: 'Test' } });
    });

    expect(mockGraphql).toHaveBeenCalledWith({
      query: TEST_MUTATION,
      variables: { input: { name: 'Test' } },
    });
  });

  it('resets error on new execute', async () => {
    mockGraphql.mockRejectedValueOnce({ message: 'First error' });
    mockGraphql.mockResolvedValueOnce({ data: { createItem: { id: '1', name: 'OK' } } });

    const { result } = renderHook(() => useMutation(TEST_MUTATION));

    await expect(
      act(async () => {
        await result.current.execute({ input: { name: '' } });
      }),
    ).rejects.toBeTruthy();

    expect(result.current.error).toBe('First error');

    await act(async () => {
      await result.current.execute({ input: { name: 'Valid' } });
    });

    expect(result.current.error).toBeNull();
  });
});
