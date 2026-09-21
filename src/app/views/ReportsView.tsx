import { Download } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { Spinner } from '../../components/ui/Spinner';
import { ReportFilters } from '../../components/reports/ReportFilters';
import { RevenueByWorkshopChart } from '../../components/reports/RevenueByWorkshopChart';
import { RepairTimeChart } from '../../components/reports/RepairTimeChart';
import { MechanicPerformanceTable } from '../../components/reports/MechanicPerformanceTable';
import { useReports } from '../../hooks/useReports';
import { downloadCsv } from '../../lib/csv';

export function ReportsView() {
  const { period, setPeriod, revenue, repairTime, mechanics, loading, error } = useReports();

  function exportCsv() {
    downloadCsv(
      `tallerpro-reporte-${period.from}_${period.to}.csv`,
      ['Taller', 'Ingresos', 'Órdenes', 'Ticket promedio'],
      revenue.map((r) => [r.workshopName, r.revenue, r.orders, r.avgTicket]),
    );
  }

  return (
    <>
      <PageHeader
        title="Reportes"
        description="Reportería operativa por período y taller"
        actions={
          <Button variant="secondary" onClick={exportCsv} disabled={loading || revenue.length === 0}>
            <Download className="h-4 w-4" aria-hidden />
            Exportar CSV
          </Button>
        }
      />
      <ErrorBanner message={error} />
      <ReportFilters period={period} onChange={setPeriod} />

      {loading && revenue.length === 0 ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RevenueByWorkshopChart data={revenue} />
            <RepairTimeChart data={repairTime} />
          </div>
          <MechanicPerformanceTable data={mechanics} loading={loading} />
        </>
      )}
    </>
  );
}
