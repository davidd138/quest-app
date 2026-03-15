'use client';

import { useState, useCallback } from 'react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { CookieConsent } from '@/components/layout/CookieConsent';
import { OnboardingTour } from '@/components/quest/OnboardingTour';
import { SkipToContent } from '@/components/ui/SkipToContent';
import { KeyboardShortcutsHelp } from '@/components/ui/KeyboardShortcutsHelp';
import { I18nProvider } from '@/lib/i18n';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

function AppShell({ children }: { children: React.ReactNode }) {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const toggleShortcuts = useCallback(() => {
    setShortcutsOpen((prev) => !prev);
  }, []);

  useKeyboardShortcuts({ onToggleShortcutsHelp: toggleShortcuts });

  return (
    <div className="min-h-screen bg-navy-950">
      <SkipToContent />
      <Sidebar />
      <Topbar />
      <main id="main-content" className="lg:pl-[260px] pt-16 min-h-screen" tabIndex={-1}>
        <ErrorBoundary>
          <div className="p-4 md:p-6 lg:p-8">{children}</div>
        </ErrorBoundary>
      </main>
      <CookieConsent />
      <OnboardingTour />
      <KeyboardShortcutsHelp isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <I18nProvider>
        <AppShell>{children}</AppShell>
      </I18nProvider>
    </AuthGuard>
  );
}
