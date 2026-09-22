import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { createBay, deactivateBay, listAllBays, updateBay } from '../api/bays.api';
import { errorMessage } from '../api/client';
import type { Bay, BayDTO } from '../types/bay.types';

// Alta, edición y baja de bahías para la pantalla de Configuración.
// A diferencia de useBays (vista operativa), aquí se listan también las
// desactivadas y no hay refresco automático: los cambios son manuales.
export function useBayAdmin(workshopId?: string) {
  const [bays, setBays] = useState<Bay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBays = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listAllBays(workshopId);
      // Orden estable por código para que la tabla no salte al editar.
      setBays(list.sort((a, b) => a.code.localeCompare(b.code, 'es', { numeric: true })));
      setError(null);
    } catch (err) {
      setError(errorMessage(err, 'No pudimos cargar las bahías.'));
    } finally {
      setLoading(false);
    }
  }, [workshopId]);

  useEffect(() => {
    fetchBays();
  }, [fetchBays]);

  async function save(dto: BayDTO, existing?: Bay) {
    if (existing) await updateBay(existing.id, dto, workshopId);
    else await createBay(dto, workshopId);
    toast.success(existing ? 'Bahía actualizada' : 'Bahía creada');
    await fetchBays();
  }

  async function deactivate(bay: Bay) {
    await deactivateBay(bay.id, workshopId);
    toast.success(`Bahía ${bay.code} dada de baja`);
    await fetchBays();
  }

  /** Códigos ya usados en el taller: sirven para avisar del duplicado en el formulario. */
  function usedCodes(excludeId?: string): string[] {
    return bays.filter((b) => b.id !== excludeId).map((b) => b.code.toUpperCase());
  }

  return { bays, loading, error, refetch: fetchBays, save, deactivate, usedCodes };
}
