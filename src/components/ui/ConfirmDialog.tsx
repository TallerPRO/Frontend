import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  danger = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-md">
      <p className="text-sm text-gray-300">{description}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={busy}>
          Cancelar
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={handleConfirm} loading={busy}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
