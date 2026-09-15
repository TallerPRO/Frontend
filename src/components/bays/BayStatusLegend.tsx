import { Card } from '../ui/Card';
import { formatDateTime } from '../../lib/formatters';
import type { BayOccupancySummary } from '../../types/bay.types';

interface BayStatusLegendProps {
  summary: BayOccupancySummary;
}

export function BayStatusLegend({ summary }: BayStatusLegendProps) {
  return (
    <Card className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap gap-5">
        <Counter dotClass="bg-bay-free" label="Disponibles" value={summary.disponibles} />
        <Counter dotClass="bg-bay-reserved" label="Reservadas" value={summary.reservadas} />
        <Counter dotClass="bg-bay-busy" label="Ocupadas" value={summary.ocupadas} />
      </div>

      <div className="flex items-center gap-5 text-sm">
        <div>
          <p className="text-xs text-gray-500">Ocupación</p>
          <p className="font-semibold text-gray-100">{summary.occupancyRate}%</p>
        </div>
        {summary.nextReleaseAt && summary.nextReleaseBayCode && (
          <div>
            <p className="text-xs text-gray-500">Próxima liberación</p>
            <p className="font-medium text-gray-200">
              <span className="font-mono">{summary.nextReleaseBayCode}</span> · {formatDateTime(summary.nextReleaseAt)}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

function Counter({ dotClass, label, value }: { dotClass: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} aria-hidden />
      <span className="text-sm text-gray-300">
        {label} <span className="font-semibold text-gray-100">{value}</span>
      </span>
    </div>
  );
}
