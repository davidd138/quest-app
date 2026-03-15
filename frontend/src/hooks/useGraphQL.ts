'use client';

import { useCallback, useState } from 'react';
import { generateClient } from 'aws-amplify/api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: any = null;
function getClient() {
  if (!_client) _client = generateClient();
  return _client;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useQuery<T = any>(query: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const execute = useCallback(async (variables?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getClient().graphql({ query, variables });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = (result as any).data;
      const key = Object.keys(d)[0];
      setData(d[key]);
      return d[key] as T;
    } catch (e: unknown) {
      const err = e as { errors?: { message: string }[]; message?: string };
      const msg = err?.errors?.[0]?.message || err?.message || 'Error';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [query]);

  return { data, loading, error, execute };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useMutation<T = any>(mutation: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const execute = useCallback(async (variables?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getClient().graphql({ query: mutation, variables });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = (result as any).data;
      const key = Object.keys(d)[0];
      return d[key] as T;
    } catch (e: unknown) {
      const err = e as { errors?: { message: string }[]; message?: string };
      const msg = err?.errors?.[0]?.message || err?.message || 'Error';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [mutation]);

  return { loading, error, execute };
}
