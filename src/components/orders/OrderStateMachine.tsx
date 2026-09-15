import { Check } from 'lucide-react';
import { cn } from '../../lib/cn';
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS, type OrderStatus } from '../../types/order.types';
import { Badge } from '../ui/Badge';

export function OrderStateMachine({ status }: { status: OrderStatus }) {
  if (status === 'ANULADA') {
    return (
      <div className="flex items-center gap-2">
        <Badge tone="red">Orden anulada</Badge>
        <span className="text-xs text-gray-400">El flujo normal fue interrumpido.</span>
      </div>
    );
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(status);

  return (
    <ol className="flex flex-wrap items-center gap-2" aria-label="Flujo de la orden">
      {ORDER_STATUS_FLOW.map((step, index) => {
        const isDone = index < currentIndex;
        const isActive = index === currentIndex;

        return (
          <li key={step} className="flex items-center gap-2">
            <div
              className={cn(
                'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium',
                isActive && 'border-brand-500 bg-brand-500/10 text-brand-500',
                isDone && 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
                !isActive && !isDone && 'border-white/10 text-gray-400',
              )}
            >
              {isDone ? (
                <Check className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    isActive ? 'bg-brand-500' : 'bg-gray-600',
                  )}
                  aria-hidden
                />
              )}
              {ORDER_STATUS_LABELS[step]}
            </div>
            {index < ORDER_STATUS_FLOW.length - 1 && (
              <div className={cn('h-px w-6', isDone ? 'bg-emerald-500/40' : 'bg-white/10')} aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}
