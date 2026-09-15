import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { CreateOrderForm } from '../../components/orders/CreateOrderForm';
import { useCreateOrder } from '../../hooks/useOrders';
import type { CreateOrderDTO } from '../../types/order.types';

export function CreateOrderView() {
  const navigate = useNavigate();
  const { submit, submitting } = useCreateOrder();

  async function handleSubmit(dto: CreateOrderDTO) {
    try {
      const order = await submit(dto);
      navigate(`/orders/${order.id}`);
    } catch {
      // el hook ya muestra el toast de error
    }
  }

  return (
    <>
      <PageHeader title="Nueva orden" description="Crear una orden de servicio" />
      <CreateOrderForm onSubmit={handleSubmit} submitting={submitting} />
    </>
  );
}
