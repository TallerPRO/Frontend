import { useCallback, useEffect, useRef, useState } from 'react';
import { getBaysSummary, listBays } from '../api/bays.api';
import { errorMessage } from '../api/client';
import type { Bay, BayOccupancySummary } from '../types/bay.types';

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

  // Sin acciones de estado: la bahía la mueve el avance de la orden.
  return { bays, summary, loading, error, usingMock: false, refetch: () => fetchAll(true) };
}
