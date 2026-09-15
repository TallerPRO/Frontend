import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ORDER_STATUS_LABELS, type OrderStatus } from '../../types/order.types';

interface OrderStatusChangeModalProps {
  open: boolean;
  onClose: () => void;
  nextStatus: OrderStatus | null;
  onConfirm: (notes: string) => Promise<void> | void;
}

export function OrderStatusChangeModal({ open, onClose, nextStatus, onConfirm }: OrderStatusChangeModalProps) {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    if (!nextStatus) return;
    setSubmitting(true);
    try {
      await onConfirm(notes);
      setNotes('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Cambiar estado de la orden">
      {nextStatus && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-300">
            La orden pasará a{' '}
            <span className="font-semibold text-gray-100">{ORDER_STATUS_LABELS[nextStatus]}</span>.
          </p>
          <div className="flex flex-col gap-1">
            <label htmlFor="status-notes" className="text-xs font-medium text-gray-300">
              Notas (opcional)
            </label>
            <textarea
              id="status-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalle del cambio de estado…"
              className="w-full rounded-lg border border-white/10 bg-navy-800 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} loading={submitting}>
              Confirmar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
