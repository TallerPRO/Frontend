import type { Bay } from '../../types/bay.types';
import { EmptyState } from '../ui/EmptyState';
import { BayTile } from './BayTile';

interface BayGridProps {
  bays: Bay[];
  onSelect: (bay: Bay) => void;
}

export function BayGrid({ bays, onSelect }: BayGridProps) {
  if (bays.length === 0) {
    return <EmptyState title="Sin bahías" description="Este taller todavía no tiene bahías configuradas." />;
  }

  const sorted = [...bays].sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {sorted.map((bay) => (
        <BayTile key={bay.id} bay={bay} onClick={onSelect} />
      ))}
    </div>
  );
}
