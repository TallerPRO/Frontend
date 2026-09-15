import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { Bay } from '../../types/bay.types';
import { formatDateTime, formatPlate } from '../../lib/formatters';
import { BayCarIcon } from './BayCarIcon';

interface BayDetailModalProps {
  open: boolean;
  onClose: () => void;
  bay: Bay | null;
  onCancelReservation: () => void;
  onCheckIn: () => void;
  onRelease: () => void;
}

export function BayDetailModal({ open, onClose, bay, onCancelReservation, onCheckIn, onRelease }: BayDetailModalProps) {
  if (!bay) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Bahía ${bay.code}`}>
      {bay.status === 'DISPONIBLE' && (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span className="h-2.5 w-2.5 rounded-full bg-bay-free" aria-hidden />
          <p className="text-sm text-gray-200">Esta bahía está disponible.</p>
          {bay.freeSince && (
            <p className="text-xs text-gray-500">Libre desde {formatDateTime(bay.freeSince)}</p>
          )}
        </div>
      )}

      {bay.status === 'RESERVADA' && bay.assignment && (
        <div className="flex flex-col gap-4">
          <AssignmentSummary bay={bay} />
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Field label="Inicio programado" value={formatDateTime(bay.assignment.startsAt)} />
            <Field label="Término estimado" value={formatDateTime(bay.assignment.endsAt)} />
            <Field label="Reservada por" value={bay.assignment.reservedBy} />
            <Field label="Mecánico" value={bay.assignment.mechanicName ?? '—'} />
          </dl>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onCancelReservation}>
              Cancelar reserva
            </Button>
            <Button onClick={onCheckIn}>Confirmar ingreso</Button>
          </div>
        </div>
      )}

      {bay.status === 'OCUPADA' && bay.assignment && (
        <div className="flex flex-col gap-4">
          <AssignmentSummary bay={bay} />
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Field label="Ingresó" value={formatDateTime(bay.assignment.startsAt)} />
            <Field label="Término estimado" value={formatDateTime(bay.assignment.endsAt)} />
            <Field label="Mecánico" value={bay.assignment.mechanicName ?? '—'} />
            <Field label="Avance" value={bay.assignment.progressPercent !== null ? `${bay.assignment.progressPercent}%` : '—'} />
          </dl>
          {bay.assignment.progressPercent !== null && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-brand-500"
                style={{ width: `${bay.assignment.progressPercent}%` }}
              />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button onClick={onRelease}>Liberar bahía</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function AssignmentSummary({ bay }: { bay: Bay }) {
  const assignment = bay.assignment!;
  return (
    <div className="flex items-center gap-3">
      <BayCarIcon bodyType={assignment.bodyType} className="h-14 w-9 shrink-0 text-gray-400" />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-100">{assignment.vehicleLabel}</p>
          <Badge tone="neutral">{formatPlate(assignment.plate)}</Badge>
        </div>
        <p className="text-xs text-gray-400">{assignment.customerName}</p>
        <p className="font-mono text-xs text-gray-500">{assignment.orderFolio}</p>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-gray-200">{value}</dd>
    </div>
  );
}
