'use client';

import Modal from '@/components/ui/Modal';
import { useI18n } from '@/lib/i18n';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  descriptionKey: string;
}

interface ShortcutGroup {
  titleKey: string;
  shortcuts: ShortcutItem[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    titleKey: 'a11y.general',
    shortcuts: [
      { keys: ['Ctrl', 'K'], descriptionKey: 'a11y.focusSearch' },
      { keys: ['/'], descriptionKey: 'a11y.focusSearch' },
      { keys: ['Esc'], descriptionKey: 'a11y.closeModal' },
      { keys: ['?'], descriptionKey: 'a11y.showShortcuts' },
    ],
  },
  {
    titleKey: 'a11y.navigation',
    shortcuts: [
      { keys: ['g', 'd'], descriptionKey: 'a11y.goToDashboard' },
      { keys: ['g', 'q'], descriptionKey: 'a11y.goToQuests' },
      { keys: ['g', 'l'], descriptionKey: 'a11y.goToLeaderboard' },
    ],
  },
];

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg bg-navy-800 border border-slate-600/50 text-xs font-mono font-medium text-slate-300 shadow-sm">
      {children}
    </kbd>
  );
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  const { t } = useI18n();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('a11y.shortcutsTitle')} size="md">
      <div className="space-y-6" role="document" aria-label={t('a11y.shortcutsTitle')}>
        {shortcutGroups.map((group) => (
          <section key={group.titleKey}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              {t(group.titleKey)}
            </h3>
            <div className="space-y-2">
              {group.shortcuts.map((shortcut) => (
                <div
                  key={shortcut.descriptionKey}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm text-slate-300">{t(shortcut.descriptionKey)}</span>
                  <div className="flex items-center gap-1.5">
                    {shortcut.keys.map((key, i) => (
                      <span key={i} className="flex items-center gap-1">
                        {i > 0 && (
                          <span className="text-slate-600 text-xs" aria-hidden="true">
                            +
                          </span>
                        )}
                        <Kbd>{key}</Kbd>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Modal>
  );
}
