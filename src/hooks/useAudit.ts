import { useCallback, useEffect, useMemo, useState } from 'react';
import { listAuditEvents, type AuditQuery } from '../api/audit.api';
import type { AuditEvent } from '../types/audit.types';
import { MOCK_AUDIT_EVENTS } from '../lib/mockAudit';
import { DEFAULT_PAGE_SIZE } from '../lib/constants';

function filterMock(events: AuditEvent[], q: AuditQuery): AuditEvent[] {
  const actor = q.actor?.toLowerCase();
  return events.filter((e) => {
    if (q.action && e.action !== q.action) return false;
    if (q.entityType && e.entityType !== q.entityType) return false;
    if (actor && !e.actorName.toLowerCase().includes(actor)) return false;
    if (q.from && e.occurredAt < `${q.from}T00:00:00`) return false;
    if (q.to && e.occurredAt > `${q.to}T23:59:59`) return false;
    return true;
  });
}

export function useAudit(initialQuery: AuditQuery = {}) {
  const [query, setQuery] = useState<AuditQuery>({ size: DEFAULT_PAGE_SIZE, page: 0, ...initialQuery });
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listAuditEvents(query);
      setEvents(result.content);
      setTotalPages(result.totalPages);
      setUsingMock(false);
    } catch {
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const mockPage = useMemo(() => {
    const filtered = filterMock(MOCK_AUDIT_EVENTS, query);
    const size = query.size ?? DEFAULT_PAGE_SIZE;
    const page = query.page ?? 0;
    return {
      content: filtered.slice(page * size, page * size + size),
      totalPages: Math.max(1, Math.ceil(filtered.length / size)),
    };
  }, [query]);

  function setFilters(filters: Partial<Omit<AuditQuery, 'page' | 'size'>>) {
    setQuery((q) => ({ ...q, ...filters, page: 0 }));
  }

  function setPage(page: number) {
    setQuery((q) => ({ ...q, page }));
  }

  return {
    events: usingMock ? mockPage.content : events,
    page: query.page ?? 0,
    totalPages: usingMock ? mockPage.totalPages : totalPages,
    loading,
    usingMock,
    filters: query,
    setFilters,
    setPage,
    refetch: fetchEvents,
  };
}
