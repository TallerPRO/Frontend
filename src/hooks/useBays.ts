import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { cancelReservation, checkInBay, getBaysSummary, listBays, releaseBay } from '../api/bays.api';
import { errorMessage } from '../api/client';
import type { Bay, BayOccupancySummary, CancelReservationReason } from '../types/bay.types';

const REFETCH_INTERVAL_MS = 30_000;

export function useBays(workshopId?: string) {
  const [bays, setBays] = useState<Bay[]>([]);
  const [summary, setSummary] = useState<BayOccupancySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const fetchAll = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const [bayList, baySummary] = await Promise.all([listBays(workshopId), getBaysSummary(workshopId)]);
        setBays(bayList);
        setSummary(baySummary);
        setError(null);
      } catch (err) {
        setError(errorMessage(err, 'No pudimos cargar las bahías.'));
      } finally {
        setLoading(false);
      }
    },
    [workshopId],
  );

  useEffect(() => {
    fetchAll();
    intervalRef.current = setInterval(() => fetchAll(true), REFETCH_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [fetchAll]);

  async function cancel(bayId: string, reservationId: string, reason: CancelReservationReason, comment?: string) {
    await cancelReservation(bayId, reservationId, { reason, comment }, workshopId);
    toast.success('Reserva cancelada');
    await fetchAll(true);
  }

  async function checkIn(bayId: string) {
    await checkInBay(bayId, workshopId);
    toast.success('Vehículo ingresado a la bahía');
    await fetchAll(true);
  }

  async function release(bayId: string) {
    await releaseBay(bayId, workshopId);
    toast.success('Bahía liberada');
    await fetchAll(true);
  }

  return { bays, summary, loading, error, usingMock: false, refetch: () => fetchAll(true), cancel, checkIn, release };
}
