import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { formatCurrency } from '../../lib/formatters';
import type { RevenueByWorkshop } from '../../types/report.types';

const compactCurrency = new Intl.NumberFormat('es-CL', { notation: 'compact', maximumFractionDigits: 1 });

export function RevenueByWorkshopChart({ data }: { data: RevenueByWorkshop[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos por taller</CardTitle>
      </CardHeader>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -10 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="workshopName" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
            <YAxis
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              tickFormatter={(value: number) => `$${compactCurrency.format(value)}`}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              contentStyle={{ background: '#1A2332', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
              itemStyle={{ color: '#E5E7EB' }}
              labelStyle={{ color: '#9CA3AF' }}
              formatter={(value) => [formatCurrency(Number(value)), 'Ingresos']}
            />
            <Bar dataKey="revenue" fill="#E07B1A" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
