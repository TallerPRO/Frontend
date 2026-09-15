import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import type { Bay, CancelReservationReason } from '../../types/bay.types';
import { CANCEL_REASON_LABELS } from '../../types/bay.types';
import { formatDateTime, formatPlate } from '../../lib/formatters';

const REASON_OPTIONS = (Object.keys(CANCEL_REASON_LABELS) as CancelReservationReason[]).map((value) => ({
  value,
  label: CANCEL_REASON_LABELS[value],
}));

interface CancelReservationDialogProps {
  open: boolean;
  onClose: () => void;
  bay: Bay | null;
  onConfirm: (reason: CancelReservationReason, comment?: string) => Promise<void> | void;
}

// Cancela una reserva (bahía RESERVADA): libera la bahía y devuelve la
// orden a RECEPCIONADA. No confundir con "liberar" (bahía OCUPADA).
export function CancelReservationDialog({ open, onClose, bay, onConfirm }: CancelReservationDialogProps) {
  const [reason, setReason] = useState<CancelReservationReason | ''>('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const assignment = bay?.assignment;

  async function handleConfirm() {
    if (!reason) return;
    setSubmitting(true);
    try {
      await onConfirm(reason, comment || undefined);
      setReason('');
      setComment('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Cancelar reserva">
      {assignment && bay && (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-white/10 p-3 text-sm">
            <p className="text-gray-100">
              Bahía <span className="font-mono">{bay.code}</span> · {assignment.vehicleLabel}
            </p>
            <p className="text-xs text-gray-500">
              {formatPlate(assignment.plate)} — {assignment.customerName}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Reservada para {formatDateTime(assignment.startsAt)}
            </p>
          </div>

          <Select
            label="Motivo de la cancelación"
            placeholder="Selecciona un motivo"
            options={REASON_OPTIONS}
            value={reason}
            onChange={(e) => setReason(e.target.value as CancelReservationReason)}
          />

          <div className="flex flex-col gap-1">
            <label htmlFor="cancel-comment" className="text-xs font-medium text-gray-300">
              Comentario (opcional)
            </label>
            <textarea
              id="cancel-comment"
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-navy-800 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
            />
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>Esta acción no se puede deshacer. La bahía quedará disponible y la orden volverá a Recepcionada, sin bahía asignada.</span>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Volver
            </Button>
            <Button variant="danger" onClick={handleConfirm} loading={submitting} disabled={!reason}>
              Confirmar cancelación
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
