import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { createMechanic, deactivateMechanic, listMechanics, updateMechanic } from '../api/mechanics.api';
import { errorMessage } from '../api/client';
import type { Mechanic, MechanicDTO } from '../types/mechanic.types';

/**
 * Mecánicos del taller: alta desde el Dashboard y lista para asignar trabajo.
 * `onlyActive` en false trae también los dados de baja (vista de administración).
 */
export function useMechanics(workshopId?: string, onlyActive = true) {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMechanics = useCallback(async () => {
    setLoading(true);
    try {
      setMechanics(await listMechanics(workshopId, onlyActive));
      setError(null);
    } catch (err) {
      setError(errorMessage(err, 'No pudimos cargar los mecánicos.'));
    } finally {
      setLoading(false);
    }
  }, [workshopId, onlyActive]);

  useEffect(() => {
    fetchMechanics();
  }, [fetchMechanics]);

  async function save(dto: MechanicDTO, existing?: Mechanic) {
    if (existing) await updateMechanic(existing.id, dto, workshopId);
    else await createMechanic(dto, workshopId);
    toast.success(existing ? 'Mecánico actualizado' : 'Mecánico creado');
    await fetchMechanics();
  }

  async function deactivate(mechanic: Mechanic) {
    await deactivateMechanic(mechanic.id, workshopId);
    toast.success(`${mechanic.name} dado de baja`);
    await fetchMechanics();
  }

  return { mechanics, loading, error, refetch: fetchMechanics, save, deactivate };
}
