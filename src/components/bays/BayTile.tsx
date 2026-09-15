import type { Bay } from '../../types/bay.types';
import { cn } from '../../lib/cn';
import { BayCarIcon } from './BayCarIcon';

const STATUS_STYLES: Record<Bay['status'], string> = {
  DISPONIBLE: 'border-l-bay-free text-bay-free',
  RESERVADA: 'border-l-bay-reserved text-bay-reserved',
  OCUPADA: 'border-l-bay-busy text-bay-busy',
};

const STATUS_DOT: Record<Bay['status'], string> = {
  DISPONIBLE: 'bg-bay-free',
  RESERVADA: 'bg-bay-reserved',
  OCUPADA: 'bg-bay-busy',
};

interface BayTileProps {
  bay: Bay;
  onClick: (bay: Bay) => void;
}

export function BayTile({ bay, onClick }: BayTileProps) {
  const isFree = bay.status === 'DISPONIBLE';

  return (
    <button
      type="button"
      onClick={() => onClick(bay)}
      className={cn(
        'flex h-28 flex-col justify-between rounded-lg border border-white/10 border-l-4 bg-navy-800 p-3 text-left',
        'transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500',
        isFree && 'border-dashed',
        STATUS_STYLES[bay.status],
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-semibold text-gray-100">{bay.code}</span>
        <span className={cn('h-2 w-2 rounded-full', STATUS_DOT[bay.status])} aria-hidden />
      </div>

      {bay.assignment ? (
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-xs text-gray-300">{bay.assignment.vehicleLabel}</p>
            <p className="font-mono text-xs text-gray-500">{bay.assignment.plate}</p>
          </div>
          <BayCarIcon bodyType={bay.assignment.bodyType} className="h-10 w-6 shrink-0 text-gray-500" />
        </div>
      ) : (
        <p className="text-xs text-gray-500">Disponible</p>
      )}
    </button>
  );
}
