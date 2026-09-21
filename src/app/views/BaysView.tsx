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
import { DEFAULT_WORKSHOP_ID, WORKSHOP_OPTIONS } from '../../lib/workshops';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { errorMessage } from '../../api/client';

export function BaysView() {
  const [workshopId, setWorkshopId] = useState(DEFAULT_WORKSHOP_ID);
  const { bays, summary, loading, error, cancel, checkIn, release } = useBays(workshopId);
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

  async function run(action: () => Promise<void>) {
    try {
      await action();
      setSelectedBay(null);
    } catch (err) {
      toast.error(errorMessage(err));
    }
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

      <ErrorBanner message={error} />

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
        onCheckIn={() => selectedBay && run(() => checkIn(selectedBay.id))}
        onRelease={() => selectedBay && run(() => release(selectedBay.id))}
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
