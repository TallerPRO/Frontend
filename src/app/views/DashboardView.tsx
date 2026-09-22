import { useState } from 'react';
import { ClipboardList, Clock, DollarSign, UserPlus, Warehouse } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { OrdersByStatusChart } from '../../components/dashboard/OrdersByStatusChart';
import { OrdersTrendChart } from '../../components/dashboard/OrdersTrendChart';
import { WorkshopLoadBar } from '../../components/dashboard/WorkshopLoadBar';
import { RecentOrdersFeed } from '../../components/dashboard/RecentOrdersFeed';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { Spinner } from '../../components/ui/Spinner';
import { formatCurrency } from '../../lib/formatters';
import { useOrdersSummary } from '../../hooks/useReports';
import { useOrders } from '../../hooks/useOrders';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { MechanicFormModal } from '../../components/mechanics/MechanicFormModal';
import { useMechanics } from '../../hooks/useMechanics';
import { DEFAULT_WORKSHOP_ID } from '../../lib/workshops';

const days = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 1 });

// KPIs y gráficos vienen de ms-tallerpro-report (/api/report/kpis) y el feed
// de órdenes recientes de ms-tallerpro-jobs, ambos vía gateway.
export function DashboardView() {
  const navigate = useNavigate();
  const { summary, loading, error } = useOrdersSummary();
  const { orders: recentOrders } = useOrders({ size: 5 });
  // El alta de mecánicos vive aquí para tenerla a mano al abrir el turno; la
  // lista se consume después al confirmar la llegada de un vehículo.
  const { mechanics, save: saveMechanic } = useMechanics(DEFAULT_WORKSHOP_ID);
  const [mechanicFormOpen, setMechanicFormOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Resumen operativo de la red de talleres"
        actions={
          <Button variant="secondary" onClick={() => setMechanicFormOpen(true)}>
            <UserPlus className="h-4 w-4" aria-hidden />
            Nuevo mecánico
            {mechanics.length > 0 && <span className="ml-1 text-xs text-gray-400">({mechanics.length})</span>}
          </Button>
        }
      />
      <ErrorBanner message={error} />

      <MechanicFormModal
        open={mechanicFormOpen}
        mechanic={null}
        onClose={() => setMechanicFormOpen(false)}
        onSubmit={(dto) => saveMechanic(dto)}
      />

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
            <RecentOrdersFeed orders={recentOrders} onSelect={(order) => navigate(`/orders/${order.id}`)} />
          </div>
        </>
      )}
    </>
  );
}
