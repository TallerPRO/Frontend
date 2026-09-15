import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { ORDER_STATUS_LABELS, type OrderStatus } from '../../types/order.types';

const STATUS_COLORS: Record<OrderStatus, string> = {
  RECEPCIONADA: '#60A5FA',
  DIAGNOSTICADA: '#A78BFA',
  EN_REPARACION: '#FBBF24',
  LISTA_RETIRO: '#34D399',
  ENTREGADA: '#6EE7B7',
  ANULADA: '#F87171',
};

export interface OrdersByStatusDatum {
  status: OrderStatus;
  count: number;
}

export function OrdersByStatusChart({ data }: { data: OrdersByStatusDatum[] }) {
  const chartData = data.map((d) => ({ name: ORDER_STATUS_LABELS[d.status], value: d.count, status: d.status }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Órdenes por estado</CardTitle>
      </CardHeader>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
              {chartData.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#1A2332', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
              itemStyle={{ color: '#E5E7EB' }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9CA3AF' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
