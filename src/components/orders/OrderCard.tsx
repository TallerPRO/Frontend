import type { Order } from '../../types/order.types';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { OrderStatusBadge } from './OrderStatusBadge';

export function OrderCard({ order, onClick }: { order: Order; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-white/5 px-3 py-2.5 text-left hover:bg-white/5"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-gray-400">{order.folio}</span>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="mt-1 truncate text-sm text-gray-100">
          {order.clientName} · {order.vehicleBrand} {order.vehicleModel}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-medium text-gray-100">{formatCurrency(order.estimatedCost)}</p>
        <p className="text-xs text-gray-500">{formatDate(order.receivedAt)}</p>
      </div>
    </button>
  );
}
