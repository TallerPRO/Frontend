import { Badge } from '../ui/Badge';
import { ORDER_STATUS_LABELS, type OrderStatus } from '../../types/order.types';

const STATUS_TONE: Record<OrderStatus, 'blue' | 'purple' | 'yellow' | 'green' | 'emerald' | 'red'> = {
  RECEPCIONADA: 'blue',
  DIAGNOSTICADA: 'purple',
  EN_REPARACION: 'yellow',
  LISTA_RETIRO: 'green',
  ENTREGADA: 'emerald',
  ANULADA: 'red',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{ORDER_STATUS_LABELS[status]}</Badge>;
}
