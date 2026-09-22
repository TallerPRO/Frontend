import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '../../components/layout/PageHeader';
import { OrderDetailDrawer } from '../../components/orders/OrderDetailDrawer';
import { DiagnosisModal } from '../../components/orders/DiagnosisModal';
import { useOrder } from '../../hooks/useOrders';
import { errorMessage } from '../../api/client';
import type { OrderStatus } from '../../types/order.types';

/**
 * La orden es el único lugar donde avanza el trabajo. Cada transición tiene su
 * efecto en el backend: diagnosticar deja el detalle a cobrar, pasar a
 * reparación ocupa la bahía y avisa al mecánico, lista para retiro libera la
 * bahía y avisa al cliente, y entregar suma el total a los ingresos.
 */
export function OrderDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { order, timeline, loading, changeStatus, diagnose } = useOrder(id);
  const [diagnosisOpen, setDiagnosisOpen] = useState(false);

  async function handleChangeStatus(status: OrderStatus, notes: string) {
    try {
      await changeStatus({ status, notes: notes || undefined });
    } catch (err) {
      toast.error(errorMessage(err, 'No pudimos avanzar la orden.'));
      throw err;
    }
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
        onRequestDiagnosis={() => setDiagnosisOpen(true)}
      />

      <DiagnosisModal
        open={diagnosisOpen}
        order={order}
        onClose={() => setDiagnosisOpen(false)}
        onConfirm={async (body) => {
          try {
            await diagnose({ diagnosis: body.notes ?? '', parts: body.parts, services: body.services });
          } catch (err) {
            toast.error(errorMessage(err, 'No pudimos registrar el diagnóstico.'));
            throw err;
          }
        }}
      />
    </>
  );
}
