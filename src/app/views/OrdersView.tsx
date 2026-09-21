import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { WORKSHOP_OPTIONS } from '../../lib/workshops';
import { Button } from '../../components/ui/Button';
import { OrderTable } from '../../components/orders/OrderTable';
import { useOrders } from '../../hooks/useOrders';
import { ORDER_STATUS_LABELS, type OrderStatus } from '../../types/order.types';

const STATUS_OPTIONS = (Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((status) => ({
  value: status,
  label: ORDER_STATUS_LABELS[status],
}));

export function OrdersView() {
  const navigate = useNavigate();
  const { orders, page, totalPages, loading, error, filters, setFilters, setPage } = useOrders();

  return (
    <>
      <PageHeader
        title="Órdenes"
        description="Gestión de órdenes de servicio"
        actions={
          <Button onClick={() => navigate('/orders/new')}>
            <Plus className="h-4 w-4" aria-hidden />
            Nueva orden
          </Button>
        }
      />

      <Card className="mb-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select
            label="Estado"
            placeholder="Todos los estados"
            options={STATUS_OPTIONS}
            value={filters.status ?? ''}
            onChange={(e) => setFilters({ status: (e.target.value || undefined) as OrderStatus | undefined })}
          />
          <Select
            label="Taller"
            placeholder="Todos los talleres"
            options={WORKSHOP_OPTIONS}
            value={filters.workshopId ?? ''}
            onChange={(e) => setFilters({ workshopId: e.target.value || undefined })}
          />
        </div>
      </Card>

      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <OrderTable
        orders={orders}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onRowClick={(order) => navigate(`/orders/${order.id}`)}
      />
    </>
  );
}
