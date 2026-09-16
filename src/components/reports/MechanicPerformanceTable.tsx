import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Table, type Column } from '../ui/Table';
import { Badge } from '../ui/Badge';
import type { MechanicPerformance } from '../../types/report.types';

const percent = new Intl.NumberFormat('es-CL', { style: 'percent', maximumFractionDigits: 0 });

function reworkTone(rate: number) {
  if (rate <= 0.05) return 'green' as const;
  if (rate <= 0.1) return 'yellow' as const;
  return 'red' as const;
}

export function MechanicPerformanceTable({ data, loading }: { data: MechanicPerformance[]; loading: boolean }) {
  const columns: Column<MechanicPerformance>[] = [
    {
      key: 'mechanic',
      header: 'Mecánico',
      render: (m) => (
        <div>
          <p className="text-gray-100">{m.mechanicName}</p>
          <p className="text-xs text-gray-500">{m.workshopName}</p>
        </div>
      ),
      sortable: true,
      sortValue: (m) => m.mechanicName,
    },
    {
      key: 'completedOrders',
      header: 'Órdenes completadas',
      render: (m) => m.completedOrders,
      sortable: true,
      sortValue: (m) => m.completedOrders,
    },
    {
      key: 'avgRepairDays',
      header: 'Tiempo prom.',
      render: (m) => `${m.avgRepairDays.toLocaleString('es-CL')} días`,
      sortable: true,
      sortValue: (m) => m.avgRepairDays,
    },
    {
      key: 'reworkRate',
      header: 'Retrabajo',
      render: (m) => <Badge tone={reworkTone(m.reworkRate)}>{percent.format(m.reworkRate)}</Badge>,
      sortable: true,
      sortValue: (m) => m.reworkRate,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Desempeño por mecánico</CardTitle>
      </CardHeader>
      <Table
        columns={columns}
        data={data}
        rowKey={(m) => m.mechanicId}
        loading={loading}
        emptyTitle="Sin datos para el período"
      />
    </Card>
  );
}
