import { useState } from 'react';
import { ClipboardPlus, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { BayFormModal } from '../../components/settings/BayFormModal';
import { useBayAdmin } from '../../hooks/useBayAdmin';
import { PageHeader } from '../../components/layout/PageHeader';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { BayStatusLegend } from '../../components/bays/BayStatusLegend';
import { BayGrid } from '../../components/bays/BayGrid';
import { BayDetailModal } from '../../components/bays/BayDetailModal';
import { useBays } from '../../hooks/useBays';
import type { Bay } from '../../types/bay.types';
import { DEFAULT_WORKSHOP_ID, WORKSHOP_OPTIONS } from '../../lib/workshops';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { errorMessage } from '../../api/client';
import { useAuth } from '../../auth/useAuth';
import { Role } from '../../auth/roles';

/**
 * Mapa de bahías: solo consulta y alta. El estado de cada bahía lo mueve el
 * avance de su orden (reparación ocupa, lista para retiro libera), nunca esta
 * pantalla, para que el puesto físico y la orden no puedan contradecirse.
 */
export function BaysView() {
  const [workshopId, setWorkshopId] = useState(DEFAULT_WORKSHOP_ID);
  // El alta de bahias la exige catalog con rol Admin; recepcionar, Admin o JefeTaller.
  const { tieneRol } = useAuth();
  const puedeCrearBahia = tieneRol(Role.ADMIN);
  const puedeRecepcionar = tieneRol(Role.ADMIN, Role.JEFE_TALLER);
  const { bays, summary, loading, error, refetch } = useBays(workshopId);
  const [selectedBay, setSelectedBay] = useState<Bay | null>(null);
  const navigate = useNavigate();
  // El alta de bahías se comparte con Configuración: mismo modal y mismo hook,
  // para no tener dos formularios que puedan divergir.
  const { save: saveBay, usedCodes, refetch: refetchBayAdmin } = useBayAdmin(workshopId);
  const [bayFormOpen, setBayFormOpen] = useState(false);

  function handleSelectBay(bay: Bay) {
    setSelectedBay(bay);
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
            {puedeCrearBahia && (
              <Button variant="secondary" onClick={() => setBayFormOpen(true)}>
                <Plus className="h-4 w-4" aria-hidden />
                Nueva bahía
              </Button>
            )}
            {puedeRecepcionar && (
              <Button onClick={() => navigate('/orders/new')}>
                <ClipboardPlus className="h-4 w-4" aria-hidden />
                Recepcionar vehículo
              </Button>
            )}
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

      <BayDetailModal open={selectedBay !== null} onClose={() => setSelectedBay(null)} bay={selectedBay} />

      <BayFormModal
        open={bayFormOpen}
        bay={null}
        usedCodes={usedCodes()}
        onClose={() => setBayFormOpen(false)}
        onSubmit={async (dto) => {
          try {
            await saveBay(dto);
            // El mapa se alimenta de otro hook; hay que refrescar ambos.
            await Promise.all([refetch(), refetchBayAdmin()]);
          } catch (err) {
            toast.error(errorMessage(err, 'No pudimos crear la bahía.'));
            throw err;
          }
        }}
      />
    </>
  );
}
