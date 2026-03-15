'use client';

import { useEffect, useRef } from 'react';
import { configureAmplify } from '@/lib/amplify-config';
import { AuthContext, useAuthProvider } from '@/hooks/useAuth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthProvider();
  const configured = useRef(false);

  useEffect(() => {
    if (!configured.current) {
      configureAmplify();
      configured.current = true;
    }
  }, []);

  return <AuthContext value={auth}>{children}</AuthContext>;
}
