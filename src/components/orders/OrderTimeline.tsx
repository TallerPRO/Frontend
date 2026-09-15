import { formatDateTime } from '../../lib/formatters';
import type { OrderTimelineEntry } from '../../types/order.types';
import { EmptyState } from '../ui/EmptyState';
import { OrderStatusBadge } from './OrderStatusBadge';

export function OrderTimeline({ entries }: { entries: OrderTimelineEntry[] }) {
  if (entries.length === 0) {
    return <EmptyState title="Sin historial" description="Todavía no hay cambios de estado registrados." />;
  }

  return (
    <ol className="flex flex-col gap-4">
      {entries.map((entry, index) => (
        <li key={entry.id} className="relative flex gap-3 pl-1">
          <div className="flex flex-col items-center">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-500" aria-hidden />
            {index < entries.length - 1 && <span className="mt-1 w-px flex-1 bg-white/10" aria-hidden />}
          </div>
          <div className="pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <OrderStatusBadge status={entry.status} />
              <span className="text-xs text-gray-500">{formatDateTime(entry.changedAt)}</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">por {entry.changedBy}</p>
            {entry.notes && <p className="mt-1 text-sm text-gray-300">{entry.notes}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
