'use client';

import { AuthGuard } from '@/components/layout/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { CookieConsent } from '@/components/layout/CookieConsent';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-navy-950">
        <Sidebar />
        <Topbar />
        <main className="lg:pl-[260px] pt-16 min-h-screen">
          <ErrorBoundary>
            <div className="p-4 md:p-6 lg:p-8">{children}</div>
          </ErrorBoundary>
        </main>
        <CookieConsent />
      </div>
    </AuthGuard>
  );
}
