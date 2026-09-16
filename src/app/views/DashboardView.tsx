import { ClipboardList, Clock, DollarSign, Warehouse } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { OrdersByStatusChart } from '../../components/dashboard/OrdersByStatusChart';
import { OrdersTrendChart } from '../../components/dashboard/OrdersTrendChart';
import { WorkshopLoadBar } from '../../components/dashboard/WorkshopLoadBar';
import { RecentOrdersFeed } from '../../components/dashboard/RecentOrdersFeed';
import { MockBanner } from '../../components/ui/MockBanner';
import { Spinner } from '../../components/ui/Spinner';
import { formatCurrency } from '../../lib/formatters';
import { useOrdersSummary } from '../../hooks/useReports';
import { MOCK_RECENT_ORDERS } from '../../lib/mockDashboard';

const days = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 1 });

// KPIs y gráficos vienen de /api/reports/orders/summary (con fallback a
// datos de muestra). El feed de órdenes recientes sigue en mock hasta que
// el BFF exponga un listado ordenado por fecha.
export function DashboardView() {
  const { summary, loading, usingMock } = useOrdersSummary();

  return (
    <>
      <PageHeader title="Dashboard" description="Resumen operativo de la red de talleres" />
      <MockBanner visible={usingMock} />

      {loading || !summary ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Órdenes activas"
              value={String(summary.activeOrders)}
              changePercent={summary.activeOrdersChangePercent}
              icon={ClipboardList}
            />
            <KpiCard
              label="Bahías ocupadas"
              value={`${summary.occupiedBays} / ${summary.totalBays}`}
              changePercent={summary.occupiedBaysChangePercent}
              icon={Warehouse}
            />
            <KpiCard
              label="Tiempo prom. reparación"
              value={`${days.format(summary.avgRepairDays)} días`}
              changePercent={summary.avgRepairDaysChangePercent}
              icon={Clock}
            />
            <KpiCard
              label="Ingresos del mes"
              value={formatCurrency(summary.monthRevenue)}
              changePercent={summary.monthRevenueChangePercent}
              icon={DollarSign}
            />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <OrdersTrendChart data={summary.ordersTrend} />
            <OrdersByStatusChart data={summary.ordersByStatus} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <WorkshopLoadBar data={summary.workshopLoad} />
            <RecentOrdersFeed orders={MOCK_RECENT_ORDERS} />
          </div>
        </>
      )}
    </>
  );
}
