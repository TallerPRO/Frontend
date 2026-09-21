import { useCallback, useEffect, useState } from 'react';
import { listAuditEvents, type AuditQuery } from '../api/audit.api';
import { errorMessage } from '../api/client';
import type { AuditEvent } from '../types/audit.types';
import { DEFAULT_PAGE_SIZE } from '../lib/constants';

// Timeline de auditoría (ms-tallerpro-audit vía gateway).
export function useAudit(initialQuery: AuditQuery = {}) {
  const [query, setQuery] = useState<AuditQuery>({ size: DEFAULT_PAGE_SIZE, page: 0, ...initialQuery });
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listAuditEvents(query);
      setEvents(result.content);
      setTotalPages(result.totalPages);
      setError(null);
    } catch (err) {
      setError(errorMessage(err, 'No pudimos cargar la auditoría.'));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  function setFilters(filters: Partial<Omit<AuditQuery, 'page' | 'size'>>) {
    setQuery((q) => ({ ...q, ...filters, page: 0 }));
  }

  function setPage(page: number) {
    setQuery((q) => ({ ...q, page }));
  }

  return {
    events,
    page: query.page ?? 0,
    totalPages,
    loading,
    error,
    usingMock: false,
    filters: query,
    setFilters,
    setPage,
    refetch: fetchEvents,
  };
}
