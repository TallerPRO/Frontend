import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Order, OrderStatus, OrderTimelineEntry } from '../../types/order.types';
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS } from '../../types/order.types';
import { formatCurrency, formatDate, formatPlate } from '../../lib/formatters';
import { cn } from '../../lib/cn';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderStateMachine } from './OrderStateMachine';
import { OrderTimeline } from './OrderTimeline';
import { OrderStatusChangeModal } from './OrderStatusChangeModal';

interface OrderDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
  timeline: OrderTimelineEntry[];
  loading?: boolean;
  onChangeStatus: (status: OrderStatus, notes: string) => Promise<void> | void;
}

export function OrderDetailDrawer({ open, onClose, order, timeline, loading, onChangeStatus }: OrderDetailDrawerProps) {
  const [visible, setVisible] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => {
      cancelAnimationFrame(frame);
      setVisible(false);
    };
  }, [open]);

  if (!open) return null;

  const currentIndex = order ? ORDER_STATUS_FLOW.indexOf(order.status) : -1;
  const nextStatus =
    order && currentIndex >= 0 && currentIndex < ORDER_STATUS_FLOW.length - 1
      ? ORDER_STATUS_FLOW[currentIndex + 1]
      : null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className={cn('absolute inset-0 bg-black/60 transition-opacity duration-150', visible ? 'opacity-100' : 'opacity-0')}
        onClick={onClose}
        role="presentation"
      />
      <aside
        className={cn(
          'relative flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-white/10 bg-navy-900 p-6',
          'transition-transform duration-150',
          visible ? 'translate-x-0' : 'translate-x-4',
        )}
        aria-label="Detalle de la orden"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 rounded p-1 text-gray-400 hover:bg-white/10 hover:text-gray-200"
        >
          <X className="h-4 w-4" />
        </button>

        {loading || !order ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div>
              <p className="font-mono text-xs text-gray-500">{order.folio}</p>
              <div className="mt-1 flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-100">
                  {order.vehicleBrand} {order.vehicleModel} · {formatPlate(order.vehiclePlate)}
                </h2>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-sm text-gray-400">
                {order.clientName} — {order.clientEmail}
              </p>
            </div>

            <OrderStateMachine status={order.status} />

            {nextStatus && (
              <div className="flex justify-end">
                <Button onClick={() => setPendingStatus(nextStatus)}>
                  Avanzar a {ORDER_STATUS_LABELS[nextStatus]}
                </Button>
              </div>
            )}

            <dl className="grid grid-cols-2 gap-4 rounded-lg border border-white/10 p-4 text-sm">
              <div>
                <dt className="text-xs text-gray-500">Taller</dt>
                <dd className="text-gray-200">{order.workshopName}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Mecánico asignado</dt>
                <dd className="text-gray-200">{order.assignedMechanicName ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Costo estimado</dt>
                <dd className="text-gray-200">{formatCurrency(order.estimatedCost)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Recepción</dt>
                <dd className="text-gray-200">{formatDate(order.receivedAt)}</dd>
              </div>
              {order.diagnosisNotes && (
                <div className="col-span-2">
                  <dt className="text-xs text-gray-500">Diagnóstico</dt>
                  <dd className="text-gray-200">{order.diagnosisNotes}</dd>
                </div>
              )}
            </dl>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-100">Historial</h3>
              <OrderTimeline entries={timeline} />
            </div>
          </div>
        )}
      </aside>

      <OrderStatusChangeModal
        open={pendingStatus !== null}
        onClose={() => setPendingStatus(null)}
        nextStatus={pendingStatus}
        onConfirm={async (notes) => {
          if (pendingStatus) await onChangeStatus(pendingStatus, notes);
        }}
      />
    </div>
  );
}
