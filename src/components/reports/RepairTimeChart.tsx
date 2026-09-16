import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import type { RepairTimeDatum } from '../../types/report.types';

export function RepairTimeChart({ data }: { data: RepairTimeDatum[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tiempo promedio de reparación (días)</CardTitle>
      </CardHeader>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: -20 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} domain={[0, 'auto']} />
            <Tooltip
              contentStyle={{ background: '#1A2332', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
              itemStyle={{ color: '#E5E7EB' }}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: '#9CA3AF' }} />
            <Line type="monotone" dataKey="avgDays" name="Real" stroke="#E07B1A" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="target" name="Meta" stroke="#9CA3AF" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
