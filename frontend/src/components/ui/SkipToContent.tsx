'use client';

import { useI18n } from '@/lib/i18n';

export function SkipToContent() {
  const { t } = useI18n();

  return (
    <a
      href="#main-content"
      className="
        fixed top-0 left-0 z-[100]
        px-6 py-3
        bg-violet-600 text-white text-sm font-semibold
        rounded-br-lg
        transform -translate-y-full
        focus:translate-y-0
        transition-transform duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-violet-600
        shadow-lg
      "
    >
      {t('a11y.skipToContent')}
    </a>
  );
}
