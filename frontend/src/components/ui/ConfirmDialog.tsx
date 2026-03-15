'use client';

import React, { useState, useCallback } from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';

type ConfirmVariant = 'danger' | 'warning';

interface ConfirmDialogProps {
  /** Whether the dialog is visible. */
  isOpen: boolean;
  /** Dialog title. */
  title: string;
  /** Descriptive message. */
  message: string;
  /** Label for the confirm button. */
  confirmLabel?: string;
  /** Label for the cancel button. */
  cancelLabel?: string;
  /** Visual variant — controls icon and confirm-button color. */
  variant?: ConfirmVariant;
  /**
   * When set, the user must type this exact string to enable the confirm button.
   * Useful for irreversible destructive actions.
   */
  typeToConfirm?: string;
  /** Called when the user confirms. May return a Promise (shows loading state). */
  onConfirm: () => void | Promise<void>;
  /** Called when the user cancels or closes the dialog. */
  onCancel: () => void;
}

const variantConfig: Record<
  ConfirmVariant,
  { icon: typeof AlertTriangle; iconBg: string; iconColor: string; buttonVariant: 'danger' | 'primary' }
> = {
  danger: {
    icon: ShieldAlert,
    iconBg: 'bg-rose-500/10 border-rose-500/20',
    iconColor: 'text-rose-400',
    buttonVariant: 'danger',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    iconColor: 'text-amber-400',
    buttonVariant: 'primary',
  },
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  typeToConfirm,
  onConfirm,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const config = variantConfig[variant];
  const Icon = config.icon;

  const isConfirmEnabled = typeToConfirm
    ? confirmText === typeToConfirm
    : true;

  const handleConfirm = useCallback(async () => {
    if (!isConfirmEnabled) return;
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      setConfirmText('');
    }
  }, [isConfirmEnabled, onConfirm]);

  const handleCancel = useCallback(() => {
    setConfirmText('');
    onCancel();
  }, [onCancel]);

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} size="sm">
      <div className="text-center">
        {/* Icon */}
        <div
          className={[
            'mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border',
            config.iconBg,
          ].join(' ')}
        >
          <Icon size={24} className={config.iconColor} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>

        {/* Message */}
        <p className="text-sm text-slate-400 leading-relaxed mb-5">
          {message}
        </p>

        {/* Type-to-confirm */}
        {typeToConfirm && (
          <div className="mb-5 text-left">
            <p className="text-xs text-slate-500 mb-2">
              Escribe{' '}
              <code className="px-1.5 py-0.5 rounded bg-white/10 text-rose-300 font-mono text-xs">
                {typeToConfirm}
              </code>{' '}
              para confirmar:
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={typeToConfirm}
              aria-label={`Escribe "${typeToConfirm}" para confirmar`}
              autoComplete="off"
              autoFocus
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={handleCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={config.buttonVariant}
            size="md"
            onClick={handleConfirm}
            loading={loading}
            disabled={!isConfirmEnabled}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
