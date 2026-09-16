import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import type { ReportPeriod } from '../../types/report.types';

interface ReportFiltersProps {
  period: ReportPeriod;
  onChange: (period: ReportPeriod) => void;
}

export function ReportFilters({ period, onChange }: ReportFiltersProps) {
  return (
    <Card className="mb-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input
          label="Desde"
          type="date"
          value={period.from}
          max={period.to}
          onChange={(e) => onChange({ ...period, from: e.target.value })}
        />
        <Input
          label="Hasta"
          type="date"
          value={period.to}
          min={period.from}
          onChange={(e) => onChange({ ...period, to: e.target.value })}
        />
        <Input
          label="Taller"
          placeholder="Todos los talleres"
          value={period.workshopId ?? ''}
          onChange={(e) => onChange({ ...period, workshopId: e.target.value || undefined })}
        />
      </div>
    </Card>
  );
}
