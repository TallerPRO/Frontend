import type { Order } from '../../types/order.types';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { OrderCard } from '../orders/OrderCard';

export function RecentOrdersFeed({ orders, onSelect }: { orders: Order[]; onSelect?: (order: Order) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimas órdenes</CardTitle>
      </CardHeader>
      {orders.length === 0 ? (
        <EmptyState title="Sin órdenes recientes" />
      ) : (
        <div className="flex flex-col gap-1">
          {orders.slice(0, 5).map((order) => (
            <OrderCard key={order.id} order={order} onClick={() => onSelect?.(order)} />
          ))}
        </div>
      )}
    </Card>
  );
}
