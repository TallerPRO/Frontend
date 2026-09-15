import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/layout/PageHeader';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { BayStatusLegend } from '../../components/bays/BayStatusLegend';
import { BayGrid } from '../../components/bays/BayGrid';
import { BayDetailModal } from '../../components/bays/BayDetailModal';
import { CancelReservationDialog } from '../../components/bays/CancelReservationDialog';
import { useBays } from '../../hooks/useBays';
import type { Bay } from '../../types/bay.types';

const WORKSHOP_OPTIONS = [
  { value: 'w1', label: 'Providencia' },
  { value: 'w2', label: 'Maipú' },
  { value: 'w3', label: 'La Florida' },
  { value: 'w4', label: 'Ñuñoa' },
  { value: 'w5', label: 'Puente Alto' },
];

export function BaysView() {
  const [workshopId, setWorkshopId] = useState('w1');
  const { bays, summary, loading, cancel } = useBays(workshopId);
  const [selectedBay, setSelectedBay] = useState<Bay | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  function handleSelectBay(bay: Bay) {
    setSelectedBay(bay);
  }

  async function handleCancel(reason: Parameters<typeof cancel>[2], comment?: string) {
    if (!selectedBay?.assignment) return;
    await cancel(selectedBay.id, selectedBay.assignment.reservationId, reason, comment);
    setSelectedBay(null);
  }

  return (
    <>
      <PageHeader
        title="Bahías"
        description="Mapa de bahías de trabajo"
        actions={
          <>
            <Select
              options={WORKSHOP_OPTIONS}
              value={workshopId}
              onChange={(e) => setWorkshopId(e.target.value)}
              aria-label="Taller"
              className="w-44"
            />
            <Button onClick={() => toast.info('Selecciona una orden desde su detalle para reservar una bahía')}>
              <Plus className="h-4 w-4" aria-hidden />
              Reservar bahía
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {summary && <BayStatusLegend summary={summary} />}
          <BayGrid bays={bays} onSelect={handleSelectBay} />
        </div>
      )}

      <BayDetailModal
        open={selectedBay !== null}
        onClose={() => setSelectedBay(null)}
        bay={selectedBay}
        onCancelReservation={() => setCancelDialogOpen(true)}
        onCheckIn={() => {
          toast.info('Check-in disponible cuando el endpoint /check-in esté conectado');
        }}
        onRelease={() => {
          toast.info('Liberar bahía disponible cuando el endpoint /release esté conectado');
        }}
      />

      <CancelReservationDialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        bay={selectedBay}
        onConfirm={handleCancel}
      />
    </>
  );
}
