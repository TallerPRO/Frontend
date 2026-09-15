import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { OrderDetailDrawer } from '../../components/orders/OrderDetailDrawer';
import { useOrder } from '../../hooks/useOrders';
import type { OrderStatus } from '../../types/order.types';

export function OrderDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { order, timeline, loading, changeStatus } = useOrder(id);

  async function handleChangeStatus(status: OrderStatus, notes: string) {
    await changeStatus({ status, notes: notes || undefined });
  }

  return (
    <>
      <PageHeader title="Detalle de orden" description={order?.folio} />
      <OrderDetailDrawer
        open
        onClose={() => navigate('/orders')}
        order={order}
        timeline={timeline}
        loading={loading}
        onChangeStatus={handleChangeStatus}
      />
    </>
  );
}
