import type { Order } from '../../types/order.types';
import { Table, type Column } from '../ui/Table';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRowClick: (order: Order) => void;
}

export function OrderTable({ orders, loading, page, totalPages, onPageChange, onRowClick }: OrderTableProps) {
  const columns: Column<Order>[] = [
    {
      key: 'folio',
      header: 'Folio',
      render: (o) => <span className="font-mono text-xs text-gray-200">{o.folio}</span>,
      sortable: true,
      sortValue: (o) => o.folio,
    },
    {
      key: 'client',
      header: 'Cliente',
      render: (o) => (
        <div>
          <p className="text-gray-100">{o.clientName}</p>
          <p className="font-mono text-xs text-gray-500">{o.vehiclePlate}</p>
        </div>
      ),
    },
    {
      key: 'workshop',
      header: 'Taller',
      render: (o) => o.workshopName,
      sortable: true,
      sortValue: (o) => o.workshopName,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (o) => <OrderStatusBadge status={o.status} />,
    },
    {
      key: 'estimatedCost',
      header: 'Costo estimado',
      render: (o) => formatCurrency(o.estimatedCost),
      sortable: true,
      sortValue: (o) => o.estimatedCost,
    },
    {
      key: 'receivedAt',
      header: 'Recepción',
      render: (o) => formatDate(o.receivedAt),
      sortable: true,
      sortValue: (o) => o.receivedAt,
    },
  ];

  return (
    <Table
      columns={columns}
      data={orders}
      rowKey={(o) => o.id}
      loading={loading}
      emptyTitle="No hay órdenes"
      emptyDescription="Ajusta los filtros o crea una nueva orden."
      page={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
      onRowClick={onRowClick}
    />
  );
}
