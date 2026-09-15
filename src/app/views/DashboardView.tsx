import { ClipboardList, Clock, DollarSign, Warehouse } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { OrdersByStatusChart } from '../../components/dashboard/OrdersByStatusChart';
import { OrdersTrendChart } from '../../components/dashboard/OrdersTrendChart';
import { WorkshopLoadBar } from '../../components/dashboard/WorkshopLoadBar';
import { RecentOrdersFeed } from '../../components/dashboard/RecentOrdersFeed';
import { formatCurrency } from '../../lib/formatters';
import {
  MOCK_ORDERS_BY_STATUS,
  MOCK_ORDERS_TREND,
  MOCK_RECENT_ORDERS,
  MOCK_WORKSHOP_LOAD,
} from '../../lib/mockDashboard';

// Usa datos de muestra: el endpoint /api/reports/orders/summary llega en la
// Fase 7. Reemplazar los MOCK_* por el resultado real cuando esté listo.
export function DashboardView() {
  return (
    <>
      <PageHeader title="Dashboard" description="Resumen operativo de la red de talleres" />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Órdenes activas" value="58" changePercent={12} icon={ClipboardList} />
        <KpiCard label="Bahías ocupadas" value="24 / 40" changePercent={-4} icon={Warehouse} />
        <KpiCard label="Tiempo prom. reparación" value="2,3 días" changePercent={-8} icon={Clock} />
        <KpiCard label="Ingresos del mes" value={formatCurrency(18420000)} changePercent={6} icon={DollarSign} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <OrdersTrendChart data={MOCK_ORDERS_TREND} />
        <OrdersByStatusChart data={MOCK_ORDERS_BY_STATUS} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <WorkshopLoadBar data={MOCK_WORKSHOP_LOAD} />
        <RecentOrdersFeed orders={MOCK_RECENT_ORDERS} />
      </div>
    </>
  );
}
