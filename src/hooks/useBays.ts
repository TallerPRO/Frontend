import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { cancelReservation, getBaysSummary, listBays } from '../api/bays.api';
import type { Bay, BayOccupancySummary, CancelReservationReason } from '../types/bay.types';
import { MOCK_BAYS, MOCK_BAYS_SUMMARY } from '../lib/mockBays';

const REFETCH_INTERVAL_MS = 30_000;

export function useBays(workshopId?: string) {
  const [bays, setBays] = useState<Bay[]>([]);
  const [summary, setSummary] = useState<BayOccupancySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const fetchAll = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const [bayList, baySummary] = await Promise.all([listBays(workshopId), getBaysSummary(workshopId)]);
        setBays(bayList);
        setSummary(baySummary);
        setUsingMock(false);
      } catch {
        // Sin BFF todavía: se usan datos de muestra para que la pantalla
        // siga siendo navegable. Ver src/lib/mockBays.ts.
        setBays(MOCK_BAYS);
        setSummary(MOCK_BAYS_SUMMARY);
        setUsingMock(true);
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
    if (usingMock) {
      setBays((prev) =>
        prev.map((b) => (b.id === bayId ? { ...b, status: 'DISPONIBLE', freeSince: new Date().toISOString(), assignment: null } : b)),
      );
      toast.success('Reserva cancelada');
      return;
    }
    await cancelReservation(bayId, reservationId, { reason, comment });
    toast.success('Reserva cancelada');
    await fetchAll(true);
  }

  return { bays, summary, loading, usingMock, refetch: () => fetchAll(true), cancel };
}
